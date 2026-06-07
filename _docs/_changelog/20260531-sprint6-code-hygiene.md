# 2026-05-31 Sprint 6 Code Hygiene

## 变更

- 新增架构门禁 `Sprint6BackendCode_ShouldNotWriteDirectlyToConsole`，扫描 `src/backend` 下 C# 源码并禁止 `Console.Write*` / `System.Console.Write*`。
- 门禁排除 `bin`、`obj`、`wwwroot`，避免构建产物和前端静态资产误报。
- 将 `MES.Api/Program.cs` 启动横幅从直接 `Console.WriteLine` 改为 `ILogger<Program>.LogInformation(...)`。
- 启动日志保留地址、Dashboard、Swagger、Health、默认演示账号和商业说明文档信息，并使用结构化消息模板。
- 新增 `.github/pull_request_template.md`，把 6.7 的人工 PR 检查项落成模板：`static List`、`Console.Write*`、`.Result`、`.Wait()` 和 `ArchitectureTests`。
- 新增架构门禁 `Sprint6PullRequestTemplate_ShouldRequireCodeHygieneChecklist`，防止 PR 模板缺失或遗漏关键代码卫生检查项。
- 6.2 局部：`TestAuthHandler` 支持 `X-Test-Role` 多值和逗号分隔角色，生成多个 `ClaimTypes.Role` claim。
- 新增授权集成测试，验证同一测试身份同时具备 `Operator` 与 `Admin` 时可访问 Admin-only 端点。
- 6.3 局部：新增 `IntegrationSerialCollection`，定义显式 `IntegrationSerial` xUnit collection 并禁用 collection 内并行。
- 6.3 局部：为集成测试项目中的 `*Tests` 类标注 `[Collection("IntegrationSerial")]`。
- 新增架构门禁 `Sprint6IntegrationTests_ShouldUseExplicitSerialCollection`，防止新增集成测试类遗漏显式串行 collection。
- 6.4 局部：新增 `PerformanceTestWebApplicationFactory`，为 `PerformanceTests` 使用独立 `Performance_Test_DB` InMemory 数据库。
- 6.4 局部：新增 `PerformanceTestDataSeedFilter`，性能测试不再复用通用 `TestDataSeedFilter`。
- 新增架构门禁 `Sprint6PerformanceTests_ShouldUseDedicatedFactoryAndSeed`，防止性能测试回退到共享测试工厂、共享 DB 或共享种子。
- 6.5：移除 E2E 测试中的 `page.waitForTimeout(...)` 硬等待，改用可见 UI 状态、文本断言和现有加载状态。
- 新增架构门禁 `Sprint6E2eTests_ShouldNotUseHardWaits`，扫描 `src/frontend/tests/e2e/**/*.ts` 并禁止 `waitForTimeout`。
- 6.6 局部：引入 `vitest`、`@vue/test-utils` 和 `jsdom`，新增 `npm run test:unit`。
- 6.6 局部：新增 `vitest.config.ts`，以 jsdom 环境运行 `tests/unit/**/*.test.ts`，并复用 Vue 插件。
- 6.6 局部：新增 `tests/unit/auth.store.test.ts`，覆盖 `useAuth` 的后端登录持久化、离线 demo 登录绕过后端、Vue 组件响应式登出。
- 6.6 局部：`npm run lint` 扫描范围扩展到 `tests/unit` 和 `vitest.config.ts`，避免测试代码绕过 ESLint。
- 6.6 局部：新增 `tests/unit/error-message.test.ts`，覆盖 API `message`、ProblemDetails `title` 和 fallback。
- 6.6 局部：新增 `tests/unit/offline-demo-mode.test.ts`，覆盖 demo query 开关、localStorage 持久化、offline error 分类、日志抑制和 Nuxt base asset path。
- 6.6 局部：抽出 `tests/unit/test-storage.ts`，复用内存 `localStorage`，避免 jsdom/Node 运行时差异污染测试。
- 6.6 局部：`vitest.config.ts` 设置 `base: '/scheduling/'`，让 `import.meta.env.BASE_URL` 与 Nuxt `app.baseURL` 对齐。
- 6.6 局部：根 CI `C:\AIWorks\AIMes\.github\workflows\ci.yml` 的 frontend job 已在 lint 后、build 前运行 `npm run test:unit`。
- 6.6 局部：新增 `tests/unit/schedule-feedback-sync.test.ts`，覆盖排产反馈 snapshot 持久化、OTD 证据链镜像、坏 JSON 自清理和不完整 snapshot 忽略。
- 6.6 局部：新增 `tests/unit/risk-action-sync.test.ts`，覆盖风险处置 trace 本地写入、OTD 证据链镜像、后端 best-effort sync、同状态去重、状态转换保留、12 条截断和坏 JSON 自清理。
- 6.8 局部：新增 `scripts/check-cobertura-threshold.ps1`，读取 Cobertura XML 并在 line / branch 覆盖率低于阈值时失败。
- 6.8 局部：根 CI `C:\AIWorks\AIMes\.github\workflows\ci.yml` 的 backend job 在 Unit / Integration coverage 生成后执行 Coverage Threshold。
- 6.8 局部：覆盖率阈值先设为当前 Unit coverage 基线可过的保守值：line `10%`、branch `20%`，用于阻止显著倒退。
- 6.9 局部：新增 `CONTRIBUTING.md`，明确 issue-first 协作、PR 要求、本地检查、代码规则和 `_docs` 记录要求。
- 6.9 局部：新增 `SECURITY.md`，明确私下报告漏洞、版本支持、严重度分级、安全基线和披露规则。
- 6.9 局部：`README.md` 文档索引补充 `CONTRIBUTING.md` 与 `SECURITY.md` 入口。
- 6.10 局部：新增 `_docs/_adr/ADR-001` 至 `ADR-006`，补齐生产迁移、发布分层、审计分层、UoW 边界、架构门禁、AI 辅助安全合规审查的决策记录。
- 6.10 局部：新增 `_docs/_adr/ADR-010-cc-remediation-audit-decisions.md`，汇总 CC remediation 审计后已采纳的执行决策。
- 6.11 局部：新增 `VERSION`，当前值为 `0.1.0-remediation.20260531`，明确仍处于 remediation / Unreleased 阶段。
- 6.11 局部：`CHANGELOG.md` 新增 `Release Process`，记录 `v1.0.0` tag 前置门槛、tag 命令和 GitHub Release 证据要求。
- 6.11 局部：`CHANGELOG.md` 的 `Unreleased` 段汇总本轮治理文档、ADR 与版本流程变更。
- 6.1 局部：新增 `BomAppServiceTests` 3 条单测，覆盖仓储分页、BOM 多层级展开累计和齐套损耗率需求。
- 6.1 局部：`BomAppService.CheckKittingAsync` 通过共享展开逻辑把 `LossRate` 纳入需求量，避免齐套判断低估物料缺口。
- 6.1 局部：扩展 `BomExplosionServiceTests` 与 `MaterialKittingCheckerTests`，锁定基础设施层 BOM 展开和排产齐套预检也使用含损耗率需求。
- 6.1 局部：`BomExplosionService` 在源头将 `LossRate` 纳入 `BomRequirementSummary.QuantityPerUnit`，让 `MaterialKittingChecker`、`ConstraintValidator`、`SchedulingRuleEngine` 等消费者共享同一需求口径。
- 6.1 局部：新增 `AnomalyAppServiceTests` 4 条单测，覆盖异常创建严重度归一化、缺省严重度默认值、开放异常仓储分页/CT 传播、AI 分析建议优先级映射。
- 6.1 局部：`AnomalyAppService.CreateAnomalyAsync` 对 `Severity` 做 trim + 不区分大小写解析，避免 `" critical "` 等 API 输入被静默降级为 `Medium`；空值/未知值继续默认 `Medium`。
- 6.1 局部：新增 `AuditLogAppServiceTests` 3 条单测，覆盖审计列表分页脱敏视图、详情 payload/hash 映射、写入发起方与请求上下文。
- Sprint 3/H3 回归：新增 `EmployeeControllerTests.Create_ShouldPersistAuditLogFromEndpointFilter`，锁定 `AuditEndpointFilter` 写入的访问/操作审计必须落库。
- Sprint 3/H3 回归：`AuditEndpointFilter` 写审计时通过 `IUnitOfWork.ExecuteAsync` 包裹 `IAuditLogAppService.WriteAuditLogAsync`，避免过滤器审计只 `Add` 不 `SaveChanges`。
- 6.1 局部：新增 `RoutingAppServiceTests` 3 条单测，覆盖工艺路线创建时步骤工时/设备/质检/参数保真、按编码查询步骤排序、列表分页元数据。
- 6.1 局部：`RoutingAppService.CreateRouteAsync` 创建步骤时保留 `StandardSetupMinutes`、`StandardRunMinutesPerUnit`、`EquipmentType`、`InspectionRequired` 和工艺参数。
- 6.1 局部：`RoutingStep` 新增领域行为 `ConfigureStandards` / `AddParameter`，避免为应用层保真需求开放 setter。
- 6.1 局部：`ProcessRoute.AddStep` 保留请求中的 `StepSequence` 并按序排列步骤集合，避免插入乱序步骤后详情排序漂移。
- 6.1 局部：新增 `KnowledgeAppServiceTests` 3 条单测，覆盖知识查询检索与历史、空白文档跳过上传、文档上传分类元数据保留。
- 6.1 局部：`KnowledgeAppService.UploadDocumentAsync` 对空白文档返回 `Skipped`，不再调用 LLM embedding 或向量库 upsert。
- 6.1 局部：`KnowledgeAppService.SplitIntoChunks` 到达文末时退出循环，并过滤空白 chunk，避免短文档/空白文档因 overlap 回退导致无限循环。
- 6.1 局部：新增 `DashboardKpiServiceTests` 3 条单测，覆盖排产达成率 OTD 口径、设备/质量/物料告警映射、仓储 CT 传播。
- Sprint 4/B3 回归：`DashboardKpiService` 的 `ScheduleAdherence` 改为复用 `ProductionKpiCalculator.CalculateOnTimeRate`，与 Report OTD 口径一致，把超期未完成工单纳入分母。
- 6.1 局部：新增 `RiskAppServiceTests` 3 条单测，覆盖演示数据标记、UTC 生成时间、四类风险计数汇总和前端消费字段契约。
- 6.1 局部：`RiskAppService.GetRiskDashboardAsync` 的 `GeneratedAt` 改为 `DateTime.UtcNow`，避免 API 返回服务器本地时区时间。
- 6.1 局部：新增 `ScheduleAgentServiceTests` 3 条单测，覆盖最近决策查询映射、跨域动作缺失决策失败路径、策略拒绝 fallback 审计留痕。
- 6.1 局部：`ScheduleAgentService.RecordPolicyRejectionAsync` 现在把默认拒绝原因同时写入 `AgentActionResult.Reason` 和审计 payload，保证权限拒绝回放证据不丢原因。
- 6.1/ScheduleAgent evidence 局部：新增 `UpsertRiskActionTraceAsync_ShouldPersistEventTimestampForEvidenceOrdering`，锁定风险处置证据按业务事件时间写入 `AgentEvidenceLink.CreatedAt`，避免后端按当前保存时间排序导致证据回放顺序漂移。
- 6.1/ScheduleAgent evidence 局部：`ScheduleAgentService.UpsertRiskActionTraceAsync` 现在解析 `RiskActionTraceDto.CreatedAt` 为 UTC 时间写入 evidence；解析失败时才回退 `DateTime.UtcNow`。
- 6.1/ScheduleAgent evidence 局部：新增 `UpsertAssistantActionAuditAsync_ShouldPersistEventTimestampForEvidenceOrdering`，锁定助手动作审计证据按业务动作发生时间排序。
- 6.1/ScheduleAgent evidence 局部：`ScheduleAgentService.UpsertAssistantActionAuditAsync` 现在解析 `AssistantActionAuditRecordDto.CreatedAt` 为 UTC 时间写入 evidence；解析失败时才回退 `DateTime.UtcNow`。
- 6.1/ScheduleAgent evidence 局部：新增 `UpsertAnomalyDispatchRecordAsync_ShouldPersistEventTimestampForEvidenceOrdering`，锁定异常分流证据按分流事件时间排序。
- 6.1/ScheduleAgent evidence 局部：`ScheduleAgentService.UpsertAnomalyDispatchRecordAsync` 现在解析 `AnomalyDispatchRecordDto.CreatedAt` 为 UTC 时间写入 evidence；解析失败时才回退 `DateTime.UtcNow`。
- 6.1/ScheduleAgent evidence 局部：新增 `UpsertMonitoringSituationEscalationAsync_ShouldPersistClosedTimestampForEvidenceOrdering`，锁定现场态势升级闭环证据按闭环事件时间排序。
- 6.1/ScheduleAgent evidence 局部：`ScheduleAgentService.UpsertMonitoringSituationEscalationAsync` 现在优先解析 `MonitoringSituationEscalationDto.ClosedAt`，缺失时解析 `CreatedAt`，再写入 evidence；解析失败时才回退 `DateTime.UtcNow`。
- 6.1/ScheduleAgent evidence 局部：新增 `UpsertRiskSlaReviewAsync_ShouldPersistClosedTimestampForEvidenceOrdering`，锁定风险 SLA 复核闭环证据按闭环事件时间排序。
- 6.1/ScheduleAgent evidence 局部：`ScheduleAgentService.UpsertRiskSlaReviewAsync` 现在优先解析 `RiskSlaReviewRecordDto.ClosedAt`，缺失时解析 `CreatedAt`，再写入 evidence；解析失败时才回退 `DateTime.UtcNow`。
- 6.1/ScheduleAgent evidence 局部：新增架构门禁 `Sprint6ScheduleAgentEvidenceLinks_ShouldSetBusinessEventTimestamp`，扫描 `ScheduleAgentService` 中所有 `new AgentEvidenceLink` 初始化块，要求显式设置 `CreatedAt` 且禁止 `CreatedAt = DateTime.UtcNow`。
- 6.1/ScheduleAgent evidence 局部：新增 `QueryRiskActionTracesAsync_ShouldSkipInvalidEvidenceAndUseDefaultTake`，锁定风险处置查询会跳过坏 JSON evidence，并在 `take <= 0` 时使用默认 12 条上限。
- 6.1/ScheduleAgent code hygiene 局部：新增架构门禁 `Sprint6ScheduleAgentService_ShouldNotUseNullForgivingOperator`，禁止 `ScheduleAgentService` 使用 null-forgiving 压制。
- 6.1/ScheduleAgent code hygiene 局部：`ScheduleAgentService` 查询映射链路改用 `WhereNotNull(...)` helper 过滤反序列化失败项，移除 `item!`。
- 6.7 局部：新增架构门禁 `Sprint6CriticalBackendFiles_ShouldNotUseNullForgivingOperator`，覆盖 `SchedulingContextProvider` 与 `ReportEndpoints` 两条关键排产/报表路径。
- 6.7 局部：`SchedulingContextProvider` 的 route code 收集改为先投影可空 route code，再用模式匹配过滤非空字符串，移除 `RouteCode!`。
- 6.7 局部：`ReportEndpoints` 的日生产报表按 `ActualEndDate.GetValueOrDefault().Date` 投影已完成且有实际结束时间的工单，移除 `ActualEndDate!`。
- 6.7 局部：新增架构门禁 `Sprint6AdminTokenRepositories_ShouldNotUseNullForgivingOperator`，覆盖通知配置与刷新令牌仓储。
- 6.7 局部：`NotificationConfigRepository` 与 `RefreshTokenRepository` 直接使用 `MesDbContext` 的非空 DbSet 属性，移除 `NotificationConfigs!` / `RefreshTokens!`。
- 6.7 局部：新增架构门禁 `Sprint6AuthEndpoints_ShouldNotUseNullForgivingForTokenClaims`，覆盖认证端点签发 token 前的 `role` / `displayName` claim 收窄。
- 6.7 局部：`AuthEndpoints.LoginAsync` 在认证成功后显式要求 `role` 与 `displayName` 非空，再记录登录、签发 JWT 和 refresh token，移除 `role!` / `displayName!`。
- 6.7 局部：新增架构门禁 `Sprint6ExceptionMiddleware_ShouldNotUseNullForgivingForProblemStatus`，覆盖全局异常响应状态码写入路径。
- 6.7 局部：`ExceptionMiddleware` 改为先读取 `ProblemDetails.Status` 到显式 `problemStatus`，缺失时 fail loud，移除 `problem.Status!.Value`。
- 6.7 局部：新增架构门禁 `Sprint6EndpointHandlers_ShouldNotUseDefaultNullForgivingParameters`，扫描 `MES.Api/Endpoints` 中的 `= default!`。
- 6.7 局部：重排 `AuditLogEndpoints`、`InventoryEndpoints`、`BomEndpoints`、`QualityEndpoints`、`KnowledgeEndpoints`、`SchedulingEndpoints.GetWorkOrdersAsync` 的 handler 参数，把 DI/CT 放到可选 query 默认值前，移除最后一批 Endpoint `default!` 压制。
- 6.1 局部：新增 `OperationServiceTests` 3 条单测，覆盖扫码创建执行并绑定工位/人员、开工同步关联工单状态、完工在 UoW 内更新执行/工单/报工。
- 6.1 局部：`OperationService.StartAsync` 在工序执行开工时同步启动可启动的关联工单，并传播调用方 `CancellationToken` 保存工单状态。
- 6.1 局部：新增 `ProductionControllerTests.ProductionFlow_ShouldScanStartAndCompleteOperation`，通过 HTTP 覆盖扫码 → 开工 → 完工正向链路，并验证 EF 中工单、工序执行、报工记录最终状态。
- Sprint 2/B4 延伸：新增架构门禁 `ProductionOperationRepositories_ShouldNotCommitInsideOperationUnitOfWork`，防止 `OperationRepository` 和 `WorkOrderRepository.UpdateAsync` 在生产报工事务边界内自提交。
- Sprint 2/B4 延伸：`OperationRepository.AddExecutionAsync` / `UpdateExecutionAsync` / `AddReportAsync` 与 `WorkOrderRepository.UpdateAsync` 移除内部 `SaveChangesAsync`，由调用方 UoW 或外层提交统一保存。
- Sprint 2/B4 延伸：`OperationService.ScanAsync` 的创建/绑定写路径改为通过 `IUnitOfWork.ExecuteAsync` 提交，避免仓储去自提交后扫码执行记录不落库。
- Sprint 2/B4 延伸：新增 `OperationTransactionRepositoryTests.CompleteAsync_WhenReportWriteFails_ShouldRollbackExecutionAndWorkOrderUpdates`，用 SQLite in-memory 关系型 provider 验证完工报工失败时工序执行、工单完成数和报工记录整体回滚。

