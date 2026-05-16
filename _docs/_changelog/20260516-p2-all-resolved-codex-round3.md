# 20260516 — P2 全部 7 项修复 + Codex 第三轮验证

## 背景

`fix next round until all them has been fixed` 目标启动后，把 `_docs/_todo/20260516-post-review-todos.md` 列的 7 项 P2 全部修完，跑 Codex 第三轮验证发现 1 项遗漏（Token blacklist + ClockSkew 窗口竞争）后立即修补。

最终：264 单元测试全过，默认构建 + 开源构建（`/p:AimesOpenSource=true`）都 0 警告 0 错误。

## P2 — 7 项全部完成

### P2-4. AdoptionFeedbackService 重复注册 ✅

`ServiceCollectionExtensions.cs:194` 的 `AddTransient<AdoptionFeedbackService>()` 删掉，仅保留 `AddApplicationServices` 里的 Scoped 注册。

### P2-3. IVectorStoreService + CancellationToken ✅

接口 4 个方法全加 `CancellationToken ct = default`：
- `UpsertAsync` / `SearchAsync(float[])` / `SearchAsync(string)` / `DeleteCollectionAsync`
- 两个实现（`VectorStoreService` / `QdrantVectorStoreService`）传播 ct 到底层 Qdrant.Client 调用
- Qdrant 的 `SearchAsync(string)` 重载返回空列表 + warning 日志（Qdrant 不支持文本搜索，调用方应先 GenerateEmbedding 再用 float[] 重载）

### P2-7. IUnitOfWork → lambda 模式 + IExecutionStrategy + retry 重启 ✅

把 IUnitOfWork API 从 `BeginAsync()` 模式改为 `ExecuteAsync(Func)` lambda 模式：

```csharp
public interface IUnitOfWork
{
    Task<T> ExecuteAsync<T>(Func<CancellationToken, Task<T>> action, CancellationToken ct);
    Task ExecuteAsync(Func<CancellationToken, Task> action, CancellationToken ct);
}
```

`EfUnitOfWork` 用 `Database.CreateExecutionStrategy().ExecuteAsync()` 包裹整个事务作为 retriable unit。
重启 `EnableRetryOnFailure(5, 30s)` —— 现在和 retry 共存（之前撤销是因 `BeginTransactionAsync` 直接和执行策略冲突）。

`InventoryAppService` 4 个写方法 + `OperationService.CompleteAsync` 重写为 lambda 形式。
`InventoryAppServiceTests` 的 Mock 改为 `(action, ct) => action(ct)` 透传桩。

### P2-1. EF Migrations 唯一事实源 ✅

- `db/init.sql` 删除（与 EF Migrations 双轨易漂移）
- `docker-compose.yml` 不再挂载 init.sql，仅留 seed.sql 灌演示数据
- `db/README.md` 更新：DBA 用 `dotnet ef migrations script` 导出
- API 启动时 `Database.MigrateAsync()` 自动应用

### P2-2. Pro/Core 隔离（MSBuild 条件编译，非物理分包）✅

按 Rule 2 简化原则，没拆 csproj，而是用条件编译实现同样效果：

`MES.AI.csproj`：
- `<DefineConstants>$(DefineConstants);AIMES_OPEN_SOURCE</DefineConstants>` when `AimesOpenSource=true`
- `<Compile Remove>` 排除 `Agents/** Skills/** Adapters/** Configuration/** Pro Services/Models`
- Pro 专属包（SemanticKernel/Onnx/Qdrant/KernelMemory/YamlDotNet）仅商业版构建引用
- 补回 `Microsoft.Extensions.Logging.Abstractions` 给 Core Scheduling

`MES.Api.csproj`：
- 同样 `<DefineConstants>` + `<Compile Remove="Endpoints\LlmEndpoints.cs">`

`Program.cs` + `ServiceCollectionExtensions.cs`：
- `using MES.AI.Pro.* / MES.AI.Adapters` 包进 `#if !AIMES_OPEN_SOURCE`
- `AddAIServices` Pro 段（LlmGateway/VectorStore/Onnx/Kernel/Agents/Adapters）整体条件化
- `app.MapGroup("/api/v1/llm")` 条件化
- 开源构建 `/p:AimesOpenSource=true` **实测通过**

