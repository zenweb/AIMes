# 20260516 — All-of-Solution Review 后续 TODO

> **来源**：`/review all of solution` 18 项发现中未在 5/16 会话完成的 7 项 + 新发现的 1 项。
> **完成范围**：详见 `_docs/_changelog/20260516-all-of-solution-review-fixes.md`（11 项已修）。
> **优先级**：P1 剩 2 项（push 前补完更安心）+ P2 5 项 + P0-2 RowVersion 替补（push 后 30 天）。
> **执行预估**：CC 协作 ~3-4 小时 + 1 个 EF migration 决策。

---

## P1 仍待修（push 前推荐补完）

### P1-2. TokenBlacklist / SigningKeyStore 持久化

**症状**：`MES.Api/Services/TokenBlacklistService.cs` + `SigningKeyStore.cs` 仅 ConcurrentDictionary 内存态，**API 重启 = 所有撤销 token 复活、轮转密钥重置**。多实例部署各节点状态独立，撤销根本不生效。

**影响**：开源 v0.1 仅适合单实例部署，否则 `/auth/revoke-user` 形同虚设；攻击者只要 token 没过期就能在其他实例继续用。

**v0.1 已做**：在 `_docs/quickstart.md` 第 5 节生产部署清单声明「单实例部署限制」。

**P2 完整修法（~3 小时）**：
1. 加 `IDistributedTokenBlacklist` 接口到 Domain 层，注入 `IDistributedCache`（已配 `AddMemoryCache`，生产换 Redis）
2. blacklist key 用 `aimes:token-blacklist:{jti}`，`SetAsync` 时 absoluteExpiration = JWT exp claim
3. SigningKeyStore.Rotate 把新 key 持久化到 `IDistributedCache` 或专门的 `signing_keys` 表
4. 启动时从存储恢复

**或**：决定开源版就是单实例使用，加构建期 warning：「使用了多实例 docker compose scale 时撤销不可靠」。

---

### P1-6. 前端 axios 双拦截器 + 401 refresh 流程

**症状**：
- `src/main.ts` 给全局 `axios` 注册一套拦截器
- `src/api/http.ts` 给 `http` instance 注册另一套（**和 main.ts 不重叠**）
- 401 时两套都 hard reload 到登录页 — **完全不用 refresh token**，但后端 `/auth/refresh` 端点已实现且 7 天有效

**影响**：用户每 8 小时被踢出登录页（access token 过期），refresh token 7 天有效白白浪费。生产环境工厂操作员每 8 小时被打断 = 工时浪费。

**修法（~30-60min）**：

```ts
// src/api/http.ts 统一拦截器，删除 main.ts 的 axios.interceptors.* 调用

import axios from 'axios'

const http = axios.create({ baseURL: '/api/v1', timeout: 30000 })

let refreshing: Promise<string> | null = null

async function refreshToken(): Promise<string> {
  if (refreshing) return refreshing
  refreshing = (async () => {
    try {
      const refreshTok = localStorage.getItem('aimes_refresh_token')
      if (!refreshTok) throw new Error('no refresh token')
      const r = await axios.post('/api/v1/auth/refresh', { refreshToken: refreshTok })
      localStorage.setItem('aimes_token', r.data.accessToken)
      localStorage.setItem('aimes_refresh_token', r.data.refreshToken)
      return r.data.accessToken
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

http.interceptors.request.use((config) => {
  const tok = localStorage.getItem('aimes_token')
  if (tok) config.headers.Authorization = `Bearer ${tok}`
  return config
})

http.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const orig = error.config
    if (error.response?.status === 401 && !orig._retry) {
      orig._retry = true
      try {
        const newTok = await refreshToken()
        orig.headers.Authorization = `Bearer ${newTok}`
        return http(orig)
      } catch {
        localStorage.removeItem('aimes_token')
        localStorage.removeItem('aimes_refresh_token')
        localStorage.removeItem('aimes_user')
        window.location.href = '/scheduling/login'
      }
    }
    // toast 沿用 main.ts 的逻辑搬过来
    return Promise.reject(error)
  }
)

export default http
```

注意：
- `src/stores/auth.ts` `login()` 需要保存 `aimes_refresh_token`（当前只保存 access token）
- 后端 `/auth/refresh` 已实现，确认 response 字段名（`accessToken` / `refreshToken`）
- 删除 `src/main.ts` 里的 `axios.interceptors.*` 注册段，避免重复

**Acceptance**：登录后等待 access token 过期（dev 环境改短到 5 分钟测试），刷新页面或调用 API 时透明续期，不被踢回登录页。