## 验证

- 红灯：新增门禁曾因 `MES.Api/Program.cs:479: Console.WriteLine();` 失败。
- 红灯：新增 PR 模板门禁曾因 `.github/pull_request_template.md` 不存在失败。
- 红灯：新增多角色授权测试曾因 `/api/v1/admin/users` 返回 `403 Forbidden` 失败。
- 红灯：新增集成测试串行化门禁曾因缺少 `IntegrationSerial` collection definition 失败。
- 红灯：新增性能测试隔离门禁曾因缺少 `PerformanceTestWebApplicationFactory.cs` 失败。
- 红灯：新增 E2E 硬等待门禁曾因 `dashboard.spec.ts:26: await page.waitForTimeout(1000)` 失败。
- 红灯：新增 `npm run test:unit` 后曾因 `vitest` 未安装失败：`'vitest' is not recognized as an internal or external command`。
- 红灯：安装 Vitest 后，`auth.store.test.ts` 曾因测试环境 `localStorage.clear is not a function` 失败，随后改为显式内存 Storage。
- 红灯：扩展 `offline-demo-mode.test.ts` 后曾因 `appAssetPath('/reports/latest-ab-report.json')` 返回 `/reports/...` 而非 `/scheduling/reports/...` 失败。
- 红灯：新增 `risk-action-sync.test.ts` 后曾因动态 import mock 未拦截 `riskEvidence`，实际触发 jsdom XHR 噪音且 `queryRiskActionTraces` 断言失败。
- 红灯：执行 `pwsh scripts/check-cobertura-threshold.ps1 ...` 曾因脚本不存在失败。
- 红灯：用临时 Cobertura 样本验证门禁，line coverage `50.00%` 在阈值 `60.00%` 下失败。
- 红灯：6.9 检查曾确认 `CONTRIBUTING.md` / `SECURITY.md` 不存在，README 文档索引也缺少治理入口。
- 红灯：6.10 检查曾确认仓库没有 `_docs/_adr` 目录，也没有 `ADR-001` 至 `ADR-006` / `ADR-010` 文件。
- 红灯：6.11 检查曾确认 `VERSION` 不存在，且 `CHANGELOG.md` 没有 `v1.0.0` tag 流程和当前 remediation 版本标记。
- 红灯：新增 `BomAppServiceTests.CheckKittingAsync_ShouldIncludeLossRateInRequiredQuantity` 后，旧实现把 `10 * 2` 视为 `20`，没有把 `10%` 损耗算成 `22`，导致 `AllAvailable` 错误为 `true`。
- 红灯：首次并行运行 `BomAppServiceTests` 与 `BomControllerTests` 触发 `MES.Application.dll` 文件锁；根因是同一 .NET 输出目录被并发写入，随后改为串行验证。
- 红灯：新增 `BomExplosionServiceTests.ExplodeAsync_ShouldIncludeLossRateInQuantityPerUnit` 后，旧基础设施展开仍返回 `10` 而非 `11`。
- 红灯：新增 `MaterialKittingCheckerTests.CheckAsync_ShouldUseLossAdjustedBomRequirement` 后，旧排产齐套预检仍把库存 `20` 误判为足够。
- 红灯：新增 `AnomalyAppServiceTests.CreateAnomalyAsync_WhenSeverityHasDifferentCasingAndWhitespace_ShouldPreserveCriticalSeverity` 后，旧实现把 `" critical "` 映射为 `Medium` 而非 `Critical`。
- 红灯：审计发现 `request.Severity.Trim()` 会在显式传 `null` 时抛 `NullReferenceException`；新增 `CreateAnomalyAsync_WhenSeverityIsNull_ShouldDefaultToMedium` 后复现该失败。
- 红灯：首次 null-safe 修复触发 nullable warning as error，`value.Equals(...)` 被编译器判定可能空引用，随后改用 `string.Equals(...)`。
- 红灯：新增 `EmployeeControllerTests.Create_ShouldPersistAuditLogFromEndpointFilter` 后，创建员工返回 `201 Created`，但 `db.AuditLogs` 为空，证明过滤器审计路径未持久化。
- 红灯：首次新增 `AuditLogAppServiceTests` 使用了当前 FluentAssertions 版本不存在的 `MatchEquivalentOf`，编译失败；已改为逐字段断言。
- 红灯：新增 `RoutingAppServiceTests.CreateRouteAsync_ShouldPreserveStepTimingEquipmentInspectionAndParameters` 后，旧实现返回 `StandardSetupMinutes = 0`，证明创建路线时工时/设备/质检/参数被丢弃。
- 红灯：新增 `RoutingAppServiceTests.GetRouteByCodeAsync_WhenFound_ShouldReturnStepsOrderedBySequenceWithParameters` 后，旧 `ProcessRoute.AddStep` 在乱序插入时返回 `OP-020, OP-010`，步骤排序语义漂移。
- 红灯：第一次调整 `ProcessRoute.AddStep` 仍通过 `ReorderSteps` 重写序号，导致乱序插入保持错误顺序；随后改为保留 `StepSequence` 并排序集合。
- 红灯：首次运行 `KnowledgeAppServiceTests` 因测试调用 `GetChatHistoryAsync` 参数位置错误编译失败，已改为命名参数 `ct`。
- 红灯：修正编译后运行 `KnowledgeAppServiceTests` 触发 120s 超时；根因是 `SplitIntoChunks` 对空白/短文档执行 `position = end - overlap` 后回退到 0，循环不前进。
- 红灯：新增 `DashboardKpiServiceTests.ComputeDashboardAsync_ShouldCountOverdueUnfinishedWorkOrdersInScheduleAdherenceDenominator` 后，旧实现只用已完成工单作分母，返回 `50.0` 而非预期 `33.3`。
- 红灯：新增 `RiskAppServiceTests.GetRiskDashboardAsync_ShouldReturnDemoFlagAndUtcGeneratedAt` 后，旧实现返回 `DateTimeKind.Local` 而非 `Utc`。
- 红灯：新增 `ScheduleAgentServiceTests.RecordPolicyRejectionAsync_WhenDecisionIsMissing_ShouldPersistFallbackAuditWithDenialReason` 后，旧审计 payload 为 `reason:null`，没有携带默认拒绝原因。
- 红灯：新增 `OperationServiceTests.StartAsync_ShouldStartExecutionAndMoveCreatedWorkOrderToInProgress` 后，旧实现只把工序执行置为 `Running`，关联工单仍停留在 `Created`。
- 红灯：新增 `ProductionOperationRepositories_ShouldNotCommitInsideOperationUnitOfWork` 后，旧 `OperationRepository.AddExecutionAsync` / `UpdateExecutionAsync` / `AddReportAsync` 与 `WorkOrderRepository.UpdateAsync` 均命中 `SaveChangesAsync`。
- 红灯：仓储去自提交后，`ProductionControllerTests.ProductionFlow_ShouldScanStartAndCompleteOperation` 首次在 `/production/scan` 返回 `500`；根因是 `ScanAsync` 创建执行记录没有 UoW 提交。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint6BackendCode_ShouldNotWriteDirectlyToConsole"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint6PullRequestTemplate_ShouldRequireCodeHygieneChecklist"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint6IntegrationTests_ShouldUseExplicitSerialCollection"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint6PerformanceTests_ShouldUseDedicatedFactoryAndSeed"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint6E2eTests_ShouldNotUseHardWaits"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint6"` 通过，`5/5 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint5AsyncCode|FullyQualifiedName~Sprint6BackendCode"` 通过，`2/2 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~TestAuthHandler_ShouldAuthorizeWhenAnyParameterizedRoleMatches"` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~EndpointAuthorizationTests"` 通过，`5/5 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~PerformanceTests"` 通过，`8/8 passed`。
- `npm run test:e2e -- tests/e2e/dashboard.spec.ts tests/e2e/modules.spec.ts` 通过，`21/21 passed`。
- `npm run test:e2e -- tests/e2e/demo-asset-capture.spec.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`5 files / 20 tests passed`。
- `npm run lint` 通过。
- `npm run build` 通过；仍输出既有 Node `DEP0180 fs.Stats constructor is deprecated` warning。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --configuration Release --logger "trx" --collect:"XPlat Code Coverage" --results-directory TestResults/UnitThreshold` 通过，`384/384 passed`。
- `pwsh scripts/check-cobertura-threshold.ps1 -CoverageGlob 'TestResults/UnitThreshold/**/coverage.cobertura.xml' -LineThreshold 10 -BranchThreshold 20` 通过；样本 line `11.88%`、branch `28.50%`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release --logger "trx" --collect:"XPlat Code Coverage" --results-directory TestResults/IntegrationThreshold` 本地 240s 超时，未形成通过证据。
- `rg -n "waitForTimeout\s*\(" src/frontend/tests/e2e -g "*.ts"` 无匹配。
- `dotnet build src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore` 通过，`0 warning / 0 error`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。
- `Test-Path CONTRIBUTING.md; Test-Path SECURITY.md` 均为 `True`。
- `rg -n "CONTRIBUTING|SECURITY" README.md CONTRIBUTING.md SECURITY.md` 能命中 README 文档索引和新增文档内容。
- `_docs/_adr/ADR-001-production-migration-strategy.md` 至 `_docs/_adr/ADR-006-ai-assisted-security-and-compliance-review.md` 已存在。
- `_docs/_adr/ADR-010-cc-remediation-audit-decisions.md` 已存在，并记录本次 CC remediation 审计采纳决策。
- `Get-Content VERSION` 返回 `0.1.0-remediation.20260531`。
- `git tag --list "v*"` 本地无输出；本轮未创建 `v1.0.0` tag。
- `rg -n "Release Process|0.1.0-remediation.20260531|git tag -a v1.0.0" CHANGELOG.md VERSION` 能命中版本标记和 tag 流程。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~BomAppServiceTests"` 通过，`3/3 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~BomControllerTests"` 串行通过，`4/4 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~BomExplosionServiceTests|FullyQualifiedName~MaterialKittingCheckerTests|FullyQualifiedName~BomAppServiceTests"` 通过，`16/16 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~AnomalyAppServiceTests` 通过，`4/4 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~AnomalyControllerTests` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~AuditLogAppServiceTests` 通过，`3/3 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~EmployeeControllerTests.Create_ShouldPersistAuditLogFromEndpointFilter` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~H3AuditEndpointFilter_ShouldDependOnAuditAppServiceNotDbContext|FullyQualifiedName~H7TargetMutatingEndpoints_ShouldUseAuditEndpointFilter"` 通过，`2/2 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~RoutingAppServiceTests` 通过，`3/3 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~RoutingControllerTests` 通过，`4/4 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~KnowledgeAppServiceTests` 通过，`3/3 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~KnowledgeControllerTests` 通过，`2/2 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~DashboardKpiServiceTests` 通过，`3/3 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~DashboardControllerTests` 通过，`2/2 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~RiskAppServiceTests` 通过，`3/3 passed`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertRiskActionTraceAsync_ShouldPersistEventTimestampForEvidenceOrdering` 后，旧实现把 `AgentEvidenceLink.CreatedAt` 写成 `DateTime.UtcNow`，而非 `RiskActionTraceDto.CreatedAt`，导致按时间排序的风险证据链回放可能漂移。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertAssistantActionAuditAsync_ShouldPersistEventTimestampForEvidenceOrdering` 后，旧实现把助手动作审计 evidence 时间写成 `DateTime.UtcNow`，而非 `AssistantActionAuditRecordDto.CreatedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertAnomalyDispatchRecordAsync_ShouldPersistEventTimestampForEvidenceOrdering` 后，旧实现把异常分流 evidence 时间写成 `DateTime.UtcNow`，而非 `AnomalyDispatchRecordDto.CreatedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertMonitoringSituationEscalationAsync_ShouldPersistClosedTimestampForEvidenceOrdering` 后，旧实现把现场态势升级 evidence 时间写成 `DateTime.UtcNow`，而非闭环事件 `ClosedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertRiskSlaReviewAsync_ShouldPersistClosedTimestampForEvidenceOrdering` 后，旧实现把风险 SLA 复核 evidence 时间写成 `DateTime.UtcNow`，而非闭环事件 `ClosedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertAssistantRecoveryPackageAsync_ShouldPersistClosedTimestampForEvidenceOrdering` 后，旧实现把交付恢复包 evidence 时间写成 `DateTime.UtcNow`，而非闭环事件 `ClosedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertAssistantAnomalyPackageAsync_ShouldPersistEventTimestampForEvidenceOrdering` 后，旧实现把助手异常处置包 evidence 时间写成 `DateTime.UtcNow`，而非 `AssistantAnomalyDispositionPackageDto.CreatedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertAssistantEngineeringConstraintPackageAsync_ShouldPersistEventTimestampForEvidenceOrdering` 后，旧实现把助手工程约束包 evidence 时间写成 `DateTime.UtcNow`，而非 `AssistantEngineeringConstraintPackageDto.CreatedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertProductionAnomalyEventAsync_ShouldPersistDetectedTimestampForEvidenceOrdering` 后，旧实现把生产异常事件 evidence 时间写成 `DateTime.UtcNow`，而非 `ProductionAnomalyEventDto.DetectedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertLaborReassignmentAsync_ShouldPersistEventTimestampForEvidenceOrdering` 后，旧实现把人力调拨 evidence 时间写成 `DateTime.UtcNow`，而非 `LaborReassignmentRecordDto.CreatedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertLaborQualificationBlockAsync_ShouldPersistReleasedTimestampForEvidenceOrdering` 后，旧实现把人员资质阻断释放态 evidence 时间写成 `DateTime.UtcNow`，而非释放事件 `ReleasedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertBarcodeScanEvidenceAsync_ShouldPersistEventTimestampForEvidenceOrdering` 后，旧实现把扫码追溯 evidence 时间写成 `DateTime.UtcNow`，而非 `BarcodeScanEvidenceRecordDto.CreatedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertQualityCapaClosureAsync_ShouldPersistVerifiedTimestampForEvidenceOrdering` 后，旧实现把质量 CAPA 闭环 evidence 时间写成 `DateTime.UtcNow`，而非验证事件 `VerifiedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.UpsertAgentConfigApprovalAsync_ShouldPersistDecisionTimestampForEvidenceOrdering` 后，旧实现把 Agent 配置审批 evidence 时间写成 `DateTime.UtcNow`，而非决策事件 `DecidedAt`。
- 红灯：新增 `ScheduleAgentServiceTests.RecommendAsync_ShouldPersistScheduleRequestEvidenceWithDecisionTimestamp` 后，旧实现的 `ScheduleRequest` evidence 未显式写 `CreatedAt`，会使用 `AgentEvidenceLink` 默认保存时刻，而非 `AgentDecision.CreatedAt`。
- 红灯：新增 `Sprint6ScheduleAgentService_ShouldNotUseNullForgivingOperator` 首次误匹配普通逻辑取反 `!decision...`；修正正则后命中 `ScheduleAgentService.cs:482: .Select(item => item!)`，证明查询映射链路违反禁用 `!` 压制规则。
- 红灯：新增 `Sprint6CriticalBackendFiles_ShouldNotUseNullForgivingOperator` 后，命中 `SchedulingContextProvider.cs:77: .Select(w => w.RouteCode!)`，随后同一门禁也覆盖 `ReportEndpoints.cs` 的 `ActualEndDate!`。
- 红灯：新增 `Sprint6AdminTokenRepositories_ShouldNotUseNullForgivingOperator` 后，命中 `NotificationConfigRepository.cs:19: return await _context.NotificationConfigs!`，同类 `RefreshTokens!` 一并清理。
- 红灯：新增 `Sprint6AuthEndpoints_ShouldNotUseNullForgivingForTokenClaims` 后，命中 `AuthEndpoints.cs:54: GenerateToken(request.Username, role!, displayName!, ...)`，证明认证成功路径仍用 `!` 压制 token claim 可空性。
- 红灯：新增 `Sprint6ExceptionMiddleware_ShouldNotUseNullForgivingForProblemStatus` 后，命中 `ExceptionMiddleware.cs:115: context.Response.StatusCode = problem.Status!.Value;`。
- 红灯：新增 `Sprint6EndpointHandlers_ShouldNotUseDefaultNullForgivingParameters` 后，命中 `AuditLogEndpoints.cs:19: IAuditLogAppService auditLogService = default!,`，同类 Endpoint handler `default!` 一并清理。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`8/8 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`9/9 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`10/10 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`11/11 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`12/12 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`13/13 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`14/14 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`15/15 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`16/16 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`17/17 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`18/18 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~Sprint6ScheduleAgentEvidenceLinks_ShouldSetBusinessEventTimestamp` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~Sprint6` 通过，`6/6 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~Sprint6ScheduleAgentService_ShouldNotUseNullForgivingOperator` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~QueryRiskActionTracesAsync_ShouldSkipInvalidEvidenceAndUseDefaultTake` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`19/19 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~Sprint6CriticalBackendFiles_ShouldNotUseNullForgivingOperator` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~Sprint6AdminTokenRepositories_ShouldNotUseNullForgivingOperator` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~Sprint6AuthEndpoints_ShouldNotUseNullForgivingForTokenClaims` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~Sprint6ExceptionMiddleware_ShouldNotUseNullForgivingForProblemStatus` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ExceptionMiddlewareTests` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~Sprint6EndpointHandlers_ShouldNotUseDefaultNullForgivingParameters` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~Sprint6` 通过，`12/12 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~AuthControllerTests` 通过，`5/5 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName~BomControllerTests|FullyQualifiedName~InventoryControllerTests|FullyQualifiedName~QualityControllerTests|FullyQualifiedName~KnowledgeControllerTests|FullyQualifiedName~EmployeeControllerTests.Create_ShouldPersistAuditLogFromEndpointFilter|FullyQualifiedName~SchedulingControllerTests.GetWorkOrders"` 通过，`23/23 passed`。
- 历史红灯：`dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~SchedulingControllerTests` 曾失败，`41/61 passed`、`20 failed`，失败集中在 Scheduling evidence 审计断言和一个请求取消超时；后续已由 Scheduling evidence audit 持久化修复覆盖，并重新验证 `61/61 passed`。
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore` 通过，`0 warning / 0 error`。
- `dotnet build src/backend/MES.Infrastructure/MES.Infrastructure.csproj --no-restore` 通过，`0 warning / 0 error`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~OperationServiceTests` 通过，`3/3 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~ProductionControllerTests.ProductionFlow_ShouldScanStartAndCompleteOperation` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter FullyQualifiedName~ProductionOperationRepositories_ShouldNotCommitInsideOperationUnitOfWork` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~OperationTransactionRepositoryTests.CompleteAsync_WhenReportWriteFails_ShouldRollbackExecutionAndWorkOrderUpdates` 通过，`1/1 passed`。

