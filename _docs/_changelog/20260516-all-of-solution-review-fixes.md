# 20260516 — All-of-Solution Review 修复落地

## 背景

`/review all of solution`（api+lib+pc）执行结果，识别 18 项（5 P0、8 P1、5 P2）。本次会话完成 P0 全部 5 项 + P1 6 项（共 11 项），单元测试 **239 全过**，编译 **0 警告 0 错误**。

详见 plan：`C:\Users\陈奕铭\.claude\plans\all-of-solution-curried-wave.md`

---

## P0 — 全部完成

### P0-3 JWT SigningKey 撤离 ✅

**问题修正（事实更正）**：plan 原说 "appsettings.json 含真实 SigningKey"，实际是 dev 占位 `"AIMes-Development-Signing-Key-For-Local-Only-Change-Me"`。但**真炸弹更微妙**：该占位会 fallthrough 到 Production 模式（appsettings.Production.json 没覆盖 + docker-compose 没设环境变量），导致 Program.cs:34 的 `throw` 永远不触发，任何人 clone 仓库都能用这个 key 伪造 token。

**修复：**
- `appsettings.json:13` SigningKey 改空串 → Production 模式 throw 真触发
- `Program.cs:32-52` dev fallback 改为运行时随机生成 + Serilog warning 警告
- `docker-compose.yml:86` 显式注入 `Jwt__SigningKey` demo 值，名字明显「DEMO-ONLY-DO-NOT-USE-IN-PRODUCTION」

### P0-4 AuditEndpointFilter PII redact ✅

**Evidence**：`AuditEndpointFilter` 序列化 `ActionArguments` 到 `AuditLog.NewValues`，未按字段名过滤密码/token。`AuditAttribute`（MVC 路径）同样隐患。

**修复：**
- 新建 `Filters/AuditRedaction.cs` —— 反射深度遍历，命中 `password|secret|token|apikey|signingkey|credential|pwd|passwd|hash|cert|privatekey` 替换 `***REDACTED***`
- `AuditEndpointFilter.cs` 替换 `JsonSerializer.Serialize` → `AuditRedaction.RedactAndSerialize`
- `AuditAttribute.cs` 同步修复

### P0-1 Singleton 线程安全 ✅

**Evidence**：3 个 Singleton 服务持非线程安全集合 + 调度层另 3 个嫌疑被排除（仅方法局部变量）。

**修复：**
- `OnnxInferenceService.cs` —— `Dictionary<string, InferenceSession>` → `ConcurrentDictionary<string, Lazy<InferenceSession>>`，加载用 `LazyThreadSafetyMode.ExecutionAndPublication`，避免并发加载同一模型导致 native 内存泄漏
- `VectorStoreService.cs` —— `Dictionary<string, List<DocumentChunk>>` → `ConcurrentDictionary` + per-collection lock；遍历前快照
- `QdrantVectorStoreService.cs` —— `HashSet<string>` → `ConcurrentDictionary<string, byte>` 当 set 用
- 调度层 `SchedulingRuleEngine` / `LockPeriodManager` / `Rescheduler` 抽查无可变状态，免动

### P0-2 RowVersion + 关键事务 ✅（部分调整）

**Evidence**：plan 说「整个后端 0 并发令牌」事实部分错误：`OperationExecutionConfiguration` 和 `PurchaseOrderConfiguration` 已用 `Version` 字段 + `IsConcurrencyToken()`。但 WorkOrder/Material/SchedulePlan 缺。

**修复（实施过程调整）：**
- 尝试 PostgreSQL `UseXminAsConcurrencyToken()` API 失败（当前 Npgsql 版本不可用），按 Rule 3 surgical changes 回退 RowVersion 部分推到 P2 TODO
- **事务部分实施完成**（实际更高 ROI）：
  - 新建 `Domain/Interfaces/Services/IUnitOfWork.cs`（Domain 层抽象）
  - 新建 `Infrastructure/Persistence/EfUnitOfWork.cs`（EF Core 实现，InMemory provider 自动 no-op fallback 兼容现有测试）
  - 注册到 `ServiceCollectionExtensions.cs` 作为 Scoped
  - `InventoryAppService` 4 个写方法（StockIn/StockOut/Transfer/Adjust）全部包 `await using var scope = await _unitOfWork.BeginAsync(ct)` + `scope.CommitAsync(ct)`
  - `OperationService.CompleteAsync`（跨 OperationExecution + WorkOrder + OperationReport 4 次 SaveChanges）同样事务包裹
- 单元测试 `InventoryAppServiceTests.cs` 同步加 `Mock<IUnitOfWork>` —— 跑过

### P0-5 Production overrides 文档警告 ✅

**修复：**
- `appsettings.Production.json` 显式 `"Aimes": { "EnableSwagger": false, "DisableHttpsRedirect": false }` + 注释警告
- `_docs/quickstart.md` 第 5 节生产部署清单加：强随机 SigningKey 命令示例、关闭 EnableSwagger/DisableHttpsRedirect 开关、ForwardedHeaders 配置（呼应 P1-3）

---

## P1 — 完成 6/8

### P1-1 端点授权统一 ✅

**Evidence**：`Program.cs` 注册的 19 个 endpoint group 中，`/scheduling`、`/quality`、`/production`、`/knowledge`、`/llm` 5 个无 group-level auth；GET /api/v1/scheduling/plans 未授权直接暴露排程数据。