---

## P2 — Push 后 30 天 TODO

### P2-6. AsNoTracking 展开到单实体 read 路径（Codex 二次评审遗漏）

**Codex 标注的 4 个候选**：
- `MaterialRepository.GetByIdAsync` / `GetByCodeAsync`
- `EquipmentRepository.GetByIdAsync`
- `WorkOrderRepository.GetByIdAsync`
- `ScheduleRepository.GetByIdAsync`

**为何 5/16 没修**：这些 GetById 路径同时被 mutation 路径消费（`InventoryAppService.StockInAsync` → `GetByCodeAsync` → `material.StockIn()` → `UpdateAsync`）。加 `AsNoTracking` 会让 update 路径必须走 `_context.Update(entity)` 强制 attach + **全列更新**（vs 现在的 change tracker 只更新 dirty 列）。

**修法**（~1.5h）：
1. 把 `GetByXxxAsync` 拆成 `GetByXxxForReadAsync`（NoTracking）+ `GetByXxxForUpdateAsync`（保留 tracking）
2. 或：保留单一签名，调用方自行决定是否 attach（侵入更小）
3. AppService 中纯读路径（GetItemByCodeAsync / GetByIdAsync 用于 DTO mapping）切到 NoTracking 版本

**Acceptance**：跑 BenchmarkDotNet 看 GetItemByCode 单查询从 ~3ms 降到 ~1ms（change tracker 开销消失）。

---

### P2-7. IUnitOfWork 引入 IExecutionStrategy 重试

**5/16 撤回 EnableRetryOnFailure 的代价**：网络抖动 / 短暂连接失败时不再自动重试，请求直接 500。临时方案是反代/K8s 层做请求级重试，但部署复杂度↑。

**完整修法（~2h）**：把 `IUnitOfWork` API 改为 lambda 模式：

```csharp
public interface IUnitOfWork
{
    Task<T> ExecuteAsync<T>(Func<CancellationToken, Task<T>> action, CancellationToken ct = default);
    Task ExecuteAsync(Func<CancellationToken, Task> action, CancellationToken ct = default);
}

public sealed class EfUnitOfWork : IUnitOfWork
{
    public async Task<T> ExecuteAsync<T>(Func<CancellationToken, Task<T>> action, CancellationToken ct = default)
    {
        if (!_context.Database.IsRelational())
        {
            return await action(ct);   // InMemory: no transaction, no retry
        }

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            await using var tx = await _context.Database.BeginTransactionAsync(ct);
            var result = await action(ct);
            await tx.CommitAsync(ct);
            return result;
        });
    }
}
```

callsite 重构（InventoryAppService / OperationService）：

```csharp
return await _unitOfWork.ExecuteAsync(async ct =>
{
    var material = await _materialRepo.GetByCodeAsync(...);
    material.StockIn(...);
    await _materialRepo.UpdateAsync(material);
    var tx = CreateTransaction(...);
    await _txRepo.AddAsync(tx, ct);
    return MapTransaction(tx);
}, ct);
```

**注意**：
- 在 PostgreSQL retry 内 mutation 必须幂等 —— 当前业务方法都是 read-then-write 模式，retry 重做整个事务是安全的（material 状态会从 DB 重新加载）
- 重新启用 `EnableRetryOnFailure(5, TimeSpan.FromSeconds(30))`

完成后撤回当前 docs/quickstart.md 的"反代层重试"指引。

---

### P2-1. EF Migrations 与 db/init.sql 双轨

**问题**：4 个 EF Migrations + `db/init.sql + seed.sql` 两套 schema 来源，易漂移。

**修法**：
- 决定保留 EF Migrations 为唯一事实源（推荐）
- 删 `db/init.sql`；`db/seed.sql` 用 EF `HasData()` 替代或迁移到一次性脚本（保留 demo 用）
- `docker-compose.yml` 起 API 时已自动 `MigrateAsync`，不再依赖 init.sql 挂载

**Effort**：~1.5h（导出现有 init.sql 内容比对 EF 模型差异 + 写 HasData seed）

---

### P2-2. Pro/Core 物理分包

**问题**：`MES.AI.Core` 和 `MES.AI.Pro` 仅命名空间隔离，单 csproj；`Scheduling/ReschedulingTrigger.cs` 反向 import `MES.AI.Pro.Services`。开源构建无法靠 csproj 排除 Pro。

