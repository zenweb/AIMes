# 2026-05-30 Sprint 0 / 0.0 测试基线审计

## 范围

来源计划：`_docs/_plan/20260514-cc-remediation-plan.md` 的 Sprint 0 任务 0.0。

目标：跑通现有全部测试并记录红/绿/flaky/不可运行，作为后续所有“通过”的基线。

执行仓库：`C:\AIWorks\AIMes\v1`。

## 结论

当前基线不是全绿。

| 类别 | 命令 | 结果 | 证据 |
|---|---|---|---|
| 后端全量测试 | `dotnet test .\src\backend\AIMes.slnx --logger "trx;LogFileName=baseline-dotnet.trx" --results-directory .\test-results\baseline-20260530-dotnet --no-restore` | 绿，但 Evaluation 项目无可发现测试 | `test-results/baseline-20260530-dotnet/baseline-dotnet.trx` |
| 后端 Unit | `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --logger "trx;LogFileName=unit.trx" --results-directory .\test-results\baseline-20260530-dotnet --no-restore` | 308 passed / 0 failed / 0 skipped | `test-results/baseline-20260530-dotnet/unit.trx` |
| 后端 Integration | `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --logger "trx;LogFileName=integration.trx" --results-directory .\test-results\baseline-20260530-dotnet --no-restore` | 138 passed / 0 failed / 0 skipped | `test-results/baseline-20260530-dotnet/integration.trx` |
| 后端 Evaluation | `dotnet test .\src\tests\MES.Tests.Evaluation\MES.Tests.Evaluation.csproj --logger "trx;LogFileName=evaluation.trx" --results-directory .\test-results\baseline-20260530-dotnet --no-restore` | 不可运行为有效测试门：0 tests discovered | `test-results/baseline-20260530-dotnet/evaluation.trx` |
| 前端 lint | `npm run lint` | 已修复：0 errors / 0 warnings | 终端输出 |
| 前端 build | `npm run build` | 绿；但输出 Node `DEP0180` deprecation warning | 终端输出 |
| 前端 E2E | `npm run test:e2e -- --reporter=list` | 红：259 passed / 1 failed | `src/frontend/test-results/production-Production-生产看板-工单详情显示工序列表-chromium-retry1/trace.zip` |

## 红项

1. `npm run lint` 质量门已恢复。
   - 初始根因：项目存在 `.eslintrc.cjs`，但安装的 `eslint@10.3.0` 默认要求 flat config `eslint.config.(js|mjs|cjs)`。
   - 后续债务：配置迁移后曾暴露 196 errors / 4444 warnings；已完成语义 warning 清理与格式噪声降噪。
   - 当前结果：`npm run lint` 通过，0 errors / 0 warnings。

2. `tests/e2e/production.spec.ts:115` 的 “工单详情显示工序列表” 失败。
   - 失败点：`page.getByText('工序')`。
   - 根因证据：Playwright strict mode 报告该文本命中两个元素：`工序执行与回写` 与 `<h4>工序</h4>`。
   - 判断：页面已出现 `.operations-section`，失败更像定位器歧义，不是“工序列表未渲染”。

3. `MES.Tests.Evaluation` 没有被发现的测试。
   - 当前命令退出码为 0，但输出明确写明 “没有可用测试”。
   - 影响：如果 Evaluation 本应覆盖 Agent/eval 质量门，则现在没有形成有效回归保护。

## Flaky 记录

本轮未确认 flaky。

说明：E2E 失败项在 retry 后仍因同一 strict mode violation 失败，暂按稳定红项记录。

## 关键缺陷回归矩阵

| ID | 缺陷/门禁 | 当前状态 | 期望回归命令 |
|---|---|---|---|
| S0-BL-001 | ESLint 10 配置缺失与真实 lint 债务 | 绿 | `npm run lint` |
| S0-BL-002 | Production E2E “工序”定位器歧义 | 红 | `npm run test:e2e -- --reporter=list tests/e2e/production.spec.ts` 或全量 E2E |
| S0-BL-003 | Evaluation 测试项目无测试发现 | 不可运行/空门禁 | `dotnet test .\src\tests\MES.Tests.Evaluation\MES.Tests.Evaluation.csproj` |
| S0-BL-004 | 后端 Unit 回归 | 绿 | `dotnet test .\src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore` |
| S0-BL-005 | 后端 Integration 回归 | 绿 | `dotnet test .\src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore` |
| S0-BL-006 | 前端生产构建 | 绿，带 Node DEP0180 警告 | `npm run build` |