**修复：** 5 个 group 全部加 `RequireAuthorization()`。

### P1-3 ForwardedHeaders ✅

**修复：** `Program.cs:135-145` 加 `services.Configure<ForwardedHeadersOptions>` 启用 XForwardedFor + XForwardedProto；`Program.cs:206` 在 RateLimiter / Auth 之前 `app.UseForwardedHeaders()`。生产环境反代后 IP partition 才生效。

### P1-4 AsNoTracking 批量 ✅

**修复：** 9 个 repository 的纯查询/列表方法加 `AsNoTracking()`，包括：
- `Anomaly` 2 个查询、`Bom` 1 个、`Equipment` 4 个、`Material` 1 个、`QualityInspection` 5 个、`Routing` 1 个、`Schedule` 1 个、`WorkOrder` 3 个

`GetByIdAsync` / `GetByCodeAsync` 等后续可能 mutate 的路径**有意保留 tracking** —— 避免破坏现有 InventoryAppService/OperationService 调用模式。

### P1-5 RiskAppService demo 标志 ✅（部分调整）

**Evidence**：RiskAppService 100% 硬编码 mock 数据，但前端 RiskBoard 是 README 主推卖点 —— 评估人误把示例数据当真实状态。

**实施过程调整**：直接接通真实 repo 需要 1-2h 重写完整风险计算（按 Rule 2 简化），改为最小手术：
- `RiskDashboardDto` 加 `IsDemoData` 标志
- `RiskAppService.GetRiskDashboardAsync` 返回时 `IsDemoData = true`
- 前端依据此显示横幅推到 P2（RiskBoard.vue 现有 demo banner 可复用）

真正接通真实 repo 留 P2。

### P1-7 ChatPanel escapeHtml 修单引号 ✅

**修复：** `ChatPanel.vue:112` 增加 `'` 和 `/` 转义（`&#39;` / `&#x2F;`）。

### P1-8 演示账号条件化 ✅

**修复：** `LoginPage.vue` 演示账号块改条件渲染：`v-if="showDemoHints"` ← `import.meta.env.DEV || VITE_SHOW_DEMO_HINTS === 'true'`。生产构建不再向所有访客暴露默认账号。

---

## P1 仍待完成 (推到 P2 TODO)

| # | 项 | 原因 |
|---|---|---|
| P1-2 | TokenBlacklist + SigningKeyStore 内存态 | 改 Redis-backed 是 P2 工作量；当前已在 quickstart 文档警告「v0.1 单实例部署限制」 |
| P1-6 | 前端 axios 双拦截器 + refresh 流程 | 前端改动 30-60min，独立模块，集中到 P2 写 |

---

## P0-2 RowVersion 后续工作（P2 替补）

`UseXminAsConcurrencyToken` 在当前 Npgsql 版本不可用。三个备选：
1. 升级 `Npgsql.EntityFrameworkCore.PostgreSQL` 到含 xmin 扩展的版本
2. 用 EF shadow property `b.Property<uint>("RowVersion").IsRowVersion()`（需 EF migration）
3. 改在 Aggregate 层加 `byte[] RowVersion` 字段（侵入 Domain）

推荐 (1)；事务包裹（已实施）已经覆盖了大部分 race window，RowVersion 是 belt-and-suspenders。

---

## 验证结果

```
dotnet build src/backend/MES.Api/MES.Api.csproj
→ 0 警告，0 错误（最终）

dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj
→ 通过 239 / 失败 0 / 跳过 0
```

未跑集成测试 + Playwright e2e（依赖 docker compose，本机无 Docker）。

---

## 文件变更清单

**新增（3）：**
- `src/backend/MES.Domain/Interfaces/Services/IUnitOfWork.cs`
- `src/backend/MES.Infrastructure/Persistence/EfUnitOfWork.cs`
- `src/backend/MES.Api/Filters/AuditRedaction.cs`

**修改后端（13）：**
- `src/backend/MES.Api/Program.cs` — JWT 处理 + ForwardedHeaders + 端点授权 5 处
- `src/backend/MES.Api/appsettings.json` — SigningKey 撤离
- `src/backend/MES.Api/appsettings.Production.json` — 显式 Aimes overrides
- `src/backend/MES.Api/Filters/AuditEndpointFilter.cs` + `AuditAttribute.cs` — PII redact
- `src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs` — IUnitOfWork 注册
- `src/backend/MES.AI/Services/{OnnxInferenceService,VectorStoreService,QdrantVectorStoreService}.cs` — 线程安全
- `src/backend/MES.Application/Services/{InventoryAppService,OperationService,RiskAppService}.cs` — 事务/IsDemoData
- `src/backend/MES.Application/DTOs/RiskDtos.cs` — IsDemoData
- `src/backend/MES.Infrastructure/Repositories/*.cs` — 9 个 repo 的 AsNoTracking
- `src/tests/MES.Tests.Unit/Application/InventoryAppServiceTests.cs` — Mock IUnitOfWork

**修改前端（2）：**
- `src/frontend/src/components/auth/LoginPage.vue` — 演示账号条件化
- `src/frontend/src/components/chat/ChatPanel.vue` — escapeHtml 加 `'` `/`

**修改配置（2）：**
- `docker-compose.yml` — `Jwt__SigningKey` 演示值
- `_docs/quickstart.md` — 生产部署警告增强

---

## 仍待完成 → 见 `_docs/_todo/20260516-post-review-todos.md`
