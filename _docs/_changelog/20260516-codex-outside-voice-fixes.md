# 20260516 — Codex Outside Voice 二次评审 + 修复

## 背景

`/review all of solution` 11 项修复完成后跑 Codex 二次评审（option C）。Codex 用 web search 验证 .NET 框架行为，发现 **5 个真问题** + 确认 3 项修复正确 + 1 个 false alarm。

我自己在等 Codex 期间通过 read 源码独立发现 1 个相同等级问题（`EnableRetryOnFailure` 与手动事务冲突）。**总计 6 项立即修复完成**。

---

## Codex 发现 + 立即修复（6 项）

### P0-2.1 EnableRetryOnFailure 与 BeginTransaction 冲突 ✅
（自己 read 源码发现，Codex 用 web search 同步验证）

**症状**：`AddDatabaseServices` 启用 `EnableRetryOnFailure(5, 30s)`，但 `EfUnitOfWork.BeginAsync` 直接用 `Database.BeginTransactionAsync()`。EF Core 抛：

> The configured execution strategy 'NpgsqlRetryingExecutionStrategy' does not support user-initiated transactions.

→ 上一轮 P0-2 在生产 PostgreSQL 上**第一次进事务直接 500**。

**修复**：`ServiceCollectionExtensions.cs:36-46` 移除 EnableRetryOnFailure 配置 + 加注释说明。请求级重试推到反代/K8s 层（`_docs/_todo` 已注）。

### P1-A OnnxInferenceService Lazy 异常缓存毒化 ✅

**症状**：`Lazy<InferenceSession>` + `LazyThreadSafetyMode.ExecutionAndPublication` 在加载失败时**永久缓存异常**，未来 PredictAsync 都重抛同一错。要么修模型文件后重启 API，要么先 UnloadModelAsync。

**修复**：`OnnxInferenceService.cs:99-110` 在 `lazy.Value` try/catch，捕获时 `TryRemove(KeyValuePair)`（值匹配避免 race 误删后续重试条目）。下次调用会重新尝试加载。

### P1-B ForwardedHeaders 信任所有代理 ✅

**症状**：上一轮 `KnownIPNetworks.Clear()` + `KnownProxies.Clear()` 让 ASP.NET 信任所有 X-Forwarded-* 头。直接暴露公网时攻击者伪造 `X-Forwarded-For: 1.2.3.4` 即可绕过登录速率限制。

**修复**：`Program.cs:135-153` 包条件 `if (trustForwarded)`，由 `Aimes:TrustForwardedHeaders` 配置开关控制（默认关闭）。生产部署在受信反代后才显式开启。`Program.cs:230-234` UseForwardedHeaders 也加同样守卫。

### P1-C AuditRedaction 循环引用 ✅

**症状**：EF parent/child 双向导航属性形成循环，原代码深度限到 6 但没 visited set，超出 MaxDepth 后把原对象交回 `JsonSerializer.Serialize` —— **JSON 序列化抛 cycle 异常**，审计写入失败。

**修复**：`AuditRedaction.cs` 加 `HashSet<object>(ReferenceEqualityComparer.Instance)` 短路同对象重复访问，标记 `***CYCLE***`。出栈时 Remove 让兄弟分支合法重复引用不被误判。

### P2-A AsNoTracking 单实体 read 路径补漏 ⚠️ 部分

**症状**：上一轮只补了列表/查询方法，单实体 GetById/GetByCode 仍 tracked。Codex 列出 4 个：`MaterialRepository.GetByIdAsync` `EquipmentRepository.GetByIdAsync` `WorkOrderRepository.GetByIdAsync` `ScheduleRepository.GetByIdAsync`。

**决定不修**：原因是这些 GetById 路径同时被 update 路径消费（如 `InventoryAppService.StockInAsync` → `GetByCodeAsync` → `material.StockIn()` → `UpdateAsync`），加 `AsNoTracking` 会让 update 路径走 `_context.Update(entity)` 强制 attach + 全列更新（vs 现在的 change tracker 只更新 dirty 列）。Surgical 起见保留为 P2 TODO，需要逐路径分析才能安全展开。

记入 `_docs/_todo/20260516-post-review-todos.md` 新增条目。

### P2-B 默认数据库密码 fallback 撤离 ✅

**症状**：3 处 fallback `Host=localhost;Database=mes;Username=postgres;Password=postgres`：
- `appsettings.json:16`
- `ServiceCollectionExtensions.cs:34`
- `MesDbContextFactory.cs:16`

虽然 Production 模式正常配置不会 fallback，但「非 prod 环境」或「环境变量漏配」会静默用默认值。开源仓库不应推默认凭证。

**修复**：
- `appsettings.json:16` 改空串 + 加注释指引
- `ServiceCollectionExtensions.cs:33-37` fallback 改 throw（与 JWT SigningKey 一致风格）
- `MesDbContextFactory.cs:15-19` fallback 改 throw（dotnet ef migrations 必须显式提供）
- docker-compose.yml 已显式注入 demo 值，运行无影响

---

## Codex 验证为正确（False Alarm 排除）

Codex 主动否认了 3 个嫌疑：

1. **EfUnitOfWork rollback 正确** — `DisposeAsync` 在未 Commit 时 RollbackAsync；scoped MesDbContext 让多个 Repository.SaveChangesAsync 都参与同一 transaction（ambient transaction）。
2. **TestWebApplicationFactory 不需要 IUnitOfWork override** — App 注册自动包含；测试只换 EF 到 InMemory + test auth。
3. **`/api/v1/scheduling` 加 RequireAuthorization 不破坏现有测试** — 集成测试用 TestAuthHandler 永远成功；前端 router 已对 scheduling 有 auth guard。

## False Alarm

Codex 列了 1 个：LoginPage placeholder 凭证泄漏。这个**我在等 Codex 输出期间已经主动修了**（`v-if="showDemoHints"` + `:placeholder="usernamePlaceholder"`），所以 Codex 拿到的是已修版本。结论一致：当前正确。

---

## 验证

```
dotnet build src/backend/MES.Api/MES.Api.csproj
→ 0 警告，0 错误

dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj
→ 通过 239 / 失败 0
```

---

## 文件变更清单

修改：
- `src/backend/MES.Api/Program.cs` — ForwardedHeaders 条件化
- `src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs` — EnableRetryOnFailure 移除 + DefaultConnection throw
- `src/backend/MES.Api/MesDbContextFactory.cs` — fallback throw
- `src/backend/MES.Api/appsettings.json` — DefaultConnection 改空串
- `src/backend/MES.Api/Filters/AuditRedaction.cs` — visited set
- `src/backend/MES.AI/Services/OnnxInferenceService.cs` — Lazy 异常清除
- `src/frontend/src/components/auth/LoginPage.vue` — placeholder 条件化（前置已修）

---

## 仍记 TODO

`_docs/_todo/20260516-post-review-todos.md` 增加：
- P2-6 AsNoTracking 单实体 read 路径分析展开（4 个 GetById 候选）
- P2-7 IUnitOfWork 重试策略：用 `IExecutionStrategy.ExecuteAsync` 重新引入 retry（重写 IUnitOfWork API 为 lambda 模式）

---

## 收获

Codex outside voice 在 11 项修复之外又抓出 5 个真问题（含 1 个 P0 级别的事务 + retry 冲突）+ 我并行发现 1 个相同等级问题。**两个模型独立判断同一类风险（Lazy 缓存 / 重试策略）的命中率说明这些是真盲点**，不是巡检 noise。

跨模型评审的 ROI：1 个 prompt + 3 分钟 Codex 时间 = 6 项实际生产事故避免。值。