## 下一步

按 Sprint 0 计划，先修复可让质量门失真的红项：

1. 让 `npm run lint` 在当前 ESLint 版本下可运行，并清理真实 lint 债务。已完成；当前 0 errors / 0 warnings。
2. 修正 Production E2E 的歧义定位器，并用单测/目标 E2E 先红后绿验证。已完成；`production.spec.ts` 21/21 通过。
3. 确认 `MES.Tests.Evaluation` 的职责：若它应当承载 eval 质量门，则补入可发现测试；若暂不启用，则在计划中明确降级。

## Sprint 0 / 0.1 追加审计

0.1 验收：启动时 `Jwt:SigningKey` 缺失或长度 < 32 字节即拒绝启动。

当前实现：

- `src/backend/MES.Api/Program.cs` 删除开发环境随机临时 key fallback。
- `Jwt:SigningKey` 缺失或空白时抛 `InvalidOperationException`。
- `Jwt:SigningKey` UTF-8 字节长度小于 32 时抛 `InvalidOperationException`。
- `src/tests/MES.Tests.Integration/Security/JwtStartupValidationTests.cs` 覆盖缺失 key 与短 key。

验证：

- 先红：新增测试在旧实现下 2 failed，原因是缺失 key 和短 key 都未拒绝启动。
- 后绿：`JwtStartupValidationTests|AuthControllerTests` 5 passed。
- 后端回归：Unit 308 passed；Integration 140 passed。

## Sprint 0 / 0.2-0.3 追加审计

0.2/0.3 验收：

- Production CORS 不再包含 `AllowAnyOrigin`。
- Production CORS 由白名单源驱动，缺少白名单时拒绝进入可发布状态。

当前实现：

- `src/backend/MES.Api/Program.cs` 已使用 `app.UseCors(isDevelopment ? "AllowAll" : "Production")`。
- `src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs` 的 `AddCorsServices` 会清洗 `AllowedOrigins`，要求至少一个非空源。
- `Production` policy 使用 `WithOrigins(allowedOrigins)`，不会调用 `AllowAnyOrigin`。
- `src/tests/MES.Tests.Integration/Security/CorsPolicyTests.cs` 覆盖白名单与空白名单两条路径。

验证：

- 先红：`ProductionPolicy_WithoutAllowedOrigins_ShouldRejectStartup` 在旧实现下失败，原因是没有抛出 `InvalidOperationException`。
- 后绿：`CorsPolicyTests` 2 passed。
- 后端回归：Unit 308 passed；Integration 142 passed。

边界说明：

- 完整 Production host CORS 预检测试会被当前自动 `MigrateAsync` 生产启动路径阻断；该阻断归入 Sprint 0 / 0.12，不作为 0.3 的实现范围。

## Sprint 0 / 0.12 追加审计

0.12 验收：

- Production 启动不自动执行 EF `MigrateAsync`。
- Production 只校验 pending migrations；存在未应用迁移时拒绝启动。
- Development / Integration 仍能准备本地测试数据库并 seed demo data。

当前实现：

- `src/backend/MES.Api/Program.cs` 启动阶段改为解析 `IDatabaseStartupValidator` 并调用 `ValidateAsync(...)`。
- `src/backend/MES.Api/Services/DatabaseStartupValidator.cs` 在 Production 中调用 `GetPendingMigrationsAsync`；pending migration 数量大于 0 时抛 `InvalidOperationException`，不调用 `MigrateAsync` / `EnsureCreatedAsync` / demo seed。
- 非 Production 环境继续准备数据库：关系型 provider 使用 `MigrateAsync`；非迁移 provider 使用 `EnsureCreatedAsync`。Development 准备完成后执行 demo seed。
- `src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs` 注册 `IDatabaseStartupValidator`、`IDatabaseSchemaState`、`IDemoDataSeeder`。

