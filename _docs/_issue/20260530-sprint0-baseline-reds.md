# 2026-05-30 Sprint 0 基线红项

## S0-BL-001：前端 lint 质量门不可运行

- 命令：`npm run lint`
- 当前结果：已修复为可执行且通过。
- 已处理：新增 `src/frontend/eslint.config.cjs`，适配 `eslint@10.3.0` flat config。
- 后续处理：清理真实语义 warning，关闭 Vue 格式类噪声规则；`vue/no-v-html` 仅对已先转义的 `ChatPanel.vue` 局部关闭。
- 验证：`npm run lint` 通过，0 errors / 0 warnings。

## S0-BL-002：Production E2E 工序列表用例稳定失败

- 命令：`npm run test:e2e -- --reporter=list`
- 当前结果：已修复目标用例。
- 失败用例：`tests/e2e/production.spec.ts:115`，`Production 生产看板 › 工单详情显示工序列表`。
- 直接原因：`page.getByText('工序')` 命中 `工序执行与回写` 和 `<h4>工序</h4>` 两个元素，触发 Playwright strict mode violation。
- 附件：`src/frontend/test-results/production-Production-生产看板-工单详情显示工序列表-chromium-retry1/trace.zip`。
- 修复：定位器收窄为 `.operations-section` 下的 `heading`。
- 验证：`npm run test:e2e -- --reporter=list tests/e2e/production.spec.ts` 21 passed。

## S0-BL-003：Evaluation 测试项目没有形成有效测试门

- 命令：`dotnet test .\src\tests\MES.Tests.Evaluation\MES.Tests.Evaluation.csproj`
- 当前结果：已修复为可发现测试项目。
- 已新增：`EvalScriptTests` 覆盖缺 golden 与空 `testCases` 两条 fail-closed 路径。
- 验证：`dotnet test .\src\tests\MES.Tests.Evaluation\MES.Tests.Evaluation.csproj --no-restore` 2 passed。
- 剩余边界：当前测试覆盖 eval 脚本门禁行为，不等同于完整 Agent 推理评分平台；平台化已延后到 E2。

## S0-BL-004：Production host 当前仍会自动迁移数据库

- 触发场景：使用完整 Production host 做 CORS 预检测试。
- 当前结果：已修复。Production 启动路径不再调用 `dbContext.Database.MigrateAsync()`，改为检查 pending migrations。
- 计划归属：Sprint 0 / 0.12。
- 验证：`DatabaseStartupValidatorTests` 4 passed；后端 Integration 142 passed；后端 Unit 312 passed。
- 后续跟进：0.13 已确认无 pending model changes；0.14 已删除 `EnsureCreated()` / `EnsureCreatedAsync()` 调用。

## S0-BL-005：删除 EnsureCreated 后 Integration HasData 不再隐式注入

- 触发场景：删除 `TestDataSeedFilter` 中的 `db.Database.EnsureCreated()` 后运行 Integration。
- 当前结果：已修复。
- 失败用例：`AdminControllerTests.GetConfigs_ShouldReturnOk`、`AdminControllerTests.UpdateConfig_ShouldChangeValue`。
- 直接原因：Integration InMemory 过去依赖 `EnsureCreated()` 注入 EF `HasData` 中的 `SystemConfig`；删除后配置列表为空。
- 修复：在 `TestDataSeedFilter` 中显式 upsert `SystemConfig` 三条测试配置，不再依赖 schema 创建副作用。
- 验证：后端 Integration 142 passed；后端 Unit 312 passed；`EnsureCreated` 全仓搜索无匹配。

## S0-BL-006：Report dashboard 无异常时仍返回伪造异常分布

- 触发场景：清空 `ProductionAnomalies` 后请求 `/api/v1/report/dashboard`。
- 当前结果：已修复。
- 失败用例：`ReportControllerTests.GetDashboard_WithoutAnomalies_ShouldNotReturnFabricatedAnomalyDistribution`。
- 直接原因：`ReportEndpoints` 基于 `criticalAnomalies.Count` 和 `Math.Max(1, ...)` 伪造 4 类异常分布，导致真实 0 异常时返回 `TotalAnomalies = 4`。
- 修复：新增 `IAnomalyRepository.GetAllAsync`，dashboard 使用真实异常列表按类型和状态聚合；无数据返回 0 和空数组。
- 验证：`ReportControllerTests` 6 passed；后端 Integration 143 passed；后端 Unit 312 passed。

## S0-BL-007：eval.ps1 对缺失或空 golden fail-open

- 触发场景：删除某个 `golden_*.json`，或将 `testCases` 置为空数组后运行 `eval.ps1`。
- 当前结果：已修复。
- 直接原因：旧脚本缺文件时标记 `skipped = true` 且 `pass = true`；空 `testCases` 时 precision 被设为 1.0。
- 修复：缺文件、解析失败、缺/空 `testCases` 均写入失败结果并最终 `exit 1`。
- 验证：新增 Evaluation 测试先红后绿；`pwsh .\src\tests\MES.Tests.Evaluation\eval.ps1` 当前通过真实 golden。

## S0-BL-008：eval.yml 位于 v1 子目录导致根 CI 不生效

- 当前结果：已修复到计划根目录。
- 修复：删除 `v1/.github/workflows/eval.yml`，新增 `C:\AIWorks\AIMes\.github\workflows\eval.yml`。
- 验证：路径检查显示 v1 workflow 不存在，计划根 workflow 存在。
- 边界：`C:\AIWorks\AIMes` 当前不是 git 仓库，根 workflow 文件位于工作区根但不属于 `v1` git diff。

