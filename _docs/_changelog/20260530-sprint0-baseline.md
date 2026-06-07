# 2026-05-30 Sprint 0 基线

## 完成

- 执行 CC remediation plan 的 Sprint 0 / 任务 0.0 测试基线。
- 后端 Unit 基线：308 passed / 0 failed。
- 后端 Integration 基线：138 passed / 0 failed。
- 前端 build 基线：通过，但有 Node `DEP0180` deprecation warning。
- 前端 E2E 基线：259 passed / 1 failed。

## 发现

- `npm run lint` 因 ESLint 10 flat config 迁移问题失败，当前不能作为质量门。
- `MES.Tests.Evaluation` 项目没有发现可运行测试。
- `tests/e2e/production.spec.ts` 的 “工单详情显示工序列表” 用例因文本定位器歧义失败。

## 文档

- 新增 `_docs/_review/20260530-sprint0-baseline.md`。
- 新增 `_docs/_issue/20260530-sprint0-baseline-reds.md`。
- 新增 `_docs/_todo/20260530-sprint0-next-actions.md`。

## Sprint 0 修复

- 完成 0.1：删除 JWT SigningKey 隐式 fallback，启动时 `Jwt:SigningKey` 缺失或 UTF-8 长度小于 32 bytes 直接拒绝启动。
- 为 0.1 新增集成测试：`JwtStartupValidationTests` 覆盖缺失 key 与短 key 两条拒绝启动路径。
- 为集成测试工厂显式注入测试 JWT key，避免测试依赖开发 fallback。
- 关闭集成测试程序集并行执行，避免全局环境变量与共享测试数据库互相污染。
- 修复 Production E2E “工单详情显示工序列表” 定位器歧义；目标文件 `production.spec.ts` 已 21/21 通过。
- 新增 `src/frontend/eslint.config.cjs`，让 ESLint 10 能读取 flat config；当前 lint 门禁已从“不可运行”变为“可运行但暴露存量错误/警告”。

## 验证

- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~JwtStartupValidationTests|FullyQualifiedName~AuthControllerTests" --no-restore`：5 passed。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore`：308 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore`：140 passed。
- `npm run test:e2e -- --reporter=list tests/e2e/production.spec.ts`：21 passed。
- `npm run lint`：仍失败，当前为真实 lint 债务：196 errors / 4444 warnings。

## Sprint 0 CORS 修复

- 推进 0.2/0.3：Production CORS 策略要求 `AllowedOrigins` 至少配置一个非空源；空白名单启动注册阶段直接抛 `InvalidOperationException`。
- Production CORS policy 使用清洗后的白名单源，不使用 `AllowAnyOrigin`，避免返回 `Access-Control-Allow-Origin: *`。
- 新增 `CorsPolicyTests` 覆盖：
  - 配置 `https://mes.example.com` 时，Production policy 只包含该源且 `AllowAnyOrigin=false`。
  - 未配置 `AllowedOrigins` 时拒绝启动注册。

## CORS 验证

- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~CorsPolicyTests --no-restore`：2 passed。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore`：308 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore`：142 passed。

## Sprint 0 数据库启动修复

- 完成 0.12：生产启动路径不再自动执行 `MigrateAsync`，改为检查 pending EF migrations；存在未应用迁移时拒绝启动并提示先执行 `dotnet ef database update`。
- 非 Production 环境保留自动准备数据库；关系型 provider 使用 `MigrateAsync`，非迁移 provider（例如集成测试 InMemory）使用 `EnsureCreatedAsync`，避免测试环境跳过 demo seed。
- 将启动逻辑抽出到 `IDatabaseStartupValidator` / `IDatabaseSchemaState` / `IDemoDataSeeder`，便于单测覆盖生产拒绝启动与开发 seed 行为。
- 修正 demo seed 包装器未传播 `CancellationToken` 的问题。

## 数据库启动验证

- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter FullyQualifiedName~DatabaseStartupValidatorTests --no-restore`：4 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore`：142 passed。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore`：312 passed。