验证：

- 先红：`ValidateAsync_InDevelopmentWithoutMigrationSupport_ShouldEnsureCreatedAndSeedDemoData` 在旧实现下失败，原因是非迁移 provider 仍调用 `MigrateAsync`。
- 后绿：`DatabaseStartupValidatorTests` 4 passed。
- 后端回归：Integration 142 passed；Unit 312 passed。

边界说明：

- 0.12 只移除生产启动自动迁移钩子；是否需要补充新的 EF migration 文件归入后续 0.13。
- 测试项目中的 `TestDataSeedFilter` 仍保留 `EnsureCreated()`，它只作用于 Integration InMemory 测试数据库，不属于生产启动钩子。

## Sprint 0 / 0.13-0.14 追加审计

0.13 验收：

- 为 5/13-5/14 的 schema 变更产生 EF migration（如有）。

当前判定：

- 已运行 EF pending model changes 检查。
- 命令输出：`No changes have been made to the model since the last migration.`
- 结论：当前模型与最新 snapshot 一致，本轮不新增 migration。

0.14 验收：

- 删除 `EnsureCreated()` 调用。

当前实现：

- `IDatabaseSchemaState` 删除 `EnsureCreatedAsync` 抽象。
- `DatabaseStartupValidator` 非 Production 环境只在关系型 provider 上执行 `MigrateAsync`；非迁移 provider 不做 schema mutation，Development 仍执行 demo seed。
- `TestDataSeedFilter` 删除 `db.Database.EnsureCreated()`。
- 因 InMemory 不再通过 `EnsureCreated()` 注入 `HasData`，测试过滤器显式 upsert `SystemConfig` 三条配置，保持 Admin 配置接口测试的前置数据。

验证：

- 先红：删除测试 `EnsureCreated()` 后 Integration 出现 2 个 Admin 配置测试失败，证明该调用曾隐式提供 `HasData` 配置。
- 后绿：补显式 `SystemConfig` 测试种子后 Integration 142 passed。
- `rg -n "EnsureCreated\(|EnsureCreatedAsync\(" src/backend src/tests -g "*.cs"` 无匹配。
- 后端回归：Unit 312 passed。

边界说明：

- `dotnet ef migrations has-pending-model-changes` 需要设计时连接串；本轮使用临时本地连接串环境变量完成只读模型检查，未执行数据库更新。

## Sprint 0 / 0.9 追加审计

0.9 验收：

- 删除 `ReportEndpoints` 的随机/伪造 KPI；未实现或无真实数据时不返回看似真实的默认值。

当前实现：

- `ReportEndpoints` 已无 `Random.Shared`。
- 删除 `GetDefaultChartData` fallback；日报产量和每日缺陷只返回真实聚合结果，无数据即空数组。
- 异常统计从 `IAnomalyRepository.GetAllAsync` 获取全部真实异常，按真实 `AnomalyType` 聚合。
- `TotalAnomalies`、`OpenCount`、`ResolvedCount` 改为从真实异常状态计数，不再用 `criticalAnomalies.Count` 近似推导。

验证：

- 先红：新增 `GetDashboard_WithoutAnomalies_ShouldNotReturnFabricatedAnomalyDistribution` 清空异常后旧实现仍返回 `TotalAnomalies = 4`。
- 后绿：`ReportControllerTests` 6 passed。
- 后端回归：Integration 143 passed；Unit 312 passed。

边界说明：

- `AvailabilityRate` 中的 `Math.Max(1, equipment.Count)` 仅用于避免除零，不是伪造数据；当设备数为 0 时返回 0。
- 报表导出沿用 dashboard 构建结果，因此 Excel/PDF 导出测试随同 `ReportControllerTests` 覆盖。

## Sprint 0 / 0.10-0.11 追加审计

0.10 验收：

- `eval.ps1` 读取真实 golden 数据。
- golden 缺失、为空或解析失败时 fail-closed，不得跳过后仍通过。