## 范围说明

- 本轮处理 Sprint 6 / 6.7 中的 `Console.Write*` 后端代码卫生门禁和 PR 模板人工检查项。
- 6.2 本轮只扩展测试认证 handler，不调整生产认证、JWT、授权策略或端点权限配置。
- 6.3 本轮只补显式 xUnit collection 和门禁；仍保留 assembly 级 `DisableTestParallelization = true` 作为现有兜底。
- 6.4 本轮只隔离性能测试的 test host、InMemory DB 名称和最小种子；不调整性能阈值口径。
- 6.5 本轮只覆盖 `src/frontend/tests/e2e` 下 Playwright 规格；未扫描历史 `test-results` 或构建产物。
- 6.6 本轮落地前端单测基础设施，覆盖 `auth` store、`error-message`、`offline-demo-mode`、`schedule-feedback-sync` 和 `risk-action-sync`；尚未覆盖全部关键 sync util，也未宣称 Sprint 6 单测总数验收已达成。
- 6.8 本轮落地覆盖率阈值门禁；阈值是当前 Unit coverage 基线可过的保守起点，不代表目标覆盖率已达理想水平。
- 6.9 本轮只补齐 `v1` 仓库根的贡献与安全治理文档；`v1/README.md` 和 `v1/LICENSE` 已存在，未重写既有产品叙事或许可文本。
- 6.10 本轮只补 ADR 文档，不新增代码、不改 release tag，也不宣称 ADR 之外的灰度/安全签字完成。
- 6.11 本轮只补版本标记和发布流程文档；未创建 git tag，`v1.0.0` 仍缺灰度、安全签字和两周观察证据。
- 6.1 本轮只补 `BomAppService` 一片；计划要求 9 个无测 AppService 各 3 个单测，剩余缺测 AppService 仍需继续推进。
- 6.1 本轮继续补 `AnomalyAppService` 一片；计划要求 9 个无测 AppService 各 3 个单测，剩余缺测 AppService 仍需继续推进。
- 6.1 本轮继续补 `AuditLogAppService` 一片，并顺手补一条端到端审计落库回归；剩余缺测 AppService 仍需继续推进。
- 6.1 本轮继续补 `RoutingAppService` 一片；剩余缺测 AppService 仍需继续推进。
- 6.1 本轮继续补 `KnowledgeAppService` 一片；剩余缺测 AppService 仍需继续推进。
- 6.1 本轮继续补 `DashboardKpiService` 一片，并顺手统一 Dashboard / Report 的 OTD 计算口径。
- 6.1 本轮继续补 `RiskAppService` 一片；该服务当前仍返回 `IsDemoData = true` 的演示风险面板，不代表真实风险计算已经接通。
- 6.1 本轮继续补 `ScheduleAgentService` 一片；该服务覆盖的是调度 Agent 决策/审计外壳，不等同于 6 个 AI Agent 深度单测要求。
- 6.1 复核发现 `MES.Application/Services/ExportAppService.cs` 当前只保留接口，真实实现已迁到 Infrastructure；本轮不为接口强行补 Application AppService 单测。
- `OperationService` 不按 `*AppService` 命名，但位于 Application Services 且承载生产开工/完工业务；本轮纳入 6.1 补测清点。
- 本轮统一的是 BOM 损耗率在应用层和基础设施齐套链路的需求口径；未对前端静态 demo 数据做同步改写。
- 根目录 `C:\AIWorks\AIMes` 不是 git 仓库，本轮对根 CI 的验证采用直接读取文件和尾随空白扫描；未能用 `git diff` 形式审计根 workflow。
- `.Result` / `.Wait()` 门禁沿用 Sprint 5 已建立的架构测试；本轮没有引入独立 Roslyn analyzer 项目。
- `ScheduleAgentService` evidence CreatedAt 门禁是源码架构测试，不是 Roslyn analyzer；它覆盖当前服务内 `AgentEvidenceLink` 初始化块，后续若新增其他 evidence writer 需要同步扩展门禁范围。
- `ScheduleAgentService` null-forgiving 门禁目前只扫描该服务文件；仓库中其他历史 `!` 用法仍需按风险分批治理，未在本轮一并改动。
- `Sprint6CriticalBackendFiles_ShouldNotUseNullForgivingOperator` 当前只覆盖两条高风险路径；EF DbSet null-forgiving、测试代码和其他 AI/基础设施历史用法未在本轮统一清理。
- `Sprint6AdminTokenRepositories_ShouldNotUseNullForgivingOperator` 当前只覆盖 Admin 通知配置/刷新令牌仓储。
- `Sprint6AuthEndpoints_ShouldNotUseNullForgivingForTokenClaims` 当前只覆盖 `role` / `displayName` token claim 压制；Endpoint handler 参数中的 `default!` 已由 `Sprint6EndpointHandlers_ShouldNotUseDefaultNullForgivingParameters` 覆盖。
- `Sprint6ExceptionMiddleware_ShouldNotUseNullForgivingForProblemStatus` 当前只覆盖 `ProblemDetails.Status` 写入路径。
- `Sprint6EndpointHandlers_ShouldNotUseDefaultNullForgivingParameters` 当前覆盖 `src/backend/MES.Api/Endpoints/*.cs` 的 `default!` 参数压制；本轮 `rg` 已确认后端生产代码 `identifier!` / `default!` 无命中。
## Scheduling Evidence Audit 持久化修复