## Sprint 0 迁移与 EnsureCreated 审计

- 完成 0.13 判定：`dotnet ef migrations has-pending-model-changes` 报告当前模型相对最新 migration 无变更，因此本轮不新增 EF migration。
- 完成 0.14：删除源码与集成测试中的 `EnsureCreated()` / `EnsureCreatedAsync()` 调用。
- 为移除测试 `EnsureCreated()` 后缺失的 InMemory `HasData` 配置补显式测试种子：`TestDataSeedFilter` upsert `SystemConfig` 三条配置，保持 Admin 配置测试意图不变。

## 迁移与 EnsureCreated 验证

- `$env:ConnectionStrings__DefaultConnection='Host=localhost;Port=5432;Database=aimes_migration_check;Username=postgres;Password=postgres'; dotnet ef migrations has-pending-model-changes --project .\src\backend\MES.Infrastructure\MES.Infrastructure.csproj --startup-project .\src\backend\MES.Api\MES.Api.csproj --context MesDbContext --no-build`：No changes have been made to the model since the last migration.
- `rg -n "EnsureCreated\(|EnsureCreatedAsync\(" src/backend src/tests -g "*.cs"`：无匹配。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore`：142 passed。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore`：312 passed。

## Sprint 0 报表伪造数据修复

- 完成 0.9：`ReportEndpoints` 不再为无真实数据的日报产量、每日缺陷和异常分布返回默认伪造图表。
- 异常统计改为从 `IAnomalyRepository.GetAllAsync` 读取真实异常，按真实 `AnomalyType` 聚合；`TotalAnomalies`、`OpenCount`、`ResolvedCount` 不再基于 critical open 数量近似推导。
- 新增集成测试：清空异常数据后，请求 `/api/v1/report/dashboard` 应返回 0 总异常、0 open、0 resolved、空 `AnomalyByType`。

## 报表验证

- 先红：`ReportControllerTests.GetDashboard_WithoutAnomalies_ShouldNotReturnFabricatedAnomalyDistribution` 在旧实现下失败，`TotalAnomalies` 从真实 0 被伪造成 4。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~ReportControllerTests --no-restore`：6 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore`：143 passed。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore`：312 passed。

## Sprint 0 Evaluation 门禁修复

- 完成 0.10：`eval.ps1` 已读取真实 golden JSON，并改为 fail-closed；缺 golden、JSON 解析失败、`testCases` 缺失或为空都会标记失败并退出非 0。
- 新增 `MES.Tests.Evaluation` 可发现 xUnit 测试，覆盖缺 golden 与空 `testCases` 两条 fail-closed 路径。
- 完成 0.11：`eval.yml` 从 `v1/.github/workflows/` 移出；当前环境的计划根目录为 `C:\AIWorks\AIMes`，已创建 `C:\AIWorks\AIMes\.github\workflows\eval.yml`。
- 根 workflow 增加 `MES.Tests.Evaluation` 测试步骤，再运行 `eval.ps1` 与 gate 检查。
- 刷新 `eval_results.json`，旧结果中的 `skipped-no-data` 已消失，6 个 agent 均来自当前 golden 数据。

## Evaluation 验证

- 先红：`EvalScript_WhenGoldenDatasetIsMissing_ShouldFailClosed` 与 `EvalScript_WhenGoldenDatasetHasNoTestCases_ShouldFailClosed` 在旧脚本下均失败，原因是脚本 exit 0。
- `dotnet test .\src\tests\MES.Tests.Evaluation\MES.Tests.Evaluation.csproj --no-restore`：2 passed。
- `pwsh .\src\tests\MES.Tests.Evaluation\eval.ps1`：EVALUATION PASSED。
- workflow 路径检查：`v1/.github/workflows/eval.yml` 不存在；`C:\AIWorks\AIMes\.github\workflows\eval.yml` 存在。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore`：312 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore`：143 passed。

## Sprint 0 架构门禁修复

- 完成 0.15：新增 `MES.ArchitectureTests` 并纳入 `src/backend/AIMes.slnx`。
- 架构测试覆盖：
  - Domain 不引用任何 `MediatR*` 程序集。
  - Application 不引用 `ClosedXML` / `QuestPDF`。
  - AppService 不包含 static 可变字段。
  - Endpoint 文件不使用 `System.Random`。
  - Infrastructure 仓储读方法必须包含 `AsNoTracking()`。
- 移除 Domain 对 MediatR 的依赖；`IDomainEvent` 改为纯领域接口，Infrastructure 用 `DomainEventNotification<T>` 适配 MediatR 发布。
- 将 Excel/PDF 导出实现从 Application 下沉到 Infrastructure，Application 仅保留 `IExportAppService` 端口。
- 补齐多个仓储读方法的 `AsNoTracking()`；质量处置写路径改用 `GetForUpdateAsync` 保留 tracking，避免 owned collection 写入失败。

## 架构门禁验证

- 先红：`MES.ArchitectureTests` 初次运行暴露 Application 导出库依赖、仓储读方法缺 `AsNoTracking()`、Domain 间接引用 `MediatR.Contracts`。
- `dotnet test .\src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --no-restore`：5 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~AgentExecuteQualityDisposition_WithInspectionPayload_ShouldRecordDefectAndAuditBusinessWrite --no-restore`：1 passed。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore`：312 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore`：143 passed。
- 注意：并行运行多个 `dotnet test` 曾抢占同一 `obj` 文件并触发文件锁；后续后端验证应串行运行。