当前实现：

- `eval.ps1` 对每个 agent 读取 `Data/golden_*.json`。
- 缺文件、JSON 解析异常、`testCases` 为空都会写入失败结果并最终 `exit 1`。
- `MES.Tests.Evaluation` 新增 `EvalScriptTests`，用临时目录复制脚本和数据集，覆盖缺 golden 与空 `testCases`。
- `eval_results.json` 已刷新，当前不再包含旧的 `skipped-no-data` 标记。

0.11 验收：

- `eval.yml` 从 `v1/.github/workflows/` 移到根 `.github/workflows/`。

当前实现：

- `v1/.github/workflows/eval.yml` 已删除。
- 当前工作区根目录 `C:\AIWorks\AIMes` 不是 git 仓库，但按计划位置已创建 `C:\AIWorks\AIMes\.github\workflows\eval.yml`。
- 根 workflow 使用 `working-directory: ./v1`，先运行 Unit 与 Evaluation 测试，再执行 `pwsh src/tests/MES.Tests.Evaluation/eval.ps1`。

验证：

- 先红：新增 Evaluation 测试在旧脚本下 2 failed，证明缺 golden / 空 `testCases` 都会 fail-open。
- 后绿：Evaluation 项目 2 passed。
- `pwsh .\src\tests\MES.Tests.Evaluation\eval.ps1` 输出 `EVALUATION PASSED`。
- 后端回归：Unit 312 passed；Integration 143 passed。

边界说明：

- Sprint 0 范围只让 eval gate 有真实 golden 读取与 fail-closed 信号；完整 eval 平台化（趋势、token 预算、业务有效性验证）已按 CEO review 延后到 E2。
- 当前脚本仍以现有启发式 `passCount = total` 计算，本轮未实现真正 Agent 推理评分；该深度归入后续 C6/E2，不混入 0.10。

## Sprint 0 / 0.15 追加审计

0.15 验收：

- 新建架构测试。
- 断言 AppService 无 static 可变字段。
- 断言 Endpoints 不依赖 `System.Random`。
- 断言 Domain 不引用 MediatR。
- 断言 Application 不引用 ClosedXML / QuestPDF。
- 断言仓储读方法包含 `AsNoTracking()`。

当前实现：

- 新增 `src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj` 与 `ArchitectureRuleTests`。
- `src/backend/AIMes.slnx` 纳入 `MES.ArchitectureTests`。
- `IDomainEvent` 不再继承 MediatR `INotification`；Domain 项目移除 `MediatR` 包引用。
- Infrastructure 新增 `DomainEventNotification<TDomainEvent>`，由 `DomainEventDispatcher` 包装领域事件后通过 MediatR 发布。
- `DomainEventIntegrationPublisher` 的 handlers 改为处理 `DomainEventNotification<T>`。
- `ExportAppService` 实现移到 Infrastructure；Application 只保留 `IExportAppService` 接口，避免 Application 直接依赖渲染库。
- 多个仓储 read 方法补 `AsNoTracking()`；对需要 tracking 的质量处置写路径新增 `GetForUpdateAsync`，避免把写模型误塞进 read 方法规则。

验证：

- 先红：架构测试初始运行暴露 Application 导出库依赖、仓储读方法缺 `AsNoTracking()`；补强 MediatR 断言后暴露 `MediatR.Contracts`。
- 后绿：`MES.ArchitectureTests` 5 passed。
- 针对性回归：质量处置写路径 1 passed。
- 后端回归：Unit 312 passed；Integration 143 passed。

边界说明：

- `RepositoryReadQueries_ShouldUseAsNoTracking` 是基于源码扫描的轻量门禁，不是完整 Roslyn analyzer；它覆盖当前仓储命名/方法体风格，若后续改风格应同步测试。
- 并行运行多个 `dotnet test` 会竞争同一 build output，曾出现文件锁；本轮最终验证均为串行通过。

## Sprint 0 / 0.4 追加审计

0.4 验收：

- `AnomalyAppService.GetOpenAnomaliesAsync` 真实查询仓储。
- open 异常列表不得由全量仓储结果在服务层误复用，分页总数也必须按 open 口径计算。