- 红灯：`SchedulingControllerTests.EquipmentEvidenceApi_ShouldUpsertQueryAndAuditDowntimeAndCustomerFault` 稳定复现 equipment evidence link 已落库但 `AuditLogs` 为空，随后 `SchedulingControllerTests` 全类表现为 evidence 审计断言集中失败。
- 根因：`ScheduleAgentService.WriteAuditAsync` 只调用 `_auditLogRepository.AddAsync(...)`；`AuditLogRepository.AddAsync` 仅 `DbContext.Add` 不自提交，而同请求内的 `AgentDecisionRepository.UpsertEvidenceLinkAsync` 会自提交，导致 evidence 可见但 audit 不可见。
- `ScheduleAgentService.WriteAuditAsync` 现在通过 `_unitOfWork.ExecuteAsync(innerCt => _auditLogRepository.AddAsync(auditLog, innerCt), ct)` 提交审计写入，让 Scheduling evidence upsert 与审计持久化语义对齐。
- `ScheduleAgentServiceTests` 构造函数补齐 `IUnitOfWork.ExecuteAsync(Func<CancellationToken, Task>, ...)` 测试桩，单测会实际执行传入 action，避免生产代码进入 UoW 后审计 callback 被 mock 吞掉。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~EquipmentEvidenceApi_ShouldUpsertQueryAndAuditDowntimeAndCustomerFault` 通过，`1/1 passed`。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter FullyQualifiedName~ScheduleAgentServiceTests` 通过，`19/19 passed`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter FullyQualifiedName~SchedulingControllerTests` 通过，`61/61 passed`。
- `dotnet build src/backend/MES.Application/MES.Application.csproj --no-restore` 通过，`0 warning / 0 error`。

## 6.6 Notifications Store 单测补强

- 红灯：新增 `notifications.store.test.ts` 后，critical 质量预警触发的浏览器通知仍使用硬编码 `/favicon.ico`，在 `/scheduling/` 子路径部署下会请求错误资源路径。
- `notifications.ts` 现在复用 `appAssetPath('favicon.ico')` 生成浏览器通知图标路径，与 Nuxt/Vitest `base: '/scheduling/'` 保持一致。
- `npm run test:unit -- tests/unit/notifications.store.test.ts` 通过，`1/1 passed`。
- `npm run test:unit` 通过，`6 files / 21 tests passed`。

## 6.6 Quality CAPA Sync 单测补强

- 红灯：新增 `quality-capa-sync.test.ts` 后，`readQualityCapaClosureBackendFirst` 在后端查询失败时直接 reject，前端质量闭环面板无法 fallback 到本地 CAPA 记录。
- `quality-capa-sync.ts` 的 backend-first 读取现在捕获后端异常，并回退到 `readQualityCapaClosure()`，与其他 evidence sync util 的离线/后端失败容错口径一致。
- 新增质量 CAPA sync 单测覆盖本地持久化、OTD 证据链镜像、backend best-effort upsert、后端失败 fallback 和坏 JSON 自清理。
- `npm run test:unit -- tests/unit/quality-capa-sync.test.ts` 通过，`3/3 passed`。
- `npm run test:unit` 通过，`7 files / 24 tests passed`。

## 6.6 Equipment Risk Sync 单测补强

- 红灯：新增 `equipment-risk-sync.test.ts` 后，`readEquipmentDowntimeEvent` 会直接返回缺少 `equipmentName`、`affectedOrders`、维护窗口和保护策略的不完整本地记录，排产/报告页面可能复用无法解释影响工单的旧设备风险。
- `equipment-risk-sync.ts` 现在校验 equipment downtime 本地记录的关键字段；不完整记录会从 `localStorage` 清除并返回 `null`。
- 新增设备风险 sync 单测覆盖停机事件本地持久化、backend best-effort upsert、backend-first 空结果 fallback、坏 JSON 清理、不完整记录清理，以及客户设备故障默认字段保留。
- `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`8 files / 29 tests passed`。

## 6.6 Shortage Risk Sync 单测补强

- 红灯：新增 `shortage-risk-sync.test.ts` 后，`writeBomKittingPackage` 派生的 `ShortageKittingEvent.affectedOrders` 只保留当前工单号，丢失 BOM 齐套包 `summary` 中的跨工单影响说明。
- `shortage-risk-sync.ts` 现在派生缺料齐套事件时优先使用 `record.summary` 作为 `affectedOrders`，空值再回退 `workOrderNumber`。
- 新增缺料风险 sync 单测覆盖 BOM 齐套包持久化、backend best-effort upsert、派生 shortage event、backend-first fallback、坏 JSON 清理和物料编码匹配。
- `npm run test:unit -- tests/unit/shortage-risk-sync.test.ts` 通过，`4/4 passed`。
- `npm run test:unit` 通过，`9 files / 33 tests passed`。

## 6.6 Agent Config Approval Sync 单测补强

- 红灯：新增 `agent-config-approval-sync.test.ts` 后，`readAgentConfigApprovals` 不会清理损坏的 `aimes_agent_config_approvals` JSON，且会把非法状态 `bypassed` 合并进治理审批记录。
- `agent-config-approval-sync.ts` 现在读取 override 时校验 `id` 与审批状态枚举；损坏 JSON 会从 `localStorage` 清理，非法状态 override 会被忽略。
- 新增 Agent 配置审批 sync 单测覆盖审批决策本地持久化、backend best-effort upsert、backend-first 空结果 fallback、坏 JSON 清理和非法 override 忽略。
- `npm run test:unit -- tests/unit/agent-config-approval-sync.test.ts` 通过，`4/4 passed`。
- `npm run test:unit` 通过，`10 files / 37 tests passed`；`npm run lint` 通过。

## 6.6 Risk SLA Review Sync 单测补强

- 红灯：新增 `risk-sla-review-sync.test.ts` 后，`readRiskSlaReviewRecord` 对不完整 `aimes_risk_sla_review` 记录只返回 `null`，不会清理旧本地值，风险看板后续仍可能反复读取无法解释影响工单的晨会复核状态。
- `risk-sla-review-sync.ts` 现在在本地记录结构校验失败时清理 `aimes_risk_sla_review`，与坏 JSON 自清理口径一致。
- 新增风险 SLA 复核 sync 单测覆盖晨会包写入、OTD 证据链 active 镜像、backend best-effort upsert、backend-first fallback、闭环动作结果、OTD closed 镜像、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/risk-sla-review-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`11 files / 42 tests passed`；`npm run lint` 通过。

## 6.6 Anomaly Dispatch Sync 单测补强

- 红灯：新增 `anomaly-dispatch-sync.test.ts` 后，`readAnomalyDispatchRecords` 会把缺少责任人、影响工单、动作建议、审计 ID 和状态标签的不完整本地记录当成有效异常分流返回。
- `anomaly-dispatch-sync.ts` 现在校验异常类型枚举和异常分流关键字段；本地数组存在坏结构时会重写为剩余有效记录，全部无效时清理 `aimes_anomaly_dispatch_records`。
- 新增异常分流 sync 单测覆盖分流记录写入、按类型读取、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、同 ID 去重、12 条截断、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/anomaly-dispatch-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`12 files / 47 tests passed`；`npm run lint` 通过。

## 6.6 Labor Assignment Sync 单测补强

- 红灯：新增 `labor-assignment-sync.test.ts` 后，`readLaborReassignments` / `readLaborQualificationBlocks` 会过滤不完整本地记录，但不会清理 `aimes_labor_reassignment` / `aimes_labor_qualification_block` 旧值，生产看板后续仍会反复读取无法解释资质风险或替班责任人的坏状态。
- `labor-assignment-sync.ts` 现在在人员替班/资质阻断本地数组存在坏结构时写回剩余有效记录；全部无效时复用既有 helper 清理对应 localStorage key。
- 新增人员同步单测覆盖资质阻断写入、替班互斥清理、复核、释放、生产开工 OTD 证据、backend-first fallback、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/labor-assignment-sync.test.ts` 通过，`6/6 passed`。
- `npm run test:unit` 通过，`13 files / 53 tests passed`；`npm run lint` 通过。

## 6.6 Barcode Scan Evidence Sync 单测补强

- 红灯：新增 `barcode-scan-evidence-sync.test.ts` 后，`readBarcodeScanEvidenceRecords` 会过滤缺少 trace、状态和下一核对点的不完整本地记录，但不会清理 `aimes_barcode_scan_evidence` 旧值。
- `barcode-scan-evidence-sync.ts` 现在在扫码证据本地数组存在坏结构时写回剩余有效记录；全部无效时清理 `aimes_barcode_scan_evidence`。
- 新增扫码证据 sync 单测覆盖工单/设备/物料扫码记录生成、写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、后端失败 fallback、去重、20 条截断、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/barcode-scan-evidence-sync.test.ts` 通过，`7/7 passed`。
- `npm run test:unit` 通过，`14 files / 60 tests passed`；`npm run lint` 通过。

## 6.6 Production Anomaly Sync 单测补强