**修法**（按设计文档原意，2-3h）：
1. 拆 `MES.AI` → `MES.AI.Core.csproj`（Scheduling/ConstraintValidator/规则引擎）+ `MES.AI.Pro.csproj`（Agents/Skills/Onnx/Qdrant/SemanticKernel）
2. `Core` 不引用 `Pro`；移除 `ReschedulingTrigger` 中对 `Pro.Services` 的 import（用 Domain 接口注入）
3. 开源构建时 `dotnet pack --include-source` 仅打包 Core
4. CI 加规则：Core 项目 csproj 不允许引用 `Microsoft.SemanticKernel*` / `Onnx*` / `Qdrant*` 包

---

### P2-3. IVectorStoreService CancellationToken

**问题**：4 个方法（Upsert/Search/Delete/Store）不接 ct，违反 CLAUDE.md 硬性规则。LLM 调用经常 30s+，无法取消。

**修法**：接口加 `CancellationToken ct = default`；3 个实现（VectorStoreService 本机、QdrantVectorStoreService、未来其他 provider）传播下去。

**Effort**：~30min

---

### P2-4. AdoptionFeedbackService 重复注册

**问题**：`ServiceCollectionExtensions.cs:96` Scoped + `:188` Transient，后者覆盖。

**修法**：删一个（推荐保留 Scoped 与其他 AppService 一致）；若有 `IAdoptionFeedbackService` 接口，移除具体类直接注册。

**Effort**：~5min

---

### P2-5. 测试覆盖补全

**现状**：
- Domain：22 entity，6 有测试（含 ValueObject、state machine entity 全无）
- Infrastructure：17 Repository + 25 EntityConfiguration + DbContext，**全部无测试**
- Application：15 AppService，6 有测试（Risk/Operation/Knowledge 含 mock/state 的零测试）
- Frontend：**0 单元/组件测试**，仅 7 Playwright e2e

**修法（分批，每批 2h）**：
1. **Domain VO + state machine**（高 ROI）：补 AnomalyStatus / SchedulePlanStatus / WorkOrderStatus 状态机迁移测试 + 主要 VO 等值/Hash 测试
2. **Application 关键 mutation**：OperationService.CompleteAsync 多 Aggregate 跨 saga + InventoryAppService 并发场景（已修过事务）
3. **Infrastructure repo**：用 `WebApplicationFactory + InMemoryDb` 写 1-2 个 happy path 即可（CRUD 是 EF 框架行为，不需逐 repo 测）
4. **Frontend Vitest**：先把 `escapeHtml` / `useAuth` / SignalR 重连逻辑加单元测试

**Effort**：分阶段做，单批 2h，总 8-12h

---

## P0-2 RowVersion 后续（推 P2 替补）

`UseXminAsConcurrencyToken` 在当前 `Npgsql.EntityFrameworkCore.PostgreSQL 9.0.0` 不可用。3 个选项：

| 方案 | Effort | Note |
|---|---|---|
| (a) 升级 Npgsql.EFCore.PostgreSQL → 9.0.x 含 xmin 扩展的小版本 | 30min + 验证 | 推荐先试 |
| (b) Shadow property + IsRowVersion + EF Migration | 1h + Migration | 通用，跨 provider |
| (c) Aggregate 层加 `byte[] RowVersion` 字段 | 2h，侵入 Domain | 不推荐 |

**已就绪**：事务包裹（已实施）覆盖了 InventoryAppService 4 写方法 + OperationService.CompleteAsync 的 race window。RowVersion 是 belt-and-suspenders，不阻塞 push。

---

## 执行顺序建议

```
Push 前 (~1.5h)
  P1-6 axios 统一 + refresh 流程    1h    /  funnel 留存关键
  P1-2 文档警告（已做）              0     /  仅 push 前文档加固

Push 后 30 天 (~6-10h)
  P2-4 重复注册（5 min）             机械
  P2-3 IVectorStore + ct（30 min）    机械
  P0-2 (a) 升级 Npgsql 试 xmin       30 min
  P2-1 EF Migrations 单源              1.5h
  P2-5 测试覆盖第 1 批（domain VO）   2h
  P2-2 Pro/Core 物理分包               2-3h  /  上线 v0.2 时做
```

---

## 关联文档

- 完整 review plan：`C:\Users\陈奕铭\.claude\plans\all-of-solution-curried-wave.md`
- 5/16 修复落地：`_docs/_changelog/20260516-all-of-solution-review-fixes.md`
- Push 前清单（更早一轮）：`_docs/_plan/20260514-pre-launch-checklist.md`
- 5/15 push 前剩余 TODO：`_docs/_todo/20260515-pre-launch-remaining.md`（Docker 机器执行）