`ReschedulingTrigger.cs` 删了无用的 `using MES.AI.Pro.Services;`（陈旧 import，无实际调用）。

### P0-2. RowVersion via PostgreSQL xmin 系统列 ✅

`Npgsql.EntityFrameworkCore.PostgreSQL 9.0.0` 支持 xmin 但不是 `UseXminAsConcurrencyToken` 这样的便捷方法，是**约定**：`uint` + `xid` 列 + `ValueGeneratedOnAddOrUpdate` + `IsConcurrencyToken`。

- 4 个继承 AggregateRoot 的实体（OperationExecution/OperationReport/ProductionAnomaly/PurchaseOrder）：`Property(e => e.Version).HasColumnName("xmin").HasColumnType("xid")...`
- 3 个非 AggregateRoot 实体（WorkOrder/Material/SchedulePlan）：用 EF shadow property `Property<uint>("xmin")...`
- BomConfiguration / ProcessRouteConfiguration 因为 `new string Version` 影子化基类是历史 bug 不动（保留普通 version 列）
- 没在 AggregateRoot 加 `[ConcurrencyCheck]`，避免被 Bom/ProcessRoute 的 string Version 误扫描

### P1-2. TokenBlacklist via IDistributedCache + ClockSkew 修复 ✅

`TokenBlacklistService` 从 `ConcurrentDictionary` 改为 `IDistributedCache`：
- 默认 `AddDistributedMemoryCache`（单实例 + 重启丢失）
- 配 `ConnectionStrings:Redis` 时自动切 `AddStackExchangeRedisCache`（多实例 + 持久）—— 不需要改业务代码
- key prefix `aimes:token-blacklist:`，AbsoluteExpirationRelativeToNow 自动清理
- 同步 API 改 async：`BlacklistAsync` / `IsBlacklistedAsync`，所有 callsite 跟进

**Codex 第三轮发现的 ClockSkew 竞争**：原 `BlacklistAsync` 跳过 ttl<=0 的写入，但 JwtBearer 验证带 `ClockSkew=2min`，导致 logout 一个刚刚 expired 的 token 后，2 分钟内仍可被识别为有效但没标黑名单。

**修复**：blacklist entry 至少保留 `MinBlacklistTtl=3min`（ClockSkew + 1 分钟缓冲）。`TokenBlacklistServiceTests` 的对应测试断言也固化新行为。

`SigningKeyStore` 暂不改（admin-rare 操作，单租户）。

### P2-5. 测试覆盖第 1 批 ✅

新增 25 个单元测试：

`Domain/ValueObjectTests.cs`（10 个）：
- WorkOrderNumber/Quantity/TimeWindow/MaterialCode/EquipmentCode 等值 + Hash + ToString 行为
- HashSet 去重正确性

`Domain/OperationExecutionStateMachineTests.cs`（15 个）：
- 状态转移：Pending → Running → Paused → Running → Completed/Failed
- 禁止转移抛 InvalidOperationException：从 Completed Start / 从 Pending Pause / 从 Pending Complete / 从 Completed ReportException
- 关键 WHY 注释：双重 Complete 会让 CompletedQuantity 累加重复（数据腐化）

239 → 264 单元测试全过。

## Codex 第三轮裁定

| Item | 严重 | 结论 |
|---|---|---|
| 1. ExecuteAsync 事务 enrollment 正确性 | Low | ✅ Safe — 同一 DbContext + 单事务 |
| 2. Retry 幂等性（StockIn/Out/Transfer/Adjust） | Low | ✅ Safe — 内层失败整体 rollback，无 ghost commit |
| 3. ExecuteAsync(Func<Task>) 非泛型 null cast | Low | ✅ Safe |
| 4. xmin shadow property 在 WorkOrder/Material/SchedulePlan 上 | Low | ✅ Safe — 符合 Npgsql 文档约定 |
| 5. 全局 [ConcurrencyCheck] 影响 | Low | ✅ Not present（已主动移除）|
| 6. async token-blacklist callsites | Low | ✅ Safe |
| 7. Blacklist 跳过已过期 → ClockSkew 竞争 | **Medium** | ❌ 真 bug → 已修（MinBlacklistTtl=3min）|
| 8. 开源构建仍引用 Adapters | High | ✅ 已并行修复（条件编译）|
| 9. Qdrant SearchAsync(string) 返空 | Low | ⚠️ 当前无 caller，文档 footgun |
| 10. db/init.sql 引用残留 | Info | ✅ 仅文档提及，无 code/script 依赖 |