- 红灯：新增 `production-anomaly-sync.test.ts` 后，`readProductionAnomalyEvent` 对损坏 JSON 不清理 `aimes_production_anomaly_event`，且会把缺少工序、检测人和建议动作的不完整事件强转为 `ProductionAnomalyEvent`。
- `production-anomaly-sync.ts` 现在通过类型守卫校验生产异常事件关键字段；坏 JSON 和坏结构都会清理 `aimes_production_anomaly_event`。
- 新增生产异常 sync 单测覆盖本地持久化、backend best-effort upsert、backend-first fallback、列表/详情 DTO 映射、坏 JSON 清理和不完整事件清理。
- `npm run test:unit -- tests/unit/production-anomaly-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`15 files / 65 tests passed`；`npm run lint` 通过。

## 6.6 Monitoring Situation Escalation Sync 单测补强

- 红灯：新增 `monitoring-situation-escalation-sync.test.ts` 后，`readMonitoringSituationEscalations` 会把缺少责任人、排产动作、风险影响、OTD 影响和状态标签的不完整现场态势升级包当成有效记录返回。
- `monitoring-situation-escalation-sync.ts` 现在校验现场处置包的责任、排产、风险、OTD、审计和状态字段；本地数组存在坏结构时会写回有效记录，全部无效时清理 `aimes_monitoring_situation_escalations`。
- 新增现场态势升级 sync 单测覆盖升级包写入、闭环、OTD active/closed 镜像、backend best-effort upsert、backend-first fallback、同 ID 去重、8 条截断、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/monitoring-situation-escalation-sync.test.ts` 通过，`6/6 passed`。
- `npm run test:unit` 通过，`16 files / 71 tests passed`；`npm run lint` 通过。

## 6.6 Assistant Action Audit 单测补强

- 红灯：新增 `assistant-action-audit.test.ts` 后，`readAssistantActionAudits` 对损坏 `aimes_assistant_action_audits` JSON 只返回空数组不清理，且会保留缺少动作标签、权限结果和创建时间的不完整 audit 记录。
- `assistant-action-audit.ts` 现在校验 assistant action 类型枚举与 audit 关键字段；坏 JSON、非数组和坏结构都会清理或写回剩余有效记录。
- 新增助手动作审计单测覆盖 permitted/denied audit 写入、backend best-effort upsert、生成 auditCode、backend-first 空结果 fallback、12 条截断、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/assistant-action-audit.test.ts` 通过，`6/6 passed`。
- `npm run test:unit` 通过，`17 files / 77 tests passed`；`npm run lint` 通过。

## 6.6 Assistant Recovery Package Sync 单测补强

- 红灯：新增 `assistant-action-package-sync.test.ts` 后，`readAssistantRecoveryPackages` 会把缺少 actor、role、owner、排产动作、风险影响、OTD 影响和创建时间的不完整交期恢复包当成有效记录返回。
- `assistant-action-package-sync.ts` 现在校验恢复包关键字段和每个 dispatch step；本地数组存在坏结构时会写回有效记录，全部无效或非数组时清理 `aimes_assistant_recovery_packages`。
- 新增交期恢复包 sync 单测覆盖包写入、OTD active 镜像、backend best-effort upsert、backend-first fallback、采购/质量/整包闭环 OTD 镜像、8 条截断、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/assistant-action-package-sync.test.ts` 通过，`6/6 passed`。
- `npm run test:unit` 通过，`18 files / 83 tests passed`；`npm run lint` 通过。

## 6.6 Assistant Anomaly Card Sync 单测补强

- 红灯：新增 `assistant-anomaly-card-sync.test.ts` 后，`readAssistantAnomalyDispositionPackages` 会把缺少 actor、role、owner、交付影响、排产窗口和创建时间的不完整助手异常处置包当成有效记录返回。
- `assistant-anomaly-card-sync.ts` 现在校验异常处置包关键字段和每个 dispatch step；本地数组存在坏结构时会写回有效记录，全部无效或非数组时清理 `aimes_assistant_anomaly_packages`。
- 新增助手异常处置包 sync 单测覆盖包写入、生产异常镜像、异常分流镜像、OTD active 镜像、backend best-effort upsert、backend-first fallback、8 条截断、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/assistant-anomaly-card-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`19 files / 88 tests passed`；`npm run lint` 通过。

## 6.6 Assistant Engineering Constraint Package Sync 单测补强

- 红灯：新增 `assistant-engineering-constraint-package-sync.test.ts` 后，`readAssistantEngineeringConstraintPackages` 会把缺少 actor、role、owner、BOM/ECN/route/operation、OTD 影响和创建时间的不完整工程约束包当成有效记录返回。
- `assistant-engineering-constraint-package-sync.ts` 现在校验工程约束包关键字段和每个 dispatch step；本地数组存在坏结构时会写回有效记录，全部无效或非数组时清理 `aimes_assistant_engineering_constraint_packages`。
- 新增工程约束包 sync 单测覆盖包写入、工程变更影响种子、工艺能力种子、OTD active 镜像、backend best-effort upsert、backend-first fallback、8 条截断、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/assistant-engineering-constraint-package-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`20 files / 93 tests passed`；`npm run lint` 通过。

## 6.6 OTD KPI Commitment Sync 单测补强

- 红灯：新增 `otd-kpi-commitment-sync.test.ts` 后，`readOtdKpiCommitmentPackages` 会把缺少维度、标题、操作者、OTD 数值、责任人、承诺说明、创建时间和动作详情的不完整客户承诺包当成有效记录返回。
- `otd-kpi-commitment-sync.ts` 现在校验客户承诺包关键字段和每个 action；本地数组存在坏结构时会写回有效记录，全部无效或非数组时清理 `aimes_otd_kpi_commitment_packages`。
- 新增 OTD KPI 承诺包 sync 单测覆盖包写入、OTD active 镜像、backend best-effort upsert、backend-first fallback、latest fallback、8 条截断、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/otd-kpi-commitment-sync.test.ts` 通过，`6/6 passed`。
- `npm run test:unit` 通过，`21 files / 99 tests passed`；`npm run lint` 通过。

## 6.6 Outsourcing Commitment Sync 单测补强

- 红灯：新增 `outsourcing-commitment-sync.test.ts` 后，`readOutsourcingCommitmentPackages` 会把缺少维度、标题、操作者、OTD 数值、责任人、承诺说明、创建时间和动作详情的不完整外协承诺包当成有效记录返回。
- `outsourcing-commitment-sync.ts` 现在校验外协承诺包关键字段和每个 action；本地数组存在坏结构时会写回有效记录，全部无效或非数组时清理 `aimes_outsourcing_commitment_packages`。
- 新增外协承诺包 sync 单测覆盖包写入、OTD active 镜像、backend best-effort upsert、backend-first fallback、latest fallback、外协到货闭环、排产释放闭环、8 条截断、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/outsourcing-commitment-sync.test.ts` 通过，`7/7 passed`。
- `npm run test:unit` 通过，`22 files / 106 tests passed`；`npm run lint` 通过。

## 6.6 OTD Evidence Chain Sync 单测补强

- 红灯：新增 `otd-evidence-chain-sync.test.ts` 后，`readOtdEvidenceChainRecords` 会过滤缺少 trace、状态和来源的不完整证据链记录，但不会清理 `aimes_otd_evidence_chain` 旧值。
- `otd-evidence-chain-sync.ts` 现在在本地数组存在坏结构时写回有效记录，全部无效或非数组时清理 `aimes_otd_evidence_chain`。
- 新增 OTD 证据链 sync 单测覆盖 upsert 去重、24 条截断、backend best-effort upsert、backend-first fallback、闭环匹配、坏 JSON 清理和不完整记录清理。
- `npm run test:unit -- tests/unit/otd-evidence-chain-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`23 files / 111 tests passed`；`npm run lint` 通过。

## 6.6 Customer Order Import Sync 单测补强

- 红灯：新增 `customer-order-import-sync.test.ts` 后，`readCustomerOrderImportEvidence` 对损坏 JSON 和缺少文件名/来源/映射字段的不完整客户工单导入证据只返回 `null`，但不会清理 `aimes_customer_order_import` 旧值。
- `customer-order-import-sync.ts` 现在通过类型守卫校验客户工单导入证据关键字段；坏 JSON 与坏结构都会清理 `aimes_customer_order_import`。
- 新增客户工单导入 sync 单测覆盖本地持久化、backend best-effort upsert、backend-first fallback、坏 JSON 清理和不完整证据清理。
- 红绿证据：先运行目标测试得到 `2 failed / 2 passed`，失败点均为 localStorage 未清理；修复后 `npm run test:unit -- tests/unit/customer-order-import-sync.test.ts` 通过，`4/4 passed`。
- `npm run test:unit` 通过，`24 files / 115 tests passed`；`npm run lint` 通过。

## 6.6 Engineering Change Sync 单测补强

- 红灯：新增 `engineering-change-sync.test.ts` 后，替代料批准、工程变更影响和工艺能力校验读取函数会接收缺少责任、影响、审计、容量等关键字段的不完整本地记录；工程影响记录还会被默认值补齐成看似完整的证据。
- `engineering-change-sync.ts` 现在分别校验 `AlternateMaterialApproval`、`EngineeringChangeImpactAnalysis` 和 `RouteCapabilityValidation` 的关键解释字段；坏结构会清理对应 localStorage key。
- 新增工程变更 sync 单测覆盖三类工程证据写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、三个本地 key 的不完整记录清理。
- 红绿证据：先运行目标测试得到 `3 failed / 2 passed`，失败点为不完整工程证据未清理；修复后 `npm run test:unit -- tests/unit/engineering-change-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`25 files / 120 tests passed`；`npm run lint` 通过。

## 6.6 Knowledge Governance Sync 单测补强

- 红灯：新增 `knowledge-governance-sync.test.ts` 后，`readKnowledgeGovernanceReviews` 会过滤不完整知识治理复核记录，但不会把有效记录写回或清理全坏的 `aimes_knowledge_governance_reviews`。
- `knowledge-governance-sync.ts` 现在在本地数组包含坏结构时写回有效记录，全部无效或非数组时清理 `aimes_knowledge_governance_reviews`。
- 新增知识治理 sync 单测覆盖复核写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、混合坏结构写回和全坏结构清理。
- 红绿证据：先运行目标测试得到 `2 failed / 2 passed`，失败点为 localStorage 未写回/清理；修复后 `npm run test:unit -- tests/unit/knowledge-governance-sync.test.ts` 通过，`4/4 passed`。
- `npm run test:unit` 通过，`26 files / 124 tests passed`；`npm run lint` 通过。

## 6.6 POC Hypercare Sync 单测补强

- 红灯：新增 `poc-hypercare-sync.test.ts` 后，`readPocHypercareAcceptanceRecord` 对缺少验收门禁的不完整上线验收记录只返回 `null` 不清理本地键，且会接受缺少指标证据或检查点动作的 `monitors/checkpoints`。
- `poc-hypercare-sync.ts` 现在校验 Hypercare 监控指标和检查点详情；坏 JSON、坏外层结构或坏子项都会清理 `aimes_poc_hypercare_acceptance`。
- 新增 POC Hypercare sync 单测覆盖上线验收写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、坏 JSON 清理、不完整验收记录清理和坏监控/检查点清理。
- 红绿证据：先运行目标测试得到 `2 failed / 3 passed`，失败点为坏结构未清理；修复后 `npm run test:unit -- tests/unit/poc-hypercare-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`27 files / 129 tests passed`；`npm run lint` 通过。

## 6.6 POC Pilot Run Sync 单测补强

- 红灯：新增 `poc-pilot-run-sync.test.ts` 后，`readPocPilotRunRecord` 对缺少运行证据的不完整试点记录只返回 `null` 不清理本地键，且会接受缺少产品/路线/采纳决策或检查点证据的 `workOrders/checkpoints`。
- `poc-pilot-run-sync.ts` 现在校验试点工单和检查点详情；坏 JSON、坏外层结构或坏子项都会清理 `aimes_poc_pilot_run`。
- 新增 POC 试点运行 sync 单测覆盖试点运行写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、坏 JSON 清理、不完整试点记录清理和坏工单/检查点清理。
- 红绿证据：先运行目标测试得到 `2 failed / 3 passed`，失败点为坏结构未清理；修复后 `npm run test:unit -- tests/unit/poc-pilot-run-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`28 files / 134 tests passed`；`npm run lint` 通过。

## 6.6 POC Review Signoff Sync 单测补强

- 红灯：新增 `poc-review-signoff-sync.test.ts` 后，`readPocReviewSignoffRecord` 对损坏 JSON 只返回 `null` 不清理本地键，且会把只有 meetingId/auditId 的不完整复盘签署记录当作有效记录。
- `poc-review-signoff-sync.ts` 现在校验复盘签署的评分、签署人、复核人、证据批次和摘要字段；坏 JSON 或坏结构都会清理 `aimes_poc_review_signoff`。
- 新增 POC 复盘签署 sync 单测覆盖签署写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、坏 JSON 清理和不完整签署记录清理。
- 红绿证据：先运行目标测试得到 `2 failed / 2 passed`，失败点为坏缓存未清理/坏结构被接受；修复后 `npm run test:unit -- tests/unit/poc-review-signoff-sync.test.ts` 通过，`4/4 passed`。
- `npm run test:unit` 通过，`29 files / 138 tests passed`；`npm run lint` 通过。

## 6.6 POC Rollout Package Sync 单测补强