## S0-BL-009：Sprint 0 架构规则此前没有自动门禁

- 当前结果：已修复。
- 覆盖规则：AppService 无 static 可变字段；Endpoint 不使用 `System.Random`；Domain 不引用 `MediatR*`；Application 不引用 ClosedXML/QuestPDF；仓储读方法使用 `AsNoTracking()`。
- 初始红项：Application 直接引用导出库；若干仓储 read 方法缺 `AsNoTracking()`；Domain 通过 `MediatR.Contracts` 间接引用 MediatR。
- 修复：新增 `MES.ArchitectureTests`；移除 Domain MediatR 依赖；导出实现下沉到 Infrastructure；补仓储 no-tracking；质量写路径使用 `GetForUpdateAsync` 保留 tracking。
- 验证：Architecture 5 passed；Unit 312 passed；Integration 143 passed。

## S0-BL-010：仓储 read no-tracking 改动暴露质量写路径 tracking 依赖

- 触发场景：`QualityInspectionRepository.GetByIdAsync` 改成 `AsNoTracking()` 后，Agent 质量处置写入 owned collection。
- 当前结果：已修复。
- 失败用例：`SchedulingControllerTests.AgentExecuteQualityDisposition_WithInspectionPayload_ShouldRecordDefectAndAuditBusinessWrite`。
- 直接原因：写路径复用了 read 方法，no-tracking 实体更新 owned collection 时 EF 无法保存 shadow key。
- 修复：新增 `IQualityInspectionRepository.GetForUpdateAsync`，写路径改用 tracking 查询；read 方法继续保持 no-tracking。
- 验证：目标 Integration 用例 1 passed；全量 Integration 143 passed。

## S0-BL-011：Anomaly open 列表复用全量分页仓储导致 resolved 混入

- 触发场景：同时存在 `Open` 与 `Resolved` 异常后，请求 `/api/v1/anomaly`。
- 当前结果：已修复。
- 失败用例：`AnomalyControllerTests.GetAll_ShouldReturnOnlyOpenAnomalies`。
- 直接原因：`AnomalyAppService.GetOpenAnomaliesAsync` 调用 `CountAsync` / `GetPagedAsync`，仓储方法未按 open 状态过滤。
- 修复：新增 `IAnomalyRepository.GetOpenPagedAsync` / `CountOpenAsync`，仓储层按 `Open` / `Acknowledged` 过滤后再分页和计数。
- 验证：目标 Integration 用例 1 passed。

## S0-BL-012：BOM 列表在 Application 层全量加载后内存分页

- 触发场景：`BomAppService.GetAllBomsAsync` 列表查询。
- 当前结果：已修复。
- 失败用例：`ArchitectureRuleTests.ListAppServices_ShouldUseRepositoryPaging`。
- 直接原因：旧实现调用 `_bomRepo.GetAllAsync` 取全量 BOM，再在 Application 层 `.Skip(...).Take(...)`。
- 修复：新增 `IBomRepository.GetPagedAsync` / `CountAsync`，Infrastructure 仓储负责数据库分页和计数，Application 只做 DTO 映射。
- 验证：目标 Architecture 用例 1 passed；`BomControllerTests` 4 passed。

## S0-BL-013：Employee 列表在 Application 层全量加载后内存分页

- 触发场景：`EmployeeAppService.GetAllAsync` 列表查询。
- 当前结果：已修复。
- 失败用例：`ArchitectureRuleTests.ListAppServices_ShouldUseRepositoryPaging`。
- 直接原因：旧实现调用 `_employeeRepo.GetAllAsync` 取全量员工，再在 Application 层 `.Skip(...).Take(...)`。
- 修复：新增 `IEmployeeRepository.GetPagedAsync` / `CountAsync`，Infrastructure 仓储负责数据库分页和计数，Application 只做 DTO 映射。
- 验证：目标 Architecture 用例 1 passed；`EmployeeAppServiceTests` 10 passed；`EmployeeControllerTests` 7 passed。

## S0-BL-014：Purchase 列表在 Application 层全量加载后内存分页

- 触发场景：`PurchaseAppService.GetAllAsync` 列表查询。
- 当前结果：已修复。
- 失败用例：`ArchitectureRuleTests.ListAppServices_ShouldUseRepositoryPaging`。
- 直接原因：旧实现调用 `_orderRepo.GetAllAsync` 取全量采购单，再在 Application 层 `.Skip(...).Take(...)`。
- 修复：新增 `IPurchaseOrderRepository.GetPagedAsync` / `CountAsync`，Infrastructure 仓储负责数据库分页和计数，Application 只做 DTO 映射。
- 验证：目标 Architecture 用例 1 passed；`PurchaseAppServiceTests` 10 passed；`PurchaseControllerTests` 7 passed。

## S0-BL-015：Inventory 静态交易列表需证明已迁仓储

- 触发场景：Sprint 0 / 0.7 要求 `InventoryAppService._transactions` 迁移到 `IStockTransactionRepository`。
- 当前结果：已审计通过，无新增代码修复。
- 证据：`InventoryAppService` 无 `_transactions`；`IStockTransactionRepository.GetPagedAsync` / `AddAsync` 与 `StockTransactionRepository` EF 实现存在；库存交易读写单测和集成测试通过。
- 验证：`InventoryAppServiceTests` 10 passed；`InventoryControllerTests` 7 passed。