## 验证

```
dotnet build src/backend/MES.Api/MES.Api.csproj
→ 默认构建：0 警告 0 错误
→ 开源构建（/p:AimesOpenSource=true）：0 警告 0 错误

dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj
→ 通过 264 / 失败 0
```

## 25 项问题最终结清

```
原 review:    18 项（11 已修 + 7 推 P2）
Codex 1 轮:   +6 项（5 全修 + 1 partial → P2-7）
Codex 2 轮:   +1 项（健康检查空串守卫）
Codex 3 轮:   +1 项（Token blacklist ClockSkew 竞争）
─────────────────────
总计:         26 项  全部修复 ✅
```

P2 全做完后**已经没有未修项**。完整修复账本见每轮 changelog（`20260516-*.md`）。

## 文件变更（本次会话）

新增：
- `src/tests/MES.Tests.Unit/Domain/ValueObjectTests.cs`
- `src/tests/MES.Tests.Unit/Domain/OperationExecutionStateMachineTests.cs`

修改：
- `src/backend/MES.Domain/Interfaces/Services/IUnitOfWork.cs`（lambda 接口）
- `src/backend/MES.Domain/Interfaces/Services/IVectorStoreService.cs`（+ ct 全加）
- `src/backend/MES.Domain/Primitives/AggregateRoot.cs`（注释 [ConcurrencyCheck] 不在此处加）
- `src/backend/MES.Infrastructure/Persistence/EfUnitOfWork.cs`（IExecutionStrategy 包裹）
- `src/backend/MES.Infrastructure/Data/Configurations/{WorkOrder,Material,SchedulePlan,OperationExecution,OperationReport,ProductionAnomaly,PurchaseOrder}Configuration.cs`（xmin 映射）
- `src/backend/MES.Application/Services/{InventoryAppService,OperationService}.cs`（lambda 重写）
- `src/backend/MES.AI/MES.AI.csproj`（AimesOpenSource 条件编译 + Logging.Abstractions）
- `src/backend/MES.AI/Services/{VectorStoreService,QdrantVectorStoreService}.cs`（ct 传播）
- `src/backend/MES.AI/Scheduling/ReschedulingTrigger.cs`（删 Pro using）
- `src/backend/MES.Api/MES.Api.csproj`（AimesOpenSource 编译常量 + LlmEndpoints 条件排除）
- `src/backend/MES.Api/Program.cs`（/llm 端点条件化 + JwtBearer 异步化）
- `src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs`（重复注册清理 + Pro 段条件编译 + Redis 自动切换）
- `src/backend/MES.Api/Endpoints/AuthEndpoints.cs`（BlacklistAsync）
- `src/backend/MES.Api/Services/TokenBlacklistService.cs`（IDistributedCache + MinBlacklistTtl）
- `src/tests/MES.Tests.Unit/Services/TokenBlacklistServiceTests.cs`（async + ClockSkew 行为）
- `src/tests/MES.Tests.Unit/Application/InventoryAppServiceTests.cs`（lambda Mock）
- `Directory.Packages.props`（+ Logging.Abstractions 9.0.0）
- `docker-compose.yml`（不挂 init.sql）
- `db/README.md`（dotnet ef migrations script 替代手动 init）

删除：
- `db/init.sql`（与 EF Migrations 双轨）

## 仍待

无。`_docs/_todo/20260516-post-review-todos.md` 全部清零。

push 前剩余的是产品级 TODO（5/15 docker 机器实测、5 张截图、商业版联系方式占位替换），不在 review/codex 修复范围内。