- 红灯：新增 `poc-rollout-package-sync.test.ts` 后，`readPocRolloutPackageRecord` 对缺少上线门禁和责任人的不完整交付包只返回 `null` 不清理本地键，且会接受缺少 owner/action/dueAt/evidence 的上线行动项。
- `poc-rollout-package-sync.ts` 现在校验上线交付行动项详情；坏 JSON、坏外层结构或坏 action 都会清理 `aimes_poc_rollout_package`。
- 新增 POC 上线交付包 sync 单测覆盖交付包写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、坏 JSON 清理、不完整交付包清理和坏行动项清理。
- 红绿证据：先运行目标测试得到 `2 failed / 3 passed`，失败点为坏结构未清理；修复后 `npm run test:unit -- tests/unit/poc-rollout-package-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`30 files / 143 tests passed`；`npm run lint` 通过。

## 6.6 Quality Rework Sync 单测补强

- 红灯：新增 `quality-rework-sync.test.ts` 后，`readQualityReworkImpact` 会把只有 `inspectionId/workOrderId/otdImpact` 的不完整返工影响记录当成有效对象返回。
- `quality-rework-sync.ts` 现在校验返工影响的检验、工单、产品、工序、设备、物料批次、批次、检验点、缺陷数量、返工工时、OTD 影响、建议动作、根因、证据和创建时间字段；坏 JSON 或坏结构都会清理 `aimes_quality_rework_impact`。
- 新增质量返工 sync 单测覆盖返工影响写入、backend best-effort upsert、backend-first fallback、返工优先于 fail 检验选择、impact 构建、坏 JSON 清理和不完整记录清理。
- 红绿证据：先运行目标测试得到 `1 failed / 4 passed`，失败点为坏结构未清理；修复后 `npm run test:unit -- tests/unit/quality-rework-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`31 files / 148 tests passed`；`npm run lint` 通过。

## 6.6 Quality MRB Disposition Sync 单测补强

- 红灯：新增 `quality-mrb-disposition-sync.test.ts` 后，`readQualityMrbDispositionRecord` 会把缺少处置、排产影响和审计 trace 的不完整 MRB 记录当成有效对象返回，也会接受缺少 action evidence 的处置动作。
- `quality-mrb-disposition-sync.ts` 现在校验 MRB 处置记录的检验、工单、产品、工序、设备、物料批次、处置类型、状态、责任、OTD/排产影响、审计 trace 和每个 action 的 owner/action/dueAt/evidence；坏 JSON 或坏结构都会清理 `aimes_quality_mrb_disposition`。
- 新增质量 MRB sync 单测覆盖 MRB 处置写入、OTD active 镜像、backend best-effort upsert、backend-first fallback、闭环 action result、OTD closed 镜像、坏 JSON 清理、不完整记录清理和坏 action 清理。
- 红绿证据：先运行目标测试得到 `2 failed / 4 passed`，失败点为坏记录/坏 action 未清理；修复后 `npm run test:unit -- tests/unit/quality-mrb-disposition-sync.test.ts` 通过，`6/6 passed`。
- `npm run test:unit` 通过，`32 files / 154 tests passed`；`npm run lint` 通过。

## 6.6 Quality Knowledge Sample Sync 单测补强

- 红灯：新增 `quality-knowledge-sample-sync.test.ts` 后，`readQualityKnowledgeSamples` / `readQualityKnowledgeReuseDrafts` / `readQualityKnowledgeReviewQueueRecords` 会过滤坏记录但不写回或清理本地坏数组。
- `quality-knowledge-sample-sync.ts` 现在通过共享读取 helper 校验质量知识样本、复用草案、闭环、复核队列、再训练版本、推荐反馈和灰度决策数组；混合坏结构会写回有效记录，全部无效、非数组或坏 JSON 会清理对应 localStorage key。
- 新增质量知识样本 sync 单测覆盖样本写入、OTD 镜像、backend best-effort upsert、backend-first fallback、混合坏样本写回、全坏样本清理、坏 JSON 清理、复用草案和复核队列坏结构写回。
- 红绿证据：先运行目标测试得到 `3 failed / 2 passed`，失败点为坏本地数组未写回/清理；修复后 `npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` 通过，`5/5 passed`。
- `npm run test:unit` 通过，`33 files / 159 tests passed`；`npm run lint` 通过。

## 6.6 Customer Equipment Fault Evidence 单测补强

- 红灯：扩展 `equipment-risk-sync.test.ts` 后，`readCustomerEquipmentFaultEvidence` 会把只有 `batchId/equipmentCode` 的不完整客户设备故障样例当成有效 POC 证据返回。
- `equipment-risk-sync.ts` 现在校验客户设备故障证据的批次、文件、来源、设备、样本数、影响工单、停机小时、采集信号和准备时间；坏 JSON 或坏结构都会清理 `aimes_customer_equipment_fault_evidence`。
- 扩展设备风险 sync 单测覆盖不完整客户设备故障证据清理，避免 POC evidence governance 读取无法解释来源、影响工单或信号的设备样例。
- 红绿证据：先运行目标测试得到 `1 failed / 5 passed`，失败点为坏客户设备故障证据未清理；修复后 `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` 通过，`6/6 passed`。
- `npm run test:unit` 通过，`33 files / 160 tests passed`；`npm run lint` 通过。

## 6.6 POC Evidence Governance / Customer Order Import 单测补强

- 新增 `poc-evidence-governance.test.ts`，覆盖客户工单导入与客户设备故障样例聚合成 POC evidence governance 记录，并锁定审计 ID、对象、证据摘要和步骤说明。
- 红灯：扩展 `customer-order-import-sync.test.ts` 后，`readCustomerOrderImportEvidence` 会接受 `mappedFields: []` 的客户工单导入证据，导致 POC 证据清单无法解释字段映射来源。
- `customer-order-import-sync.ts` 现在要求 `mappedFields` 非空且每一项是非空字符串；坏 JSON、坏结构或空字段映射都会清理 `aimes_customer_order_import`。
- 红绿证据：先运行目标测试得到 `1 failed / 4 passed`，失败点为空字段映射未清理；修复后 `npm run test:unit -- tests/unit/customer-order-import-sync.test.ts` 通过，`5/5 passed`；`poc-evidence-governance.test.ts` `2/2 passed`。
- `npm run test:unit` 通过，`34 files / 163 tests passed`；`npm run lint` 通过。

## 6.6 Customer Equipment Fault Signal Lineage 单测补强

- 红灯：再次扩展 `equipment-risk-sync.test.ts` 后，`readCustomerEquipmentFaultEvidence` 会接受 `capturedSignals: []` 的客户设备故障证据，导致 POC 证据清单无法说明遥测/点检信号来源。
- `equipment-risk-sync.ts` 现在要求 `capturedSignals` 非空且每一项是非空字符串；空信号数组或空信号项都会清理 `aimes_customer_equipment_fault_evidence`。
- 红绿证据：先运行目标测试得到 `1 failed / 6 passed`，失败点为空采集信号未清理；修复后 `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` 通过，`7/7 passed`。
- `npm run test:unit` 通过，`34 files / 164 tests passed`；`npm run lint` 通过。

## 6.6 Knowledge Citations / Quality Knowledge Evidence Lineage 单测补强

- 红灯：新增 `knowledge-citations.test.ts` 后，聊天引用链会把 `capaRecommendations/reuseTargets/evidenceTraceIds` 为空数组的质量知识样本当作正式 CAPA 可引用来源，并生成空内容 citation。
- `quality-knowledge-sample-sync.ts` 现在要求质量知识样本的 CAPA 推荐、复用范围和证据 trace 数组均非空且每项为非空字符串；坏样本会被本地数组读取边界清理，`knowledge-citations` 回退到“需复核”。
- 红绿证据：先运行目标测试得到 `1 failed / 0 passed`，失败点为空质量知识证据被标记为 `可引用`；修复后 `npm run test:unit -- tests/unit/knowledge-citations.test.ts` 通过，`1/1 passed`，相邻 `quality-knowledge-sample-sync.test.ts` `5/5 passed`。

## 6.6 Gantt Mapper Conflict Window 单测补强

- 红灯：新增 `gantt-mapper.test.ts` 后，`detectConflicts` 只比较按开始时间排序后的相邻任务；当一个长任务覆盖多个后续短任务时，第二个被覆盖任务不会被标记冲突。
- `gantt-mapper.ts` 现在在同一设备内维护结束时间最晚的前序任务，用它检测所有后续重叠窗口，避免长任务覆盖场景漏报。
- 红绿证据：先运行目标测试得到 `1 failed / 0 passed`，失败点为 `short-b` 未返回冲突说明；修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` 通过，`1/1 passed`。

## 6.6 Gantt Mapper Setup Time Lineage 单测补强

- 红灯：扩展 `gantt-mapper.test.ts` 后，`planToGanttData` 会把 `setupTime: "1 小时 30 分钟"` 映射为 `setupMinutes: 1`，导致甘特图和排产审计低估换型准备时间。
- `gantt-mapper.ts` 的 `parseSetupTime` 现在支持小时/分钟组合标签，同时保留原有纯分钟数字解析。
- 红绿证据：先运行目标测试得到 `1 failed / 1 passed`，失败点为准备时间 1 分钟；修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` 通过，`2/2 passed`。

## 6.6 Gantt Mapper Conflict Marker Lineage 单测补强

- 红灯：继续扩展 `gantt-mapper.test.ts` 后，`planToGanttData` 生成的任务没有 `hasConflict/conflictMessage`，只有 `ScheduleBoard` 后处理会追加冲突标记，导致 Pareto 对比等直接消费 mapper 的视图无法审计重叠任务。
- `gantt-mapper.ts` 现在在映射计划时调用 `detectConflicts`，并把冲突标记写入对应甘特任务；既有 `ScheduleBoard.markConflicts` 后处理保持兼容。
- 红绿证据：先运行目标测试得到 `1 failed / 2 passed`，失败点为 `short-a` 任务缺少冲突字段；修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` 通过，`3/3 passed`。

## 6.6 Gantt Mapper Dependency Link Dedup 单测补强

- 红灯：继续扩展 `gantt-mapper.test.ts` 后，同一任务的 `dependentItems` 如果重复包含同一个前序任务，`planToGanttData` 会生成重复 `link-op-10-op-20`，导致甘特图依赖箭头和审计计数重复。
- `gantt-mapper.ts` 现在用 link id 集合去重依赖链接，同时保留“只为存在的依赖项生成链接”的既有规则。
- 红绿证据：先运行目标测试得到 `1 failed / 3 passed`，失败点为 links 数组包含两条相同 link；修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` 通过，`4/4 passed`。

## 6.6 Gantt Mapper Invalid Time Window 单测补强

- 红灯：继续扩展 `gantt-mapper.test.ts` 后，`plannedEndTime` 早于 `plannedStartTime` 的排产项只会被静默归一为 `duration: 0.01`，不会带冲突标记或审计说明。
- `gantt-mapper.ts` 现在保留最小展示时长，同时给异常时间窗口任务写入 `hasConflict: true` 和 `conflictMessage: "计划结束时间早于计划开始时间"`。
- 红绿证据：先运行目标测试得到 `1 failed / 4 passed`，失败点为异常时间任务缺少冲突标记；修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` 通过，`5/5 passed`。

## 6.6 Gantt Mapper Flat Task Invalid Time Window 单测补强

- 红灯：继续扩展 `gantt-mapper.test.ts` 后，`itemsToFlatTasks` 会把结束早于开始的扁平任务静默归一为 `duration: 0.01`，但不带 `hasConflict/conflictMessage`。
- `gantt-mapper.ts` 现在让扁平任务映射也暴露异常时间窗口冲突，保持与 `planToGanttData` 的 fail-loud 口径一致。
- 红绿证据：先运行目标测试得到 `1 failed / 5 passed`，失败点为 flat task 缺少冲突字段；修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` 通过，`6/6 passed`。

## 6.6 Gantt Mapper Flat Task Setup Time Lineage 单测补强

- 红灯：继续扩展 `gantt-mapper.test.ts` 后，`itemsToFlatTasks` 不会输出 `setupMinutes`，导致 flat task 消费方丢失换型准备时间。
- `gantt-mapper.ts` 现在在扁平任务映射中复用 `parseSetupTime`，保持与 `planToGanttData` 一致的换型时间血缘。
- 红绿证据：先运行目标测试得到 `1 failed / 6 passed`，失败点为 flat task 缺少 `setupMinutes: 90`；修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` 通过，`7/7 passed`。

## 6.6 Gantt Mapper Decimal Setup Time 单测补强

- 红灯：继续扩展 `gantt-mapper.test.ts` 后，`setupTime: "1.5 小时"` 被旧正则从 `5 小时` 处误匹配，映射为 `setupMinutes: 300` 而不是 90。
- `gantt-mapper.ts` 的 `parseSetupTime` 现在支持小数小时/分钟标签，统一使用 `Number.parseFloat` 解析并四舍五入为分钟数，纯数字兜底仍按分钟解释。
- 红绿证据：先运行目标测试得到 `1 failed / 7 passed`，失败点为 `expected 300 to be 90`；修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` 通过，`8/8 passed`。