## Sprint 0 异常仓储迁移修复

- 推进 0.4：`AnomalyAppService.GetOpenAnomaliesAsync` 不再复用全量分页仓储查询。
- 新增 `IAnomalyRepository.GetOpenPagedAsync` / `CountOpenAsync`，open 列表和分页总数均只统计 `Open` / `Acknowledged` 异常。
- 新增集成测试：种入 1 条 `Open` 与 1 条 `Resolved` 异常后，请求 `/api/v1/anomaly` 不应返回已解决异常。

## 异常仓储验证

- 先红：`AnomalyControllerTests.GetAll_ShouldReturnOnlyOpenAnomalies` 在旧实现下失败，`Resolved` 异常被包含在 open 列表中。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~AnomalyControllerTests.GetAll_ShouldReturnOnlyOpenAnomalies --no-restore`：1 passed。

## Sprint 0 BOM 仓储迁移修复

- 推进 0.5：`BomAppService.GetAllBomsAsync` 不再调用 `IBomRepository.GetAllAsync` 后在服务层内存分页。
- 新增 `IBomRepository.GetPagedAsync` / `CountAsync`，BOM 列表分页和总数查询下沉到 Infrastructure 仓储。
- 架构测试新增并扩展 `ListAppServices_ShouldUseRepositoryPaging`，防止 BOM / Employee / Purchase 列表回退为服务层全量加载再 `Skip` / `Take`。

## BOM 仓储验证

- 先红：`ListAppServices_ShouldUseRepositoryPaging` 在旧实现下失败，命中 `_bomRepo.GetAllAsync`、`.Skip(` 和 `.Take(`。
- `dotnet test .\src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter FullyQualifiedName~ListAppServices_ShouldUseRepositoryPaging --no-restore`：1 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~BomControllerTests --no-restore`：4 passed。

## Sprint 0 Employee 仓储迁移修复

- 推进 0.6：`EmployeeAppService.GetAllAsync` 不再调用 `IEmployeeRepository.GetAllAsync` 后在服务层内存分页。
- 新增 `IEmployeeRepository.GetPagedAsync` / `CountAsync`，员工列表分页和总数查询下沉到 Infrastructure 仓储。
- 架构测试的列表仓储分页门禁扩展到 `EmployeeAppService`。

## Employee 仓储验证

- 先红：`ListAppServices_ShouldUseRepositoryPaging` 在旧实现下失败，命中 `EmployeeAppService.GetAllAsync` 缺少仓储级分页。
- `dotnet test .\src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter FullyQualifiedName~ListAppServices_ShouldUseRepositoryPaging --no-restore`：1 passed。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter FullyQualifiedName~EmployeeAppServiceTests --no-restore`：10 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~EmployeeControllerTests --no-restore`：7 passed。

## Sprint 0 Inventory 与 Purchase 仓储迁移修复

- 完成 0.7 审计：`InventoryAppService` 已无 `_transactions` 静态列表，交易读取和写入均通过 `IStockTransactionRepository`；接口保持当前前端依赖的交易数组响应形状。
- 推进 0.8：`PurchaseAppService.GetAllAsync` 不再调用 `IPurchaseOrderRepository.GetAllAsync` 后在服务层内存分页。
- 新增 `IPurchaseOrderRepository.GetPagedAsync` / `CountAsync`，采购列表分页和总数查询下沉到 Infrastructure 仓储。
- 列表仓储分页架构门禁扩展到 `PurchaseAppService`。

## Inventory 与 Purchase 验证

- 0.7 搜索审计：`rg -n "_transactions|static\s+(readonly\s+)?(List|Dictionary|HashSet)|new\s+List<StockTransaction>|GetPagedAsync\(string\? materialCode" ...` 仅命中 `IStockTransactionRepository.GetPagedAsync` 与 `StockTransactionRepository.GetPagedAsync`。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter FullyQualifiedName~InventoryAppServiceTests --no-restore`：10 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~InventoryControllerTests --no-restore`：7 passed。
- 0.8 先红：`ListAppServices_ShouldUseRepositoryPaging` 在旧实现下失败，命中 `PurchaseAppService.GetAllAsync` 缺少仓储级分页。
- `dotnet test .\src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter FullyQualifiedName~ListAppServices_ShouldUseRepositoryPaging --no-restore`：1 passed。
- `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter FullyQualifiedName~PurchaseAppServiceTests --no-restore`：10 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~PurchaseControllerTests --no-restore`：7 passed。
- `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter FullyQualifiedName~AgentExecutePurchaseAction_WithReceiptPayload_ShouldReceivePurchaseOrderAndAuditBusinessWrite --no-restore`：1 passed。

## Sprint 0 前端 lint 门禁收口

- 完成 P0 lint 债务收口：`npm run lint` 已从 196 errors / 4444 warnings 清理为 0 errors / 0 warnings，并满足脚本中的 `--max-warnings 0`。
- `eslint.config.cjs` 保留 ESLint 10 flat config；关闭 `vue/comment-directive` 与 Vue 格式类噪声规则，保留 TypeScript 语义规则。
- 清理真实语义 warning：
  - 删除未使用导入和变量。
  - 将 `catch (e: any)` / 结构强转收窄为 `unknown`、DTO 类型或局部交叉类型。
  - 新增 `utils/error-message.ts`，统一从 unknown 错误对象中提取 Axios 风格错误消息。
  - `ChatPanel.vue` 的 `v-html` 仅在该文件关闭规则，并保留 `renderMarkdown` 先转义再添加有限标签的安全前提。
- 修复 lint 暴露的员工编辑细节：员工卡片点击改回 `openEdit(e)`，确保编辑表单按当前员工初始化。

## 前端 lint 验证

- `npm run lint`：通过，0 warnings。
- `npm run build`：通过；仍输出 Node `DEP0180` deprecation warning，作为非阻断项保留跟踪。

## 备注

- 曾尝试用完整 Production host 做 CORS 预检测试时会被自动 `MigrateAsync` 阻断；该阻断已在 Sprint 0 / 0.12 修复为生产只校验 pending migrations。
- 并行运行 BOM 架构测试与集成测试时再次触发 `MES.Domain.dll` obj 文件锁；已改为串行重跑并通过。
- 并行运行 Employee 架构测试与单测时再次触发同一 `obj` 文件锁；后续后端验证必须串行。