当前实现：

- `IAnomalyRepository` 新增 `GetOpenPagedAsync` 与 `CountOpenAsync`。
- `AnomalyRepository` 在数据库查询中按 `Open` / `Acknowledged` 过滤，再排序与分页。
- `AnomalyAppService.GetOpenAnomaliesAsync` 使用 open 专用仓储方法生成列表和 `TotalCount`。
- 新增 `AnomalyControllerTests.GetAll_ShouldReturnOnlyOpenAnomalies`，用接口级行为证明 resolved 异常不会混入 open 列表。

验证：

- 先红：旧实现使用 `CountAsync` / `GetPagedAsync`，测试中 `Resolved` 异常出现在 `/api/v1/anomaly` 响应里。
- 后绿：目标集成测试 1 passed。

边界说明：

- 本轮只修 0.4 open 列表口径；异常写路径仍复用现有 `GetByIdAsync` + `UpdateAsync` 模式，后续如暴露 no-tracking 写入问题，应按质量处置模式新增 `GetForUpdateAsync`。

## Sprint 0 / 0.5 追加审计

0.5 验收：

- `BomAppService.GetAllBomsAsync` 真实查询仓储。
- BOM 列表分页不得在 Application 层通过全量 `GetAllAsync` 后 `Skip` / `Take` 完成。

当前实现：

- `IBomRepository` 新增 `GetPagedAsync` 与 `CountAsync`。
- `BomRepository` 在 EF 查询中排序、分页、计数，并保持读查询 `AsNoTracking()`。
- `BomAppService.GetAllBomsAsync` 只调用仓储分页与计数，再映射 DTO。
- `MES.ArchitectureTests` 新增并扩展 `ListAppServices_ShouldUseRepositoryPaging`，禁止 BOM / Employee / Purchase 列表回退到服务层内存分页。

验证：

- 先红：架构测试在旧实现下失败，证明 `_bomRepo.GetAllAsync` + `.Skip(` / `.Take(` 仍存在。
- 后绿：目标架构测试 1 passed。
- 目标回归：`BomControllerTests` 4 passed。

边界说明：

- 行为集成测试主要验证 BOM 创建、查询、展开、齐套仍可用；仓储级分页要求由架构测试覆盖，因为小数据行为无法可靠区分数据库分页和内存分页。

## Sprint 0 / 0.6 追加审计

0.6 验收：

- `EmployeeAppService._employees` 静态列表迁移到 `IEmployeeRepository`。
- 员工列表分页不得在 Application 层全量加载后内存分页。

当前实现：

- 当前 `EmployeeAppService` 已无 `_employees` 静态列表，构造函数注入 `IEmployeeRepository`。
- `IEmployeeRepository` 新增 `GetPagedAsync` 与 `CountAsync`。
- `EmployeeRepository` 在 EF 查询中排序、分页、计数，并保持读查询 `AsNoTracking()`。
- `EmployeeAppService.GetAllAsync` 使用仓储分页与计数，再映射 DTO。
- 列表仓储分页架构门禁扩展到 `EmployeeAppService`。

验证：

- 先红：`ListAppServices_ShouldUseRepositoryPaging` 在旧实现下失败，指出 `EmployeeAppService.GetAllAsync` 缺少 `GetPagedAsync` / `CountAsync`。
- 后绿：目标架构测试 1 passed。
- 目标单测：`EmployeeAppServiceTests` 10 passed。
- 目标集成：`EmployeeControllerTests` 7 passed。

边界说明：

- `GetByTeamAsync` 当前仍返回团队全量列表；Sprint 0 / 0.6 计划只要求移除静态员工列表与主列表仓储迁移，团队筛选分页可归入后续 H13 分页治理。

## Sprint 0 / 0.7-0.8 追加审计

0.7 验收：

- `InventoryAppService._transactions` 迁移到 `IStockTransactionRepository`。

当前 0.7 实现：