## 6.6 CSV Export Header Escaping 单测补强

- 红灯：新增 `export.test.ts` 后，`exportToCsv` 对带逗号、引号或换行的表头直接 `join(',')`，生成的 CSV 首行会拆列并破坏审计导出结构。
- `export.ts` 现在让 headers 和 row cells 共用同一个 CSV 单元格转义逻辑，表头中的逗号、双引号和换行会按 CSV 规则加引号并转义双引号。
- 红绿证据：先运行目标测试得到 `1 failed / 0 passed`，失败点为表头未转义；修复后 `npm run test:unit -- tests/unit/export.test.ts` 通过，`1/1 passed`。

## 6.6 useExport CSV Header Escaping 单测补强

- 红灯：新增 `use-export.test.ts` 后，`useExport.downloadCsv` 对排产/报表导出的表头仍直接 `join(',')`，带逗号、引号或换行时首行列结构漂移。
- `useExport.ts` 现在让 headers 和 rows 共用同一个带引号 CSV 单元格转义逻辑，保持排产计划与报表导出字段结构稳定。
- 红绿证据：先运行目标测试得到 `1 failed / 0 passed`，失败点为 header 未转义；修复后 `npm run test:unit -- tests/unit/use-export.test.ts` 通过，`1/1 passed`。

## 6.6 Shortage BOM Kitting Package Item Guard 单测补强

- 红灯：扩展 `shortage-risk-sync.test.ts` 后，`readBomKittingPackage` 只校验 BOM 编码、工单号和 traceId，缺少物料名称、数量、单位和动作的不完整 `items` 仍会被当作有效齐套证据返回。
- `shortage-risk-sync.ts` 现在为 BOM 齐套包和明细项增加读取边界守卫；坏结构会清理 `aimes_bom_kitting_package` 并返回 `null`。
- 红绿证据：先运行目标测试得到 `1 failed / 4 passed`，失败点为坏明细仍返回 BOM 包；修复后 `npm run test:unit -- tests/unit/shortage-risk-sync.test.ts` 通过，`5/5 passed`。

## 6.6 Shortage Resolution Guard 单测补强

- 红灯：继续扩展 `shortage-risk-sync.test.ts` 后，`readShortageRiskResolution` 会把只有 `materialCode/receivedQuantity` 的不完整缺料闭环记录当作有效证据返回。
- `shortage-risk-sync.ts` 现在校验缺料闭环的物料、影响订单、来源工单、到货数量、单位、可用量、闭环时间和说明字段；坏结构会清理 `aimes_shortage_risk_resolution`。
- 红绿证据：先运行目标测试得到 `1 failed / 5 passed`，失败点为坏闭环记录未清理；修复后 `npm run test:unit -- tests/unit/shortage-risk-sync.test.ts` 通过，`6/6 passed`。

## 6.6 Auth Store Local User Cache Guard 单测补强

- 红灯：扩展 `auth.store.test.ts` 后，`loadUser` 在 `aimes_token` 存在但 `aimes_user` 为损坏 JSON 时返回 `null`，但不会清理坏身份缓存。
- `auth.ts` 现在复用 `local-user.ts` 的共享解析入口读取 `aimes_user`，并在恢复登录态前校验完整 `username/displayName/role/mustChangePassword` 字段。
- `local-user.ts` 暴露 `getLocalUser()`，让身份缓存解析和坏 JSON 清理规则在路由、聊天、扫码和 auth store 之间保持一致。
- 红绿证据：先运行目标测试得到 `1 failed / 3 passed`，失败点为 `aimes_user` 仍保留 `{bad json`；修复后 `npm run test:unit -- tests/unit/auth.store.test.ts` 通过，`4/4 passed`，相邻 `local-user.test.ts` `2/2 passed`。

## 6.6 Report Actor Local User Cache Guard 单测补强

- 红灯：扩展 `local-user.test.ts` 后，报表 actor 共享函数尚不存在，`ReportBoard.vue` 仍私自 `JSON.parse(aimes_user)`，坏身份缓存不会通过统一入口清理。
- `local-user.ts` 新增 `getLocalUserReportActor()`，按报表承诺包原语义优先使用 `username`，再回退 `displayName` 和 `report.viewer`。
- `ReportBoard.vue` 的 `currentActor()` 改为调用共享身份解析函数，移除组件内 `localStorage.getItem('aimes_user')` 和私有 JSON 解析。
- 红绿证据：先运行目标测试得到 `1 failed / 2 passed`，失败点为 `getLocalUserReportActor is not a function`；修复后 `npm run test:unit -- tests/unit/local-user.test.ts` 通过，`3/3 passed`。

## 6.6 HTTP Refresh Response Guard 单测补强

- 红灯：新增 `http-refresh.test.ts` 后，`/auth/refresh` 返回缺少 `token` 的响应时，响应拦截器会接受坏响应并用 `Bearer undefined` 重试原请求。
- `api/http.ts` 现在在写入 `aimes_token` / `aimes_refresh_token` 前校验 refresh 响应必须包含非空 `token` 和 `refreshToken`。
- refresh 响应结构无效时复用既有失败路径：清理 `aimes_token`、`aimes_refresh_token`、`aimes_user` 并拒绝原 401。
- 红绿证据：先运行目标测试得到 `1 failed / 0 passed`，失败点为 promise resolve 且触发重试；修复后 `npm run test:unit -- tests/unit/http-refresh.test.ts` 通过，`1/1 passed`，相邻 `auth.store.test.ts` / `local-user.test.ts` `7/7 passed`。

## 6.6 HTTP Refresh Retry Header Guard 单测补强

- 红灯：扩展 `http-refresh.test.ts` 后，401 原请求 `config.headers` 缺失时，refresh 虽成功但写入 `Authorization` 会抛错，导致请求被误判为 refresh 失败并清理登录态。
- `api/http.ts` 现在在重试原请求前兜底初始化 `config.headers`，再写入 `Bearer <newToken>`。
- 红绿证据：先运行目标测试得到 `1 failed / 1 passed`，失败点为 promise rejected；修复后 `npm run test:unit -- tests/unit/http-refresh.test.ts` 通过，`2/2 passed`，相邻 `auth.store.test.ts` / `local-user.test.ts` `7/7 passed`。

## 6.6 HTTP Request Authorization Header Guard 单测补强

- 红灯：继续扩展 `http-refresh.test.ts` 后，请求拦截器在原始 config 缺少 `headers` 且存在 `aimes_token` 时会抛 `Cannot set properties of undefined`。
- `api/http.ts` 现在在请求发出前附加 token 时同样兜底初始化 `config.headers`，与 refresh 重试路径保持一致。
- 红绿证据：先运行目标测试得到 `1 failed / 2 passed`，失败点为写入 `Authorization` 时 headers 未定义；修复后 `npm run test:unit -- tests/unit/http-refresh.test.ts` 通过，`3/3 passed`，相邻 `auth.store.test.ts` / `local-user.test.ts` `7/7 passed`。

## 6.6 HTTP / SignalR Access Token Shared Guard 单测补强

- 红灯：新增 `auth-token.test.ts` 后，目标测试因 `../../src/utils/auth-token` 不存在失败，证明 HTTP 和 SignalR 尚无共享 access token 读取入口。
- 新增 `utils/auth-token.ts`，`getLocalAccessToken()` 会忽略空白 `aimes_token` 并返回 `null`，避免空白 token 被当作可用凭据。
- `api/http.ts` 请求拦截器改用共享 token 读取入口；`notifications.ts`、`DashboardBoard.vue`、`MonitoringBoard.vue` 的 SignalR `accessTokenFactory` 同步复用该入口。
- 红绿证据：红灯为 import 解析失败；修复后 `npm run test:unit -- tests/unit/auth-token.test.ts` `1/1 passed`，相邻 `http-refresh.test.ts` / `notifications.store.test.ts` `4/4 passed`。

## 6.6 Access Token Whitespace Normalization 单测补强

- 红灯：扩展 `auth-token.test.ts` 后，`getLocalAccessToken()` 对 `"  access-token  "` 返回原始字符串，HTTP Authorization 和 SignalR credential factory 会继承边界空白。
- `getLocalAccessToken()` 现在返回 trim 后的 token；全空白仍返回 `null`。
- 红绿证据：先运行目标测试得到 `1 failed / 1 passed`，失败点为收到 `"  access-token  "`；修复后 `npm run test:unit -- tests/unit/auth-token.test.ts` `2/2 passed`，相邻 `http-refresh.test.ts` / `notifications.store.test.ts` `4/4 passed`。

## 6.6 Auth Boot / Router Token Guard 单测补强

- 红灯：扩展 `auth.store.test.ts` 后，`aimes_token` 为纯空白且 `aimes_user` 完整时，auth store 会恢复出 `{ token: "   ", ... }` 的登录态。
- 红灯：新增 `router-auth.test.ts` 后，受保护路由在纯空白 `aimes_token` 下仍放行到 `/dashboard`。
- `auth.ts` 与 `router/index.ts` 现在复用 `getLocalAccessToken()`，让页面启动登录态恢复和路由守卫与 HTTP/SignalR 使用同一 token guard。
- 红绿证据：auth store 红灯为 `1 failed / 4 passed`，router 红灯为 `/dashboard` 不等于 `/login`；修复后 `router-auth.test.ts` / `auth.store.test.ts` / `auth-token.test.ts` 合计 `8/8 passed`。

## 6.6 Router Role Whitespace Normalization 单测补强

- 红灯：扩展 `local-user.test.ts` 后，缓存角色 `"  Admin  "` 返回原始字符串，导致路由角色比对无法匹配后端标准角色名 `Admin`。
- `getLocalUserRole()` 现在返回 trim 后的 role；空白 role 仍返回 `null`。
- `router-auth.test.ts` 新增 Admin-only 路由回归，覆盖 `"  Admin  "` 缓存角色能进入 `/admin`。
- 红绿证据：先运行 `local-user.test.ts` 得到 `1 failed / 3 passed`，失败点为收到 `"  Admin  "`；修复后 `local-user.test.ts` / `router-auth.test.ts` 合计 `6/6 passed`。

## 6.6 Local User Actor Whitespace Normalization 单测补强

- 红灯：扩展 `local-user.test.ts` 后，缓存 `displayName: "  报表管理员  "` 会原样返回，审计 actor 和报表签名可能带不可见边界空白。
- `getLocalUserDisplayName()` 与 `getLocalUserReportActor()` 现在返回 trim 后的 displayName / username；空白值仍回退到既有 fallback。
- 红绿证据：先运行 `local-user.test.ts` 得到 `1 failed / 4 passed`，失败点为收到 `"  报表管理员  "`；修复后 `local-user.test.ts` / `auth.store.test.ts` / `router-auth.test.ts` 合计 `12/12 passed`。

## 6.6 Auth Boot Cached Identity Normalization 单测补强

- 红灯：扩展 `auth.store.test.ts` 后，启动恢复登录态会使用 trim 后 token，但 `username/displayName/role` 仍保留 `aimes_user` 缓存中的边界空白。
- `local-user.ts` 现在在共享读取边界归一化缓存身份字段，`getLocalUser()`、角色读取、actor/displayName 读取都复用同一份 trim 后对象。
- 红绿证据：先运行 `auth.store.test.ts` 得到 `1 failed / 5 passed`，失败点为恢复用户仍包含 `"  alice  "`、`"  Alice Zhang  "`、`"  Engineer  "`；修复后 `auth.store.test.ts` / `local-user.test.ts` / `router-auth.test.ts` 合计 `13/13 passed`。
- 收尾验证：前端全量 `npm run test:unit` 通过，`42 files / 199 tests passed`；`npm run lint` 通过。

## 6.6 HTTP Refresh Token Whitespace Normalization 单测补强

- 红灯：扩展 `http-refresh.test.ts` 后，`/auth/refresh` 返回带边界空白的 `token/refreshToken` 时，响应拦截器会用 `Bearer   new-access-token  ` 重试业务请求。
- `api/http.ts` 现在在 refresh 响应通过结构校验后立刻 trim 新 access token 和 refresh token，再写入 localStorage 并返回给重试链路。
- 红绿证据：先运行目标测试得到 `1 failed / 3 passed`，失败点为重试 header 收到带空白 token；修复后 `http-refresh.test.ts` / `auth-token.test.ts` / `auth.store.test.ts` 合计 `12/12 passed`。
- 收尾验证：前端全量 `npm run test:unit` 通过，`42 files / 200 tests passed`；`npm run lint` 通过。

## 6.6 Cached Refresh Token Whitespace Normalization 单测补强

- 红灯：扩展 `http-refresh.test.ts` 后，旧缓存 `aimes_refresh_token` 带边界空白时，`performRefresh()` 会把 `"  refresh-token  "` 原样发送到 `/auth/refresh`。
- `api/http.ts` 现在在读取旧 refresh token 后先 trim；纯空白视为没有 refresh token，带边界空白的有效 token 只以归一化值进入请求体。
- 红绿证据：先运行目标测试得到 `1 failed / 4 passed`，失败点为请求体 refresh token 未归一化；修复后 `http-refresh.test.ts` / `auth-token.test.ts` / `auth.store.test.ts` 合计 `13/13 passed`。
- 收尾验证：前端全量 `npm run test:unit` 通过，`42 files / 201 tests passed`；`npm run lint` 通过。

## 6.6 Backend Login Token Persistence Normalization 单测补强

- 红灯：扩展 `auth.store.test.ts` 后，后端登录响应中的 `token/refreshToken` 带边界空白时，`useAuth().login()` 返回的 `AuthUser.token` 和 localStorage 缓存都会保留空白。
- `auth.ts` 现在在后端登录成功构造 `AuthUser` 时归一化 access token，并在 `saveUser()` 写入 access token / refresh token 前统一 trim。
- 红绿证据：先运行目标测试得到 `1 failed / 6 passed`，失败点为登录返回 `"  backend-access-token  "`；修复后 `auth.store.test.ts` / `http-refresh.test.ts` / `auth-token.test.ts` 合计 `14/14 passed`。
- 收尾验证：前端全量 `npm run test:unit` 通过，`42 files / 202 tests passed`；`npm run lint` 通过。

## 6.6 Frontend Unit Coverage CI Gate 单测补强

- 红灯：新增 `frontend-ci-coverage.test.ts` 后，`package.json` 缺少 `test:unit:coverage`，测试失败于 coverage script 未定义，确认前端 CI 没有单测覆盖率门禁。
- `package.json` 新增 `test:unit:coverage`；`package-lock.json` 增加 `@vitest/coverage-v8@1.6.1`；`vitest.config.ts` 增加 v8 coverage 配置，lines/branches/functions/statements 阈值均为 10。
- 外层 `.github/workflows/ci.yml` 的 frontend job 在 unit tests 后新增 `Unit coverage` step，运行 `npm run test:unit:coverage`。
- `.gitignore` 新增 `src/frontend/coverage/`，避免本地 coverage 报告成为源码改动。
- 红绿证据：修复后 `npm run test:unit -- tests/unit/frontend-ci-coverage.test.ts` 通过，`npm run test:unit:coverage` 通过，`43 files / 203 tests passed`；coverage total 为 lines/statements `17.05%`、branches `69.79%`、functions `60.77%`。
- 收尾验证：前端全量 `npm run test:unit` 通过，`43 files / 203 tests passed`；`npm run lint` 通过。

## 6.6 Frontend Coverage Threshold Raise 单测补强

- 红灯：扩展 `frontend-ci-coverage.test.ts` 后，当前 `vitest.config.ts` 仍使用 lines/branches/functions/statements `10` 阈值，测试失败于缺少 `lines: 15`。
- `vitest.config.ts` 现在把四个前端 coverage threshold 从 `10` 提升到 `15`，高于初始保守安全线，并仍低于当前本地总覆盖率 lines/statements `17.05%`。
- `frontend-ci-coverage.test.ts` 现在同时锁定 coverage 脚本、CI step 和阈值地板，避免后续无声回退到 10%。
- 红绿证据：先运行目标测试得到 `1 failed / 1 passed`；修复后 `npm run test:unit -- tests/unit/frontend-ci-coverage.test.ts` 通过，`2/2 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`43 files / 204 tests passed`；前端全量 `npm run test:unit` 通过，`43 files / 204 tests passed`；`npm run lint` 通过。

## 6.6 Login Page Whitespace Credential Guard 单测补强

- 红灯：新增 `login-page.test.ts` 后，登录页会把纯空白用户名和密码提交给 auth store，目标测试失败于 `login('   ', '   ')` 被调用。
- `LoginPage.vue` 现在在提交入口 trim 用户名和密码；任一字段 trim 后为空时显示 `请输入用户名和密码`，不调用 auth store，也不跳转路由。
- 成功路径仍使用 trim 后凭据调用 `login`，避免边界空白进入后端登录链路。
- 红绿证据：先运行目标测试得到 `1 failed / 0 passed`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`1/1 passed`；相邻 `auth.store.test.ts` `7/7 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`44 files / 205 tests passed`，coverage total lines/statements 从 `17.05%` 提升到 `17.51%`，`LoginPage.vue` 行覆盖为 `96.05%`；前端全量 `npm run test:unit` 通过，`44 files / 205 tests passed`；`npm run lint` 通过。

## 6.6 Login Page Whitespace Submit Button Guard 单测补强

- 红灯：扩展 `login-page.test.ts` 后，纯空白用户名和密码虽然提交时会被 guard 拦截，但提交按钮仍处于可点击状态，目标测试失败于 `disabled` 属性缺失。
- `LoginPage.vue` 新增 `canSubmit` computed，按钮禁用条件改为 `loading || !canSubmit`，让 UI 状态和提交入口的 trim 规则保持一致。
- 提交入口仍保留 trim 后空白 guard，作为绕过按钮状态或脚本提交时的第二层防护。
- 红绿证据：先运行目标测试得到 `1 failed / 1 passed`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`2/2 passed`；相邻 `auth.store.test.ts` `7/7 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`44 files / 206 tests passed`，coverage total lines/statements `17.51%`；前端全量 `npm run test:unit` 通过，`44 files / 206 tests passed`；`npm run lint` 通过。

## 6.6 Toast Container Alert Semantics 单测补强

- 红灯：新增 `toast-container.test.ts` 后，错误 toast 虽显示标题和消息，但没有 `role="alert"` 与 `aria-live="assertive"`，目标测试找不到 `[role="alert"]`。
- `ToastContainer.vue` 现在按类型设置语义：`error` toast 使用 `role="alert"` 和 `aria-live="assertive"`；其他 toast 使用 `role="status"` 和 `aria-live="polite"`。
- 该修复只补可访问性语义，不改变通知 store、SignalR 或自动移除逻辑。
- 红绿证据：先运行目标测试得到 `1 failed / 0 passed`；修复后 `npm run test:unit -- tests/unit/toast-container.test.ts` 通过，`1/1 passed`；相邻 `notifications.store.test.ts` `1/1 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`45 files / 207 tests passed`，coverage total lines/statements `17.70%`，`ToastContainer.vue` 行覆盖 `100%`；前端全量 `npm run test:unit` 通过，`45 files / 207 tests passed`；`npm run lint` 通过。

## 6.6 Toast Decorative Icon Semantics 单测补强

- 红灯：扩展 `toast-container.test.ts` 后，toast 图标缺少 `aria-hidden`，目标测试读取 `.toast-icon` 的 `aria-hidden` 为 `undefined`。
- `ToastContainer.vue` 现在把 `.toast-icon` 标记为 `aria-hidden="true"`，避免装饰性符号被辅助技术重复播报。
- 该修复只调整可访问性语义，不改变 toast 文案、类型、动画或移除逻辑。
- 红绿证据：修复后 `npm run test:unit -- tests/unit/toast-container.test.ts` 通过，`2/2 passed`；相邻 `notifications.store.test.ts` `1/1 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`45 files / 208 tests passed`，coverage total lines/statements `17.70%`、branches `69.73%`、functions `61.15%`，`ToastContainer.vue` 行覆盖 `100%`；前端全量 `npm run test:unit` 通过，`45 files / 208 tests passed`；`npm run lint` 通过。

## 6.6 Toast Atomic Live Region 单测补强

- 红灯：扩展 `toast-container.test.ts` 后，warning toast 作为 `role="status"` / `aria-live="polite"` live region，但缺少 `aria-atomic`，目标测试读取 `aria-atomic` 为 `undefined`。
- `ToastContainer.vue` 现在为每条 toast 设置 `aria-atomic="true"`，让动态插入/更新时辅助技术按整条通知播报标题和消息。
- 该修复只补 live region 语义，不改变 toast 类型、文案、动画或通知 store 行为。
- 红绿证据：先运行目标测试得到 `1 failed / 2 passed`，失败点为 `expected undefined to be 'true'`；修复后 `npm run test:unit -- tests/unit/toast-container.test.ts` 通过，`3/3 passed`；相邻 `notifications.store.test.ts` `1/1 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`45 files / 209 tests passed`，coverage total lines/statements `17.70%`、branches `69.78%`、functions `61.15%`，`ToastContainer.vue` 行覆盖 `100%`；前端全量 `npm run test:unit` 通过，`45 files / 209 tests passed`；`npm run lint` 通过。

## 6.6 Login Page Error Alert Semantics 单测补强

- 补充 `login-page.test.ts` 成功路径锁定：带边界空白的有效用户名/密码会以 trim 后值调用 auth store，并在成功后跳转 `/dashboard`；该测试立即通过，只作为既有行为防回归，不作为本切片红灯。
- 红灯：扩展 `login-page.test.ts` 后，空白凭据错误文本已显示，但没有 `role="alert"` / `aria-live="assertive"`，目标测试找不到 `[role="alert"]`。
- `LoginPage.vue` 现在把 `.login-error` 暴露为 assertive alert，保证登录校验错误对辅助技术即时可感知。
- 该修复只补错误提示语义，不改变登录提交、trim、跳转或 auth store 调用逻辑。
- 红绿证据：先运行目标测试得到 `1 failed / 3 passed`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`4/4 passed`；相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`45 files / 211 tests passed`，coverage total lines/statements `17.72%`、branches `70.01%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `99.56%`；前端全量 `npm run test:unit` 通过，`45 files / 211 tests passed`；`npm run lint` 通过。

## 6.6 Login Page Busy Submit Semantics 单测补强

- 红灯：扩展 `login-page.test.ts` 后，登录请求 pending 时按钮已显示 `登录中...` 且被禁用，但缺少 `aria-busy`，目标测试读取 `aria-busy` 为 `undefined`。
- `LoginPage.vue` 现在在 `loading` 为 true 时为 submit button 设置 `aria-busy="true"`，让等待状态对辅助技术可见。
- 该修复只补加载态语义，不改变登录请求、禁用条件、成功跳转或失败错误处理。
- 红绿证据：先运行目标测试得到 `1 failed / 4 passed`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`5/5 passed`；相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`45 files / 212 tests passed`，coverage total lines/statements `17.73%`、branches `70.03%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `99.57%`；前端全量 `npm run test:unit` 通过，`45 files / 212 tests passed`；`npm run lint` 通过。

## 6.6 Login Page Error Field Association 单测补强

- 红灯：扩展 `login-page.test.ts` 后，登录错误 alert 缺少稳定 `id`，用户名/密码输入框也没有 `aria-invalid` 与 `aria-describedby` 指向错误说明，目标测试读取 alert `id` 为 `undefined`。
- `LoginPage.vue` 现在为错误 alert 设置 `id="login-error"`；错误存在时，用户名和密码输入框均设置 `aria-invalid="true"` 与 `aria-describedby="login-error"`。
- 该修复只补字段与错误文案的可访问性关联，不改变登录提交、错误文案、trim 或 loading 逻辑。
- 红绿证据：先运行目标测试得到 `1 failed / 5 passed`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`6/6 passed`；相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`45 files / 213 tests passed`，coverage total lines/statements `17.74%`、branches `70.16%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `99.58%`；前端全量 `npm run test:unit` 通过，`45 files / 213 tests passed`；`npm run lint` 通过。

## 6.6 Login Page Failed Login Password Clear 单测补强

- 红灯：扩展 `login-page.test.ts` 后，auth store 登录失败时错误会显示、用户名会保留、不会跳转，但密码输入框仍保留失败凭据，目标测试收到 `wrong-password` 而不是空字符串。
- `LoginPage.vue` 现在在登录失败 catch 分支设置错误信息后清空 `password`，避免失败凭据继续留在页面状态中。
- 该修复只改变失败路径的密码字段状态，不改变成功登录、空白校验、错误文案或跳转逻辑。
- 红绿证据：先运行目标测试得到 `1 failed / 6 passed`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`7/7 passed`；相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 收尾验证：`npm run test:unit:coverage` 通过，`45 files / 214 tests passed`，coverage total lines/statements `17.74%`、branches `70.18%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `100%`；前端全量 `npm run test:unit` 通过，`45 files / 214 tests passed`；`npm run lint` 通过。

## 6.6 Login Page Failed Login Focus Recovery 单测补强

- 红灯：扩展 `login-page.test.ts` 后，auth store 登录失败时密码会清空，但焦点仍停在 `body`，目标测试期望 `document.activeElement` 回到密码输入框。
- `LoginPage.vue` 现在为密码输入框维护 `ref`，登录失败清空密码后等待 DOM 更新并把焦点送回密码框，方便用户直接重新输入。
- 该修复只改变失败路径的焦点管理，不改变成功登录、空白校验、错误文案、密码清空或跳转逻辑。
- 红绿证据：先运行目标测试得到 `1 failed / 7 passed`，失败点为 `document.activeElement` 仍是 `body`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`8/8 passed`。
- 收尾验证：相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`；`npm run test:unit:coverage` 通过，`45 files / 215 tests passed`，coverage total lines/statements `17.75%`、branches `70.19%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `100%`；前端全量 `npm run test:unit` 通过，`45 files / 215 tests passed`；`npm run lint` 通过。