- `InventoryAppService` 已无 `_transactions` 静态列表。
- 交易列表读取使用 `IStockTransactionRepository.GetPagedAsync`。
- 库存入库、出库、转移、调整均通过 `IStockTransactionRepository.AddAsync` 记录交易。
- `StockTransactionRepository` 使用 EF `StockTransactions` DbSet 持久化交易。

0.8 验收：

- `PurchaseAppService._orders` 迁移到 `IPurchaseOrderRepository`。
- 采购列表分页不得在 Application 层全量加载后内存分页。

当前 0.8 实现：

- `PurchaseAppService` 已无 `_orders` 静态列表，构造函数注入 `IPurchaseOrderRepository`。
- `IPurchaseOrderRepository` 新增 `GetPagedAsync` 与 `CountAsync`。
- `PurchaseOrderRepository` 在 EF 查询中排序、分页、计数，并保持读查询 `AsNoTracking()`。
- `PurchaseAppService.GetAllAsync` 使用仓储分页与计数，再映射 DTO。
- 列表仓储分页架构门禁扩展到 `PurchaseAppService`。

验证：

- 0.7 搜索审计未发现 `_transactions` / `StockTransaction` 静态列表。
- 0.7 单测：`InventoryAppServiceTests` 10 passed。
- 0.7 集成：`InventoryControllerTests` 7 passed。
- 0.8 先红：`ListAppServices_ShouldUseRepositoryPaging` 在旧实现下失败，指出 `PurchaseAppService.GetAllAsync` 缺少 `GetPagedAsync` / `CountAsync`。
- 0.8 后绿：目标架构测试 1 passed。
- 0.8 单测：`PurchaseAppServiceTests` 10 passed。
- 0.8 集成：`PurchaseControllerTests` 7 passed。
- 采购 Agent 写路径回归：`AgentExecutePurchaseAction_WithReceiptPayload_ShouldReceivePurchaseOrderAndAuditBusinessWrite` 1 passed。

边界说明：

- Inventory 交易接口当前前端类型为 `StockTransaction[]`，本轮不改 API 响应形状；交易总数仓储方法已存在，可在后续分页 UX/API 统一时升级为 `PagedResult<StockTransactionDto>`。
- Purchase 写路径仍复用现有 `GetByIdAsync` + `UpdateAsync` 模式；当前采购控制器生命周期测试与 Agent 采购收货写路径均通过，如后续出现 owned collection/no-tracking 写入问题，应按质量处置路径新增 tracking 查询方法。

## Sprint 0 / 前端 lint 追加审计

验收：

- `npm run lint` 必须在 ESLint 10 下可运行。
- `--max-warnings 0` 下不得留存真实语义 warning。
- 关闭规则必须有明确边界，不得用全局静默掩盖安全或类型问题。

当前实现：

- `src/frontend/eslint.config.cjs` 适配 ESLint 10 flat config。
- 关闭 `vue/comment-directive` 与 Vue 模板格式类噪声规则；`vue/no-v-html` 仅对 `ChatPanel.vue` 局部关闭。
- 新增 `src/frontend/src/utils/error-message.ts`，让错误处理从 `any` 收窄到 `unknown`。
- 演示数据与 dhtmlx-gantt 临时 `$css` 字段改为 DTO / 局部交叉类型。
- 删除未使用导入、未使用变量；员工卡片点击改为调用 `openEdit(e)`，避免编辑表单未初始化。

验证：

- 配置迁移后红项：`npm run lint` 暴露 196 errors / 4444 warnings。
- 语义清理中间态：ESLint JSON 为 0 errors / 57 warnings，剩余集中在 unused、`any`、`v-html`。
- 后绿：`npm run lint` 0 warnings。
- 前端构建：`npm run build` 通过；Node `DEP0180` 仍为非阻断 warning。

边界说明：

- 本轮未把所有 Vue 模板格式问题转成代码格式化；格式类噪声已在 ESLint 配置中关闭，避免 4000+ warning 淹没语义门禁。
- `ChatPanel.vue` 的 `v-html` 安全前提是 `renderMarkdown` 先执行 HTML 转义，再替换有限 markdown 标签；若后续支持更复杂 markdown，应引入 sanitizer 并重新打开审计。
