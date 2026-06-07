# 2026-05-31 Sprint 6 Code Hygiene Review

## 结论

- 本地审计通过：backend production C# 源码不再直接写 `Console.Write*`，启动信息改由 ASP.NET Core 日志管线输出。
- 新增门禁可在后续变更中阻止直接控制台输出重新进入 `src/backend`。
- PR 模板已补齐 Sprint 6 / 6.7 的人工代码卫生检查项，并由架构测试锁定。
- 6.2 测试认证辅助已支持多角色参数化，能覆盖同一测试用户具备多个角色的授权场景。
- 6.3 集成测试已显式加入统一 serial collection，降低共享 `WebApplicationFactory` / InMemory DB 测试并发干扰风险。
- 6.4 性能测试已迁到专用 test host、专用 InMemory DB 和专用种子过滤器，避免与普通集成测试共享状态。
- 6.5 E2E 硬等待已清零，页面等待改为具体 UI 状态和内容断言。
- 6.6 前端单测基础设施已落地，`auth` store、错误消息提取、offline demo mode、排产反馈同步和风险处置同步关键路径有 Vitest 覆盖。
- 根 CI frontend job 已接入 `npm run test:unit`，本地 `v1/.github/workflows` 删除状态不作为有效 CI 入口。
- 6.8 覆盖率门禁已接入根 CI backend job，低于阈值时 PowerShell 脚本会抛错阻塞 job。
- 6.9 的 `v1` 仓库根治理文档已补齐：`CONTRIBUTING.md`、`SECURITY.md` 存在，README 文档索引可发现两者。
- 6.10 的 ADR 文档已补齐：`ADR-001` 至 `ADR-006` 和 `ADR-010` 已落在 `_docs/_adr/`。
- 6.11 的版本与发布流程文档已补齐：`VERSION` 存在，`CHANGELOG.md` 记录当前 remediation 版本和 `v1.0.0` tag 门槛。
- 6.1 的 `BomAppService` 单测片已补齐 3 条，并修正齐套计算忽略 `LossRate` 的业务风险。
- BOM 损耗率口径已继续下沉到基础设施展开源头，避免 BOM API 与排产齐套预检使用不同需求量。
- 6.1 的 `AnomalyAppService` 单测片已补齐 4 条，并修正严重度输入大小写/空格导致紧急异常被静默降级的业务风险。
- 6.1 的 `AuditLogAppService` 单测片已补齐 3 条，并修正过滤器审计写入后未持久化的回归风险。
- 6.1 的 `RoutingAppService` 单测片已补齐 3 条，并修正工艺路线创建丢失步骤工时/设备/质检/参数以及乱序步骤排序漂移的业务风险。
- 6.1 的 `KnowledgeAppService` 单测片已补齐 3 条，并修正文档分块在空白/短文档下无限循环的稳定性风险。
- 6.1 的 `DashboardKpiService` 单测片已补齐 3 条，并修正 Dashboard 排产达成率未把超期未完成工单纳入分母的 KPI 口径风险。
- 6.1 的 `RiskAppService` 单测片已补齐 3 条，并修正风险面板生成时间使用本地时区的 API 契约风险。
- 6.1 的 `ScheduleAgentService` 单测片已补齐 3 条，并修正策略拒绝审计 payload 丢默认拒绝原因的回放风险。
- `ScheduleAgentService` 的风险处置 evidence 映射已补 1 条高风险回归，锁定后端 evidence 排序时间使用业务事件时间而不是保存时间。
- `ScheduleAgentService` 的助手动作审计 evidence 映射已补 1 条高风险回归，锁定后端 evidence 排序时间使用助手动作发生时间而不是保存时间。
- `ScheduleAgentService` 的异常分流 evidence 映射已补 1 条高风险回归，锁定后端 evidence 排序时间使用异常分流事件时间而不是保存时间。
- `ScheduleAgentService` 的现场态势升级 evidence 映射已补 1 条高风险回归，锁定闭环记录按闭环时间排序，未闭环记录按创建时间排序。
- `ScheduleAgentService` 的风险 SLA 复核 evidence 映射已补 1 条高风险回归，锁定闭环记录按闭环时间排序，未闭环记录按创建时间排序。
- `ScheduleAgentService` evidence CreatedAt 已新增架构防回归门禁，防止新增 `AgentEvidenceLink` 初始化块漏写 `CreatedAt` 或改回保存时刻。
- `ScheduleAgentService` 风险处置查询已补防回归覆盖，坏 JSON evidence 会被跳过，`take <= 0` 时保持默认 12 条上限。
- `ScheduleAgentService` 查询映射链路已移除 `item!` null-forgiving 压制，并由 Sprint 6 架构门禁锁定。
- `SchedulingContextProvider` 与 `ReportEndpoints` 两条关键排产/报表路径已移除 null-forgiving 压制，并由架构门禁锁定。
- `NotificationConfigRepository` 与 `RefreshTokenRepository` 已移除 DbSet null-forgiving 压制，复用 `MesDbContext` 已暴露的非空 DbSet 属性。
- `AuthEndpoints.LoginAsync` 已移除 `role!` / `displayName!`，认证成功后必须先收窄 token claim 值，再签发 JWT、refresh token 和登录响应。
- `ExceptionMiddleware` 已移除 `problem.Status!.Value`，异常响应状态码写入改为显式读取 `ProblemDetails.Status`，缺失时 fail loud。
- Endpoint handler 中最后一批 `default!` 已移除：相关 Minimal API 方法通过参数重排把 DI 服务和 `CancellationToken` 放到可选 query 默认值前。
- 6.1 的 `OperationService` 单测片已补齐 3 条，并修正生产开工只启动工序、不启动关联工单导致后续完工上报断链的风险。
- 6.1 AppService 覆盖清点：`ExportAppService` 在 Application 层当前只是接口，真实实现位于 Infrastructure；不把接口计入需要 3 条 Application AppService 单测的对象。

## 覆盖点

- `ArchitectureRuleTests` 扫描 `src/backend/**/*.cs`，定位直接 `Console.Write(...)`、`Console.WriteLine(...)`、`System.Console.Write(...)`、`System.Console.WriteLine(...)`。
- `Program.cs` 的启动横幅改为 `ILogger<Program>.LogInformation`，符合项目结构化日志规则。
- `bin`、`obj`、`wwwroot` 已排除，避免测试被生成文件或前端打包资产污染。
- `.github/pull_request_template.md` 包含 `static List`、`Console.Write*`、`.Result`、`.Wait()` 和 `ArchitectureTests` 检查项。
- `TestAuthHandler` 将 `X-Test-Role` 的多值 header 和逗号分隔值展开为多个 `ClaimTypes.Role` claim。
- `EndpointAuthorizationTests` 覆盖 `Operator` + `Admin` 多角色身份访问 `/api/v1/admin/users` 的授权路径。
- `IntegrationSerialCollection` 定义 `[CollectionDefinition("IntegrationSerial", DisableParallelization = true)]`。
- 集成测试项目所有 `*Tests` 类均标注 `[Collection("IntegrationSerial")]`，并由架构门禁扫描 `src/tests/MES.Tests.Integration/**/*.cs`。
- `PerformanceTests` 使用 `IClassFixture<PerformanceTestWebApplicationFactory>`，不再依赖 `TestWebApplicationFactory`。
- `PerformanceTestWebApplicationFactory` 使用 `Performance_Test_DB`，并注册 `PerformanceTestDataSeedFilter`。
- `dashboard.spec.ts` 的页面就绪等待改为 `.command-center` 可见。
- `modules.spec.ts` 删除固定 500ms 等待，直接等待各模块根元素和关键面板。
- `demo-asset-capture.spec.ts` 截图前等待 `.otd-summary`、`.risk-action-panel`、`.agent-workbench-panel`、`.production-board`、`.otd-report-section` 等业务可见状态。
- `package.json` 新增 `test:unit`，并锁定 `vitest`、`@vue/test-utils`、`jsdom` 到 `package-lock.json`。
- `vitest.config.ts` 使用 Vue 插件和 jsdom 环境，只纳入 `tests/unit/**/*.test.ts`。
- `auth.store.test.ts` 覆盖后端登录 token/refresh token 持久化、离线 demo query 参数绕过后端、组件读取 `useAuth` computed 并 logout 清理 storage。
- `error-message.test.ts` 覆盖响应体 `message` 优先、ProblemDetails `title` 读取、空值 fallback。
- `offline-demo-mode.test.ts` 覆盖 query 参数启停 demo mode、离线错误识别、跳过预期 offline log、真实错误继续输出、`/scheduling/` base asset path。
- `test-storage.ts` 统一提供内存 `localStorage`，避免不同 Node/jsdom storage 行为影响测试稳定性。
- `schedule-feedback-sync.test.ts` 覆盖写入 `aimes_schedule_feedback_snapshot`、同步 `aimes_otd_evidence_chain`、坏 JSON 清理和不完整 snapshot 忽略。
- `risk-action-sync.test.ts` 覆盖写入 `aimes_risk_action_traces`、同步 `aimes_otd_evidence_chain`、后端 best-effort post、backend-first 空结果 fallback、同状态去重、状态转换保留和本地最多 12 条。
- `risk-action-sync.test.ts` mock 底层 `api/http`，避免 jsdom 单测真实发 XHR，同时仍覆盖 `riskEvidence` API 封装路径。
- 根 `C:\AIWorks\AIMes\.github\workflows\ci.yml` frontend job 顺序为 `npm ci`、`npm run lint`、`npm run test:unit`、`npm run build`。
- `check-cobertura-threshold.ps1` 会扫描匹配的 Cobertura XML，按 `lines-valid` / `branches-valid` 做加权汇总，并分别检查 line / branch 阈值。
- 根 CI backend job 顺序为 Unit Tests、Integration Tests、Coverage Threshold、Upload Test Results、Code Coverage Report。
- 覆盖率门禁用临时 Cobertura 样本验证过失败路径：line `50.00%` 在阈值 `60.00%` 下会失败。
- 真实 Unit coverage 样本验证通过：line `11.88%` >= `10%`，branch `28.50%` >= `20%`。
- `eslint.config.cjs` 和 `npm run lint` 已把 `tests/unit` 与 `vitest.config.ts` 纳入扫描范围。
- `CONTRIBUTING.md` 覆盖 issue-first 协作、PR 要求、本地检查、代码规则和 `_docs` 记录要求。
- `SECURITY.md` 覆盖私下漏洞报告、支持版本、严重度分级、安全基线和披露策略。
- `README.md` 文档区链接到 `CONTRIBUTING.md` 与 `SECURITY.md`。
- `ADR-001` 记录生产迁移不在应用启动时自动执行。
- `ADR-002` 记录 `v1.0.0` 与 `v1.1` 发布判据分层。
- `ADR-003` 记录审计写入按事务语义分层。
- `ADR-004` 记录 UoW 事务边界由 `CommitAsync` 统一保存。
- `ADR-005` 记录架构测试作为 remediation firewall。
- `ADR-006` 记录无外部资源时的 AI 辅助安全/合规审查兜底。
- `ADR-010` 汇总 CC remediation 审计采纳决策。
- `VERSION` 当前值为 `0.1.0-remediation.20260531`，避免把当前状态误读为正式 `v1.0.0`。
- `CHANGELOG.md` 的 `Release Process` 明确 `v1.0.0` tag 需要 Sprint 0-3、staging、外部依赖、安全签字、攻击链验证和两周观察证据。
- `CHANGELOG.md` 的 `Unreleased` 段已汇总本轮治理文档、ADR、VERSION 和发布流程变更。
- `BomAppServiceTests.GetAllBomsAsync_ShouldUseRepositoryPagingAndPreservePageMetadata` 锁定 BOM 列表必须走仓储分页和计数，防止回退到 Application 层全量加载分页。
- `BomAppServiceTests.ExplodeBomAsync_ShouldMultiplyNestedQuantitiesForAuditTraceability` 锁定多层 BOM 递归展开的累计数量，保证审计/齐套追踪能解释父子层需求。
- `BomAppServiceTests.CheckKittingAsync_ShouldIncludeLossRateInRequiredQuantity` 锁定 `LossRate` 进入齐套需求，`10 * 2 * 1.1 = 22` 时库存 20 必须判短缺。
- `BomAppService.ExplodeItems` 现在通过 `ApplyLossRate` 计算累计需求，`QuantityPerUnit` 仍保留原始 BOM 用量，`TotalQuantity` 体现含损耗需求。
- `BomExplosionServiceTests.ExplodeAsync_ShouldIncludeLossRateInQuantityPerUnit` 锁定基础设施展开源头输出含损耗需求，`10` + `10%` 输出 `11`。
- `MaterialKittingCheckerTests.CheckAsync_ShouldUseLossAdjustedBomRequirement` 锁定排产齐套预检在订单数量为 2 时按 `22` 需求判短缺。
- `BomExplosionService` 的 `BomRequirementSummary.QuantityPerUnit` 现在已含损耗率，因此 `ConstraintValidator` 与 `SchedulingRuleEngine` 直接消费时也能继承同一物料需求口径。
- `AnomalyAppServiceTests.CreateAnomalyAsync_WhenSeverityHasDifferentCasingAndWhitespace_ShouldPreserveCriticalSeverity` 锁定 API 输入 `" critical "` 仍创建 `Critical` 异常，避免紧急告警进入中等级别。
- `AnomalyAppServiceTests.CreateAnomalyAsync_WhenSeverityIsNull_ShouldDefaultToMedium` 锁定缺省严重度继续走 `Medium` 默认值，避免请求绑定空值造成创建失败。
- `AnomalyAppServiceTests.GetOpenAnomaliesAsync_ShouldUseRepositoryPagingAndPropagateCancellationToken` 锁定开放异常列表使用 `CountOpenAsync` / `GetOpenPagedAsync`，并传播调用方 `CancellationToken`。
- `AnomalyAppServiceTests.AnalyzeAnomalyAsync_ShouldTranslateAnalysisResponsesIntoPrioritizedSuggestedActions` 锁定 AI 建议优先级为 1、人工建议优先级为 2，保证分析面板排序语义稳定。
- `AnomalyAppService.CreateAnomalyAsync` 现在通过 null-safe trim + `string.Equals(..., OrdinalIgnoreCase)` 解析严重度，未知/空值仍落到 `Medium`，不使用 `!` 压制 nullable warning。
- `AuditLogAppServiceTests.GetAuditLogsAsync_ShouldUseActionFilteredRepositoryPagingAndHidePayloadFields` 锁定列表页使用 action 过滤分页，并只返回摘要字段，避免 payload 泄漏到列表视图。
- `AuditLogAppServiceTests.GetAuditLogByIdAsync_WhenFound_ShouldReturnDetailPayloadAndAiHashes` 锁定详情页返回 old/new values、prompt/context hash、IP 和 UA，保证审计追踪证据完整。
- `AuditLogAppServiceTests.WriteAuditLogAsync_ShouldPersistInitiatorAndRequestContext` 锁定写入时保留 `InitiatedBy`、resource、resourceId、old/new values、IP、UA 和 CT。
- `EmployeeControllerTests.Create_ShouldPersistAuditLogFromEndpointFilter` 锁定挂载 `AuditEndpointFilter` 的员工创建端点成功后，过滤器审计记录进入 `AuditLogs`。
- `AuditEndpointFilter` 现在仍只依赖 `IAuditLogAppService` 与 `IUnitOfWork` 抽象，不直接引用 `DbContext`；H3/H7 架构门禁已通过。
- `RoutingAppServiceTests.CreateRouteAsync_ShouldPreserveStepTimingEquipmentInspectionAndParameters` 锁定创建路线时步骤标准准备时间、单位运行时间、设备类型、是否质检、参数上下限和必填标记不丢失。
- `RoutingAppServiceTests.GetRouteByCodeAsync_WhenFound_ShouldReturnStepsOrderedBySequenceWithParameters` 锁定详情步骤按 `StepSequence` 输出，避免排产/看板按插入顺序解释工艺。
- `RoutingAppServiceTests.GetAllRoutesAsync_ShouldReturnRequestedPageMetadata` 锁定当前列表分页元数据和页内容，作为后续仓储分页改造的回归基线。
- `RoutingStep` 新增 `ConfigureStandards` / `AddParameter` 领域行为，保持 setter 私有；`ProcessRoute.AddStep` 保留调用方的 `StepSequence` 并排序集合。
- `KnowledgeAppServiceTests.QueryAsync_ShouldSearchKnowledgeAndAppendChatHistoryWithSourceIds` 锁定知识查询会生成 embedding、检索向量库、调用 LLM，并把用户/助手消息与来源文档写入会话历史。
- `KnowledgeAppServiceTests.UploadDocumentAsync_WhenContentIsBlank_ShouldReturnSkippedWithoutEmbeddingOrUpsert` 锁定空白文档不调用 embedding/upsert，避免无意义向量写入和死循环。
- `KnowledgeAppServiceTests.UploadDocumentAsync_ShouldSkipBlankChunksAndPreserveCategoryMetadata` 锁定上传文档时保留分类与文件名元数据，并只对非空 chunk 生成 embedding。
- `KnowledgeAppService.SplitIntoChunks` 现在对空白内容直接返回空集合，短文档到达文末后退出循环，保留 overlap 逻辑但避免 position 不前进。
- `DashboardKpiServiceTests.ComputeDashboardAsync_ShouldCountOverdueUnfinishedWorkOrdersInScheduleAdherenceDenominator` 锁定 Dashboard `ScheduleAdherence` 与 OTD 口径一致：已完成或已到期工单进入分母，超期未完成按未准时计算。
- `DashboardKpiServiceTests.ComputeDashboardAsync_ShouldMapEquipmentQualityAndMaterialAlerts` 锁定设备状态文本、设备利用率、质量通过率、物料 critical 告警和质量统计。
- `DashboardKpiServiceTests.ComputeDashboardAsync_ShouldPropagateCancellationTokenToRepositories` 锁定 Dashboard KPI 读取各仓储时传播调用方 `CancellationToken`。
- `DashboardKpiService` 现在复用 `ProductionKpiCalculator.CalculateOnTimeRate`，避免 Dashboard 与 Report 对同一 OTD 指标使用不同实现。
- `RiskAppServiceTests.GetRiskDashboardAsync_ShouldReturnDemoFlagAndUtcGeneratedAt` 锁定风险面板仍显式返回 `IsDemoData = true`，并用 UTC `GeneratedAt` 让前端/日志跨时区解释一致。
- `RiskAppServiceTests.GetRiskDashboardAsync_ShouldComputeCountsFromAllRiskCategories` 锁定 `Counts` 汇总订单、设备、物料、瓶颈四类风险，不允许只统计单一区域。
- `RiskAppServiceTests.GetRiskDashboardAsync_ShouldReturnFrontendConsumableRiskRows` 锁定四类列表非空、level 只允许 `critical/warning/healthy`，并保持 `MaterialRisk.Code == MaterialCode` 的前端兼容字段。
- `RiskAppService` 当前只把演示面板生成时间改为 `DateTime.UtcNow`；未改变演示数据内容或接入真实风险计算。
- `ScheduleAgentServiceTests.RecordPolicyRejectionAsync_WhenDecisionIsMissing_ShouldPersistFallbackAuditWithDenialReason` 锁定即使 decision 已缺失，权限拒绝也要用 fallback decision id 写 `AgentActionResult` 和 `AuditLog`，并在审计 payload 中保留默认拒绝原因。
- `ScheduleAgentServiceTests.QueryRecentAsync_ShouldRequestSchedulingDecisionsAndMapScenarios` 锁定最近决策查询只取 `Scheduling` bounded context，并把场景映射到 DTO。
- `ScheduleAgentServiceTests.ExecuteCrossDomainActionAsync_WhenDecisionIsMissing_ShouldFailWithoutWritingAuditOrAction` 锁定跨域执行在决策不存在时失败且不写审计/动作结果，避免产生孤儿成功记录。
- `ScheduleAgentServiceTests.UpsertRiskActionTraceAsync_ShouldPersistEventTimestampForEvidenceOrdering` 锁定风险处置 trace upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 trace id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `RiskActionTraceDto.CreatedAt`。
- `ScheduleAgentServiceTests.UpsertAssistantActionAuditAsync_ShouldPersistEventTimestampForEvidenceOrdering` 锁定助手动作审计 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 trace id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `AssistantActionAuditRecordDto.CreatedAt`。
- `ScheduleAgentServiceTests.UpsertAnomalyDispatchRecordAsync_ShouldPersistEventTimestampForEvidenceOrdering` 锁定异常分流 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 trace id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `AnomalyDispatchRecordDto.CreatedAt`。
- `ScheduleAgentServiceTests.UpsertMonitoringSituationEscalationAsync_ShouldPersistClosedTimestampForEvidenceOrdering` 锁定现场态势升级 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 closure trace，并要求闭环记录的 `AgentEvidenceLink.CreatedAt` 来自 `MonitoringSituationEscalationDto.ClosedAt`。
- `ScheduleAgentServiceTests.UpsertRiskSlaReviewAsync_ShouldPersistClosedTimestampForEvidenceOrdering` 锁定风险 SLA 复核 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 closure trace，并要求闭环记录的 `AgentEvidenceLink.CreatedAt` 来自 `RiskSlaReviewRecordDto.ClosedAt`。
- `ScheduleAgentServiceTests.UpsertAssistantRecoveryPackageAsync_ShouldPersistClosedTimestampForEvidenceOrdering` 锁定交付恢复包 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 closure trace，并要求闭环记录的 `AgentEvidenceLink.CreatedAt` 来自 `AssistantRecoveryPackageDto.ClosedAt`。
- `ScheduleAgentServiceTests.UpsertAssistantAnomalyPackageAsync_ShouldPersistEventTimestampForEvidenceOrdering` 锁定助手异常处置包 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 trace id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `AssistantAnomalyDispositionPackageDto.CreatedAt`。
- `ScheduleAgentServiceTests.UpsertAssistantEngineeringConstraintPackageAsync_ShouldPersistEventTimestampForEvidenceOrdering` 锁定助手工程约束包 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 trace id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `AssistantEngineeringConstraintPackageDto.CreatedAt`。
- `ScheduleAgentServiceTests.UpsertProductionAnomalyEventAsync_ShouldPersistDetectedTimestampForEvidenceOrdering` 锁定生产异常事件 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 trace id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `ProductionAnomalyEventDto.DetectedAt`。
- `ScheduleAgentServiceTests.UpsertLaborReassignmentAsync_ShouldPersistEventTimestampForEvidenceOrdering` 锁定人力调拨 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 trace id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `LaborReassignmentRecordDto.CreatedAt`。
- `ScheduleAgentServiceTests.UpsertLaborQualificationBlockAsync_ShouldPersistReleasedTimestampForEvidenceOrdering` 锁定人员资质阻断释放态 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 release trace，并要求 `AgentEvidenceLink.CreatedAt` 来自 `LaborQualificationBlockRecordDto.ReleasedAt`。
- `ScheduleAgentServiceTests.UpsertBarcodeScanEvidenceAsync_ShouldPersistEventTimestampForEvidenceOrdering` 锁定扫码追溯 evidence upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 trace id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `BarcodeScanEvidenceRecordDto.CreatedAt`。
- `ScheduleAgentServiceTests.UpsertQualityCapaClosureAsync_ShouldPersistVerifiedTimestampForEvidenceOrdering` 锁定质量 CAPA 闭环 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 trace id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `QualityCapaClosureDto.VerifiedAt`。
- `ScheduleAgentServiceTests.UpsertAgentConfigApprovalAsync_ShouldPersistDecisionTimestampForEvidenceOrdering` 锁定 Agent 配置审批决策态 upsert 时 `EvidenceType`、`EvidenceKey`、审计 resource、业务键和 audit id，并要求 `AgentEvidenceLink.CreatedAt` 来自 `AgentConfigApprovalRecordDto.DecidedAt`。
- `ScheduleAgentServiceTests.RecommendAsync_ShouldPersistScheduleRequestEvidenceWithDecisionTimestamp` 锁定 Agent 推荐时 `ScheduleRequest` evidence 的 `EvidenceType`、`EvidenceKey` 和 decision 关联，并要求 `AgentEvidenceLink.CreatedAt` 与 `AgentDecision.CreatedAt` 对齐。
- `Sprint6ScheduleAgentEvidenceLinks_ShouldSetBusinessEventTimestamp` 扫描 `ScheduleAgentService.cs` 中所有 `new AgentEvidenceLink` 初始化块，要求显式设置 `CreatedAt` 且禁止 `CreatedAt = DateTime.UtcNow`。
- `ScheduleAgentServiceTests.QueryRiskActionTracesAsync_ShouldSkipInvalidEvidenceAndUseDefaultTake` 锁定风险处置列表查询跳过反序列化失败的 evidence，并向仓储请求默认 12 条。
- `Sprint6ScheduleAgentService_ShouldNotUseNullForgivingOperator` 扫描 `ScheduleAgentService.cs` 中 `identifier!` 形式的 null-forgiving 压制，避免 nullable warning 被静默绕过。
- `Sprint6CriticalBackendFiles_ShouldNotUseNullForgivingOperator` 扫描 `SchedulingContextProvider.cs` 与 `ReportEndpoints.cs`，防止 route code 收集和日生产报表聚合重新引入 `!` 压制。
- `Sprint6AdminTokenRepositories_ShouldNotUseNullForgivingOperator` 扫描 `NotificationConfigRepository.cs` 与 `RefreshTokenRepository.cs`，防止 Admin 通知配置/刷新令牌仓储重新使用 DbSet `!` 压制。
- `Sprint6AuthEndpoints_ShouldNotUseNullForgivingForTokenClaims` 扫描 `AuthEndpoints.cs` 中 `role!` / `displayName!`，防止认证端点在未收窄身份 claim 时签发 token。
- `Sprint6ExceptionMiddleware_ShouldNotUseNullForgivingForProblemStatus` 扫描 `ExceptionMiddleware.cs` 中 `problem.Status!`，防止全局异常处理中间件用 `!` 绕过响应状态码可空性。
- `Sprint6EndpointHandlers_ShouldNotUseDefaultNullForgivingParameters` 扫描 `MES.Api/Endpoints/*.cs` 中的 `= default!`，防止 handler 参数顺序问题重新引入 null-forgiving 压制。
- `rg --pcre2 "\b[A-Za-z_][A-Za-z0-9_]*!(?![=])|default!" src/backend/MES.Api src/backend/MES.Infrastructure src/backend/MES.Application src/backend/MES.Domain -g "*.cs"` 本轮无命中，后端生产代码的 null-forgiving/default-null-forgiving 压制已清零。
- `ScheduleAgentService.RecordPolicyRejectionAsync` 现在复用同一个 `rejectionReason` 写动作结果和审计 JSON，避免审计回放看到 `reason:null`。
- `ScheduleAgentService.UpsertRiskActionTraceAsync` 现在将前端传入的 ISO 事件时间解析为 UTC 后写入 evidence，保证 `QueryEvidenceLinksAsync` 按 `CreatedAt` 倒序返回时保留真实事件顺序。
- `ScheduleAgentService.UpsertAssistantActionAuditAsync` 现在将前端传入的 ISO 动作时间解析为 UTC 后写入 evidence，避免助手动作审计回放按保存时刻重排。
- `ScheduleAgentService.UpsertAnomalyDispatchRecordAsync` 现在将前端传入的 ISO 分流时间解析为 UTC 后写入 evidence，避免异常分流回放按保存时刻重排。
- `ScheduleAgentService.UpsertMonitoringSituationEscalationAsync` 现在优先使用 `ClosedAt`，缺失时使用 `CreatedAt`，避免现场态势升级闭环回放按保存时刻重排。
- `ScheduleAgentService.UpsertRiskSlaReviewAsync` 现在优先使用 `ClosedAt`，缺失时使用 `CreatedAt`，避免风险 SLA 复核闭环回放按保存时刻重排。
- `ScheduleAgentService.UpsertAssistantRecoveryPackageAsync` 现在优先使用 `ClosedAt`，缺失时使用 `CreatedAt`，避免交付恢复包闭环回放按保存时刻重排。
- `ScheduleAgentService.UpsertAssistantAnomalyPackageAsync` 现在将 `AssistantAnomalyDispositionPackageDto.CreatedAt` 解析为 UTC 后写入 evidence，避免助手异常处置卡回放按保存时刻重排。
- `ScheduleAgentService.UpsertAssistantEngineeringConstraintPackageAsync` 现在将 `AssistantEngineeringConstraintPackageDto.CreatedAt` 解析为 UTC 后写入 evidence，避免助手工程约束包回放按保存时刻重排。
- `ScheduleAgentService.UpsertProductionAnomalyEventAsync` 现在将 `ProductionAnomalyEventDto.DetectedAt` 解析为 UTC 后写入 evidence，避免生产异常事件回放按保存时刻重排。
- `ScheduleAgentService.UpsertLaborReassignmentAsync` 现在将 `LaborReassignmentRecordDto.CreatedAt` 解析为 UTC 后写入 evidence，避免人力调拨证据回放按保存时刻重排。
- `ScheduleAgentService.UpsertLaborQualificationBlockAsync` 现在优先使用 `ReleasedAt`，缺失时使用 `CreatedAt`，避免人员资质阻断释放态回放按保存时刻重排。
- `ScheduleAgentService.UpsertBarcodeScanEvidenceAsync` 现在将 `BarcodeScanEvidenceRecordDto.CreatedAt` 解析为 UTC 后写入 evidence，避免扫码追溯回放按保存时刻重排。
- `ScheduleAgentService.UpsertQualityCapaClosureAsync` 现在将 `QualityCapaClosureDto.VerifiedAt` 解析为 UTC 后写入 evidence，避免质量 CAPA 闭环回放按保存时刻重排。
- `ScheduleAgentService.UpsertAgentConfigApprovalAsync` 现在优先使用 `DecidedAt`，缺失时使用 `SubmittedAt`，避免 Agent 配置审批回放按保存时刻重排。
- `ScheduleAgentService.RecommendAsync` 现在为 `ScheduleRequest` evidence 显式写入 `decision.CreatedAt`，避免 AddEvidenceLink 路径使用 `AgentEvidenceLink` 默认保存时刻。
- `ScheduleAgentService` 真实 evidence upsert 中 `CreatedAt = DateTime.UtcNow` 已清零；剩余 `DateTime.UtcNow` 位于 `WriteAuditAsync`，语义是审计记录写入时刻。
- `OperationServiceTests.ScanAsync_WhenCodeMatchesWorkOrder_ShouldCreateExecutionAndBindOperatorStation` 锁定扫码命中工单时会创建工序执行，并绑定操作员/工位。
- `OperationServiceTests.StartAsync_ShouldStartExecutionAndMoveCreatedWorkOrderToInProgress` 锁定工序开工会同步启动关联工单，保证后续完工上报能累加工单完成数。
- `OperationServiceTests.CompleteAsync_ShouldUpdateExecutionWorkOrderAndReportWithinUnitOfWork` 锁定完工在 `IUnitOfWork` 内更新工序执行、工单完成数和报工记录。
- `OperationService.StartAsync` 现在读取关联工单并在 `CanStart` 时调用 `Start()` + `UpdateAsync(..., ct)`；若工单已运行则不重复转换。
- `ProductionControllerTests.ProductionFlow_ShouldScanStartAndCompleteOperation` 通过真实 HTTP 端点覆盖扫码 → 开工 → 完工，并回查 `WorkOrders`、`OperationExecutions`、`OperationReports` 的 EF 持久化状态。
- `ProductionOperationRepositories_ShouldNotCommitInsideOperationUnitOfWork` 锁定生产报工链路相关仓储写方法不得内部 `SaveChangesAsync`，避免 `OperationService.CompleteAsync` 的 UoW 事务边界被提前提交打穿。
- `OperationRepository.AddExecutionAsync` / `UpdateExecutionAsync` / `AddReportAsync` 现在只向 `DbContext` 添加/更新实体并返回，不自提交。
- `WorkOrderRepository.UpdateAsync` 现在只更新跟踪状态并返回，不自提交；生产报工链路由 `EfUnitOfWork` 统一 `SaveChangesAsync`。
- `OperationService.ScanAsync` 的执行记录创建和绑定路径已包进 `IUnitOfWork.ExecuteAsync`，因此仓储去自提交后，扫码端点仍能落库。
- `OperationTransactionRepositoryTests.CompleteAsync_WhenReportWriteFails_ShouldRollbackExecutionAndWorkOrderUpdates` 使用 SQLite in-memory 关系型 provider 注入 `AddReportAsync` 失败，确认 `UpdateExecutionAsync` 已调用后异常仍会让工序状态、工单完成数和报工记录整体回滚。

## 剩余风险

- 当前实现是架构测试门禁 + PR 模板，不是编译期 Roslyn analyzer；开发者仍需运行架构测试并认真勾选模板。
- 本轮没有启动 API 进行人工读取日志格式，只验证编译和架构门禁。
- 多角色测试只覆盖测试认证 handler，不代表生产 JWT 已支持多角色 token；生产角色模型仍按现有 token claim 行为解释。
- 显式 collection 只保证 xUnit 调度层串行；共享数据库状态是否稳定仍依赖各测试自己的种子与清理策略。
- 6.4 仅验证性能测试隔离和当前阈值通过；尚未做多轮标准差统计，不能证明“集成测试运行时间稳定（标准差 < 10%）”整体验收项。
- E2E 运行仍输出 Node `DEP0180` deprecation warning，来自当前 Node/工具链组合；测试结果为通过，但工具链警告待后续 DX 清理。
- 6.6 目前覆盖 `auth` store、错误消息、offline demo mode、排产反馈同步、风险处置同步；计划中的“前端关键 store/composable 单测”仍可继续扩展到更多业务 store 或剩余 sync util。
- `npm install` 输出 `whatwg-encoding@3.1.1` deprecation warning，来源 `jsdom` 依赖链；当前不影响测试通过，但后续依赖升级需跟踪。
- `npm run build` 通过但仍输出 Node `DEP0180 fs.Stats constructor is deprecated`；该 warning 已知，不阻塞本轮，但应继续作为 DX 清理项。
- 根 CI 文件在 `C:\AIWorks\AIMes\.github\workflows\ci.yml`，该目录不是 git 仓库；本轮无法用 `git diff` 审计根 workflow，只做了内容读取和尾随空白扫描。
- 6.8 阈值是保守防倒退门槛，不是成熟覆盖率目标；后续应随着补测逐步提高，并在 GitHub Actions hosted runner 上实跑确认。
- 本地 Integration coverage 采样 240s 超时，不能证明根 CI 的 Unit + Integration 合并覆盖率门禁已在本机完整跑通。
- 计划中的“根目录补齐 README/CONTRIBUTING/LICENSE/SECURITY”本轮按 `v1` git 仓库根解释；外层 `C:\AIWorks\AIMes` 不是 git 仓库且仍没有顶层 README/LICENSE/CONTRIBUTING/SECURITY，若发布入口改为外层目录，需要单独决策。
- ADR 文档记录的是已采纳决策，不等于对应运行证据已经全部齐备；迁移实跑、灰度、安全签字和两周观察仍需独立证据。
- 本轮未创建 git tag；`CHANGELOG.md` 只记录流程，不代表 GitHub Release 自动化已实跑。
- 6.1 尚未覆盖全部缺测 AppService；本轮只完成 BOM 片。另需避免并行运行同一 .NET 输出目录的测试项目，否则会产生文件锁假失败。
- 6.1 尚未覆盖全部缺测 AppService；本轮完成 BOM 与 Anomaly 两片，`AuditLogAppService`、`KnowledgeAppService`、`RoutingAppService`、`DashboardKpiService` 等仍需继续补测。
- 6.1 尚未覆盖全部缺测 AppService；本轮完成 BOM、Anomaly、AuditLog 三片，`KnowledgeAppService`、`RoutingAppService`、`DashboardKpiService` 等仍需继续补测。
- `AuditEndpointFilter` 的审计写入属于业务事务外的访问/操作追踪路径；本轮只保证成功响应后的过滤器审计会落库，不把它等同于状态变更类内联事务审计。
- 6.1 尚未覆盖全部缺测 AppService；本轮完成 BOM、Anomaly、AuditLog、Routing 四片，`KnowledgeAppService`、`DashboardKpiService` 等仍需继续补测。
- `RoutingAppService.GetAllRoutesAsync` 仍是仓储全量读取后内存分页；本轮只用测试固定当前行为，后续若要对齐数据库分页需扩展 `IRoutingRepository`。
- 6.1 尚未覆盖全部缺测 AppService；本轮完成 BOM、Anomaly、AuditLog、Routing、Knowledge 五片，`DashboardKpiService` 等仍需继续补测。
- `KnowledgeAppService` 的 `_chatHistories` 仍是进程内字典；本轮只补测试和分块稳定性，不解决多副本/重启后的聊天历史持久化。
- 6.1 主要候选缺测 AppService 已覆盖到 BOM、Anomaly、AuditLog、Routing、Knowledge、DashboardKpi；仍需对照计划中的“9 个无测 AppService”逐项复核，确认是否还有未命名服务缺口。
- Dashboard `ScheduleAdherence` 使用 `DateTime.UtcNow` 作为参考时间；单测用相对当前时间构造数据降低时钟漂移风险，但未来若要更强确定性可注入 clock。
- `RiskAppService` 仍是 hardcoded demo 数据，`IsDemoData = true` 只是防误读标记；真实风险计算、数据源接入和端到端风险闭环仍不在本轮完成范围内。
- `ScheduleAgentService` 仍是大体量服务，目前 evidence CreatedAt 初始化已有架构门禁兜底，但其他 DTO query 反序列化和非时间字段映射仍需后续按风险分批覆盖。
- null-forgiving 门禁本轮只覆盖 `ScheduleAgentService`；`SchedulingContextProvider`、EF DbSet 访问和少数 endpoint 中仍存在历史 `!` 用法，需要单独评估是否为真实可消除风险。
- 新增跨文件 null-forgiving 门禁后，`SchedulingContextProvider` 与 `ReportEndpoints` 已纳入保护；EF DbSet 访问和其他历史 `!` 用法仍未统一清理。
- Admin 通知配置/刷新令牌仓储、Auth token claim、ExceptionMiddleware ProblemDetails.Status 与 Endpoint handler `default!` 已纳入 null-forgiving 门禁。
- 历史红灯：`SchedulingControllerTests` 全类曾失败 `20/61`，失败集中在 Scheduling evidence 审计断言和一个请求取消超时；本轮 Scheduling evidence audit 持久化修复后已重新验证 `61/61 passed`。
- `OperationService` 本轮覆盖扫码/开工/完工主链路和 InMemory API 正向链路；异常上报仍可继续补回归。
- `OperationTransactionRepositoryTests` 已补 SQLite 关系型 provider 回滚验证；仍不等同于 PostgreSQL/staging 上的外部依赖实跑证据。
- 前端 BOM 静态 demo 仍显示旧 `totalQuantity` 演示值；本轮只修后端应用层和基础设施层真实计算口径。
## Scheduling Evidence Audit 复核

- `ScheduleAgentService.WriteAuditAsync` 旧实现只把 `AuditLog` 加入 `DbContext` 跟踪集合，没有通过 UoW 提交；这会在 evidence repository 自提交成功时形成“证据已落库、审计缺失”的不一致状态。
- 本轮修复把 `WriteAuditAsync` 放入 `_unitOfWork.ExecuteAsync(...)`，并保持 `AuditLogRepository.AddAsync` 不自提交，符合当前仓储/UoW 分层约束。
- `ScheduleAgentServiceTests` 的 UoW mock 已补为执行传入委托，单测现在能覆盖审计 callback；避免以后 `WriteAuditAsync` 再次被事务包装时产生假阴性。
- 回归验证覆盖单条失败用例、`ScheduleAgentServiceTests` 全类、`SchedulingControllerTests` 全类与 `MES.Application` build；当前本地不再复现 Scheduling evidence 审计缺失。
- 剩余风险：本地通过仍不等同于 PostgreSQL/staging 外部依赖验证；发布前仍需按 release gate 跑远端 CI、灰度、安全签字和观察窗口。

## 6.6 Notifications Store 复核

- `notifications` store 是全局告警入口，之前未纳入前端单测；本轮用 SignalR mock 覆盖 critical quality alert 到浏览器通知的链路。
- 旧实现把通知 icon 固定为 `/favicon.ico`，与当前 `/scheduling/` base path 不一致；子路径部署下浏览器通知会引用根路径资源。
- 修复后通过 `appAssetPath('favicon.ico')` 生成 `/scheduling/favicon.ico`，与 offline demo asset path 工具保持同一口径。
- 验证：`notifications.store.test.ts` 单测通过，前端全量 `npm run test:unit` 通过，当前 Vitest 覆盖提升到 `6 files / 21 tests`。

## 6.6 Quality CAPA Sync 复核

- `quality-capa-sync` 是质量闭环回写和 OTD 证据链之间的关键桥接；旧状态没有单测覆盖本地 fallback 或 OTD 镜像契约。
- 旧 `readQualityCapaClosureBackendFirst` 没有 catch，后端查询失败时会 reject，破坏“backend-first 失败回退 localStorage”的 sync util 通用行为。
- 修复后后端失败会返回本地 `aimes_quality_capa_closure`，同时写入路径继续 best-effort 同步后端并镜像 `quality-capa` 到 OTD 证据链。
- 验证：`quality-capa-sync.test.ts` `3/3 passed`，前端全量 Vitest 提升到 `7 files / 24 tests passed`。

## 6.6 Equipment Risk Sync 复核

- `equipment-risk-sync` 为排产设备故障事件、客户故障样例和 POC/报告证据提供本地兜底；旧状态没有单测保护本地记录形状。
- 旧 `readEquipmentDowntimeEvent` 对 JSON 只解析不校验，不完整记录会进入排产事件列表，可能显示缺少影响工单、维护窗口或瓶颈保护策略的设备风险。
- 修复后 downtime 本地记录必须包含设备、停机、影响工单、替代设备、维护窗口、保护策略和事件时间；缺字段会 fail loud 地清理本地旧值。
- 验证：`equipment-risk-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `8 files / 29 tests passed`。

## 6.6 Shortage Risk Sync 复核

- `shortage-risk-sync` 负责 BOM 齐套包向缺料事件派生，是排产/库存/采购之间解释 OTD 风险的关键链路；旧状态没有单测覆盖派生字段契约。
- 旧 `writeBomKittingPackage` 只把当前 `workOrderNumber` 写入派生事件 `affectedOrders`，会丢失 summary 中的跨工单缺料影响。
- 修复后派生事件优先保留 `record.summary`，让排产齐套事件能解释“哪些工单同受缺料影响”，同时保留空 summary 回退工单号的兼容路径。
- 验证：`shortage-risk-sync.test.ts` `4/4 passed`，前端全量 Vitest 提升到 `9 files / 33 tests passed`。

## 6.6 Agent Config Approval Sync 复核

- `agent-config-approval-sync` 是 Agent 治理审批和质量推荐扩大门禁的前端缓存入口；旧状态缺少单测覆盖本地 override 的可信边界。
- 旧 `readOverrides` 解析失败后只返回空数组，不清理坏 JSON；同时只要本地对象有同名 `id` 就会合并，非法 `status` 会污染 `approvalStatusLabel` 和门禁策略判断。
- 修复后本地 override 必须有字符串 `id`，且若提供 `status` 必须是 `pending/reviewing/approved/rejected`；损坏 JSON 会 fail loud 地清理本地键。
- 验证：`agent-config-approval-sync.test.ts` `4/4 passed`，前端全量 Vitest 提升到 `10 files / 37 tests passed`，`npm run lint` 通过。

## 6.6 Risk SLA Review Sync 复核

- `risk-sla-review-sync` 是风险处置队列升级到晨会复核、再回写 OTD 证据链的关键桥接；旧状态没有单测覆盖写入、闭环和本地记录可信边界。
- 旧 `readRiskSlaReviewRecord` 对不完整对象只返回 `null`，但保留本地坏值；这会让风险看板每次读取都遇到同一条无法解释 `affectedOrders`、`traceId` 和责任动作的旧复核状态。
- 修复后结构不完整的本地复核记录会从 `localStorage` 清理，坏 JSON 与坏结构都不会长期污染风险晨会复核链路。
- 验证：`risk-sla-review-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `11 files / 42 tests passed`，`npm run lint` 通过。

## 6.6 Anomaly Dispatch Sync 复核

- `anomaly-dispatch-sync` 是异常管理向排产保护和 OTD 证据链传递责任分流结果的桥接；旧状态没有单测覆盖记录完整性、按类型读取或本地容量边界。
- 旧 `isRecord` 只要求 `id/anomalyId/type/title/traceId`，缺少 `owner`、`affectedOrders`、`suggestedAction`、`auditId` 等关键解释字段的记录仍会进入异常看板。
- 修复后异常分流本地记录必须包含三类合法类型和完整责任/影响/动作/审计字段；坏结构会被剔除，全部无效时清理本地键。
- 验证：`anomaly-dispatch-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `12 files / 47 tests passed`，`npm run lint` 通过。

## 6.6 Labor Assignment Sync 复核

- `labor-assignment-sync` 是人员资质阻断、替班放行和生产开工证据的桥接；旧状态没有单测覆盖阻断/替班互斥、释放链路和本地坏结构自清理。
- 旧读取逻辑会把不完整人员记录过滤成空数组，但保留原始坏 JSON 数组；这会让生产/人员看板每次读取都再次遇到无法解释资质风险或替班责任人的坏状态。
- 修复后人员替班与资质阻断的本地数组只要包含坏结构，就会写回有效记录或清理本地键，避免旧状态长期污染业务链路。
- 验证：`labor-assignment-sync.test.ts` `6/6 passed`，前端全量 Vitest 提升到 `13 files / 53 tests passed`，`npm run lint` 通过。

## 6.6 Barcode Scan Evidence Sync 复核

- `barcode-scan-evidence-sync` 是扫码追溯向生产报工、设备点检、物料齐套和 OTD 证据链传递现场确认的桥接；旧状态没有单测覆盖记录生成、后端 fallback 或本地坏结构自清理。
- 旧读取逻辑会把不完整扫码证据过滤为空数组，但保留原始坏数组；这会让执行看板重复遇到无法解释 trace 或下一核对点的旧扫码状态。
- 修复后扫码证据本地数组包含坏结构时会写回有效记录，全部无效时清理本地键，避免坏扫码状态长期污染执行证据链。
- 验证：`barcode-scan-evidence-sync.test.ts` `7/7 passed`，前端全量 Vitest 提升到 `14 files / 60 tests passed`，`npm run lint` 通过。

## 6.6 Production Anomaly Sync 复核

- `production-anomaly-sync` 是生产异常事件进入异常列表、详情和后端 evidence upsert 的入口；旧状态没有单测覆盖本地可信边界或 DTO 映射契约。
- 旧读取逻辑直接 `JSON.parse(raw) as ProductionAnomalyEvent`，坏 JSON 只返回 `null` 不清理，坏结构会进入生产看板并在后续映射中产生缺字段异常。
- 修复后生产异常事件必须包含工单、工序、设备、类型、严重度、检测信息和建议动作；坏 JSON 与坏结构都会清理本地键。
- 验证：`production-anomaly-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `15 files / 65 tests passed`，`npm run lint` 通过。

## 6.6 Monitoring Situation Escalation Sync 复核

- `monitoring-situation-escalation-sync` 是实时监控态势升级到跨模块处置包、风险队列和 OTD 证据链的桥接；旧状态没有单测覆盖闭环、容量边界和本地可信边界。
- 旧 `isMonitoringSituationEscalation` 只要求少量字段，缺少 owner、scheduleAction、riskImpact、otdImpact、statusLabel 等关键解释字段的记录仍会进入监控看板。
- 修复后现场处置包必须包含责任、排产、风险、OTD、审计、状态和创建时间字段；坏结构会被剔除并同步清理本地键。
- 验证：`monitoring-situation-escalation-sync.test.ts` `6/6 passed`，前端全量 Vitest 提升到 `16 files / 71 tests passed`，`npm run lint` 通过。

## 6.6 Assistant Action Audit 复核

- `assistant-action-audit` 是助手动作授权结果进入前端审计列表与后端 evidence upsert 的入口；旧状态没有单测覆盖 denied action、backend-first fallback 或本地可信边界。
- 旧读取逻辑只过滤 `id/actionId/auditCode`，缺少 `label/type/actor/role/resultMessage/permitted/createdAt` 的记录仍会进入审计面板，且坏 JSON 不会从 localStorage 清理。
- 修复后助手动作审计记录必须包含合法 action type 和完整权限解释字段；坏 JSON、非数组和坏结构会 fail loud 地清理或写回有效记录。
- 验证：`assistant-action-audit.test.ts` `6/6 passed`，前端全量 Vitest 提升到 `17 files / 77 tests passed`，`npm run lint` 通过。

## 6.6 Assistant Recovery Package Sync 复核

- `assistant-action-package-sync` 是聊天助手把交期恢复建议沉淀到排产、采购、质量和 OTD 证据链的桥接；旧状态没有单测覆盖闭环动作或本地可信边界。
- 旧 `isAssistantRecoveryPackage` 只要求 `id/title/auditCode/traceId/workOrders/dispatchSteps`，缺少责任人、角色、owner、排产动作、风险影响、OTD 影响和创建时间的记录仍会进入恢复包看板。
- 修复后交期恢复包必须包含完整责任、排产、风险、OTD 和 dispatch step 字段；坏结构会被剔除并同步清理本地键。
- 验证：`assistant-action-package-sync.test.ts` `6/6 passed`，前端全量 Vitest 提升到 `18 files / 83 tests passed`，`npm run lint` 通过。

## 6.6 Assistant Anomaly Card Sync 复核

- `assistant-anomaly-card-sync` 是聊天助手把异常创建意图沉淀到生产异常、风险分流、排产复核和 OTD 证据链的桥接；旧状态没有单测覆盖派生镜像和本地可信边界。
- 旧 `isAssistantAnomalyPackage` 只要求 `id/title/auditCode/traceId/dispatchSteps`，缺少责任人、角色、owner、交付影响、排产窗口和创建时间的记录仍会进入异常处置看板。
- 修复后助手异常处置包必须包含完整责任、异常、设备、交付影响、排产窗口和 dispatch step 字段；坏结构会被剔除并同步清理本地键。
- 验证：`assistant-anomaly-card-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `19 files / 88 tests passed`，`npm run lint` 通过。

## 6.6 Assistant Engineering Constraint Package Sync 复核

- `assistant-engineering-constraint-package-sync` 是聊天助手把 BOM 替代料、ECN、工艺能力和质量门约束沉淀到工程/工艺/OTD 证据链的桥接；旧状态没有单测覆盖依赖种子和本地可信边界。
- 旧 `isAssistantEngineeringConstraintPackage` 只要求 `id/title/auditCode/traceId/workOrders/dispatchSteps`，缺少责任人、角色、owner、BOM/ECN/route/operation、OTD 影响和创建时间的记录仍会进入工程约束看板。
- 修复后工程约束包必须包含完整责任、BOM、ECN、工艺路线、工序、OTD 和 dispatch step 字段；坏结构会被剔除并同步清理本地键。
- 验证：`assistant-engineering-constraint-package-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `20 files / 93 tests passed`，`npm run lint` 通过。

## 6.6 OTD KPI Commitment Sync 复核

- `otd-kpi-commitment-sync` 是报表 KPI 钻取转客户交付恢复承诺包并进入 OTD 证据链的桥接；旧状态没有单测覆盖 latest fallback 或本地可信边界。
- 旧 `isCommitmentPackage` 只要求 `id/sourceKpiId/targetName/auditId/traceId/actions`，缺少 OTD 数值、责任人、承诺说明、创建时间或 action 详情的记录仍会进入报表/聊天/排产看板。
- 修复后客户承诺包必须包含完整维度、OTD 数值、承诺、责任和 action 字段；坏结构会被剔除并同步清理本地键。
- 验证：`otd-kpi-commitment-sync.test.ts` `6/6 passed`，前端全量 Vitest 提升到 `21 files / 99 tests passed`，`npm run lint` 通过。

## 6.6 Outsourcing Commitment Sync 复核

- `outsourcing-commitment-sync` 是报表 KPI 钻取转外协承诺、采购到货确认、排产释放和 OTD 证据链的桥接；旧状态没有单测覆盖闭环动作或本地可信边界。
- 旧 `isCommitmentPackage` 只要求少量 ID、外协伙伴、承诺日期和 actions 数组，缺少 OTD 数值、责任人、承诺说明、创建时间或 action 详情的记录仍会进入报表/采购/排产看板。
- 修复后外协承诺包必须包含完整维度、OTD 数值、承诺、责任、外协伙伴、影响工单和 action 字段；坏结构会被剔除并同步清理本地键。
- 验证：`outsourcing-commitment-sync.test.ts` `7/7 passed`，前端全量 Vitest 提升到 `22 files / 106 tests passed`，`npm run lint` 通过。

## 6.6 OTD Evidence Chain Sync 复核

- `otd-evidence-chain-sync` 是前端所有 OTD 证据镜像的共享底座；旧状态没有单测覆盖本地可信边界和闭环匹配。
- 旧 `readRawEvidenceChain` 会过滤坏结构，但保留原始坏数组；所有依赖 OTD 证据链的看板后续仍会反复遇到同一个无法解释 trace、状态或来源的旧值。
- 修复后 OTD 证据链本地数组存在坏结构时会写回有效记录，全部无效或非数组时清理本地键，和上层 sync util 的 fail-loud 口径一致。
- 验证：`otd-evidence-chain-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `23 files / 111 tests passed`，`npm run lint` 通过。

## 6.6 Customer Order Import Sync 复核

- `customer-order-import-sync` 是客户真实工单样例进入知识上传、POC evidence governance 和报表证据的入口；旧状态没有单测覆盖后端空结果 fallback 或本地可信边界。
- 旧 `readCustomerOrderImportEvidence` 只要求 `batchId/fileName`，损坏 JSON 不清理，缺少来源、订单数、风险单数、映射字段或准备时间的不完整证据可能长期留在 localStorage。
- 修复后客户工单导入证据必须包含批次、文件名、来源、订单/风险数量、映射字段和准备时间；坏 JSON 与坏结构都会清理本地键，避免 POC/报表继续读取无法解释的样例状态。
- 验证：`customer-order-import-sync.test.ts` `4/4 passed`，前端全量 Vitest 提升到 `24 files / 115 tests passed`，`npm run lint` 通过。

## 6.6 Engineering Change Sync 复核

- `engineering-change-sync` 是 BOM 替代料、ECN 影响分析、工艺能力校验进入排产、聊天、审计回放和 OTD 证据链的桥接；旧状态没有单测覆盖三类本地证据的可信边界。
- 旧读取逻辑对替代料和工艺能力只要求少数字段；工程影响分析只要有 `changeId/traceId` 就会被默认值补齐，可能把无法解释责任、影响和审计来源的坏状态伪装成完整工程证据。
- 修复后三类工程证据都必须包含完整对象、责任、影响、审计、状态和时间字段；坏结构会 fail-loud 清理对应本地键，不再让默认值掩盖坏缓存。
- 验证：`engineering-change-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `25 files / 120 tests passed`，`npm run lint` 通过。

## 6.6 Knowledge Governance Sync 复核

- `knowledge-governance-sync` 是文档治理复核结果进入知识上传、审计回放、AI 引用和 OTD 证据链的桥接；旧状态没有单测覆盖本地数组坏结构自清理。
- 旧读取逻辑能过滤坏记录但保留原始 localStorage；混合数组会让坏复核记录反复出现，全坏数组会长期占用 `aimes_knowledge_governance_reviews`。
- 修复后知识治理复核数组会在过滤后同步写回有效记录，全部无效或非数组时清理本地键，和前端 evidence sync 的 fail-loud 口径一致。
- 验证：`knowledge-governance-sync.test.ts` `4/4 passed`，前端全量 Vitest 提升到 `26 files / 124 tests passed`，`npm run lint` 通过。

## 6.6 POC Hypercare Sync 复核

- `poc-hypercare-sync` 是 POC 首批真实工单试点后进入正式上线验收、生产概览、实时监控、报表 CSV、聊天问答和审计回放的桥接；旧状态没有单测覆盖本地可信边界。
- 旧读取逻辑只校验外层字段和数组存在，缺少验收门禁的坏记录会残留，缺少指标 evidence 或检查点 action 的子项也会进入看板。
- 修复后 Hypercare 验收记录必须包含完整外层验收字段、监控指标字段和检查点动作字段；坏结构会清理本地键，避免上线后稳定运行证据被不可解释的缓存污染。
- 验证：`poc-hypercare-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `27 files / 129 tests passed`，`npm run lint` 通过。

## 6.6 POC Pilot Run Sync 复核

- `poc-pilot-run-sync` 是 POC 上线交付包进入首批真实工单试点、生产报工、排产、报表和 Hypercare 的桥接；旧状态没有单测覆盖本地可信边界。
- 旧读取逻辑只校验外层字段和数组存在，缺少运行证据的坏记录会残留，缺少产品、路线、采纳决策或检查点 evidence 的子项也会进入看板。
- 修复后试点运行记录必须包含完整外层运行字段、每个真实工单字段和检查点字段；坏结构会清理本地键，避免首批真实工单证据被不可解释的缓存污染。
- 验证：`poc-pilot-run-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `28 files / 134 tests passed`，`npm run lint` 通过。

## 6.6 POC Review Signoff Sync 复核

- `poc-review-signoff-sync` 是 POC 评分复盘进入上线交付包、审计回放、报表和 OTD 证据链的入口；旧状态没有单测覆盖本地可信边界。
- 旧读取逻辑只要求 `meetingId/auditId`，坏 JSON 也不清理；缺少评分、签署人、复核人和证据批次的不完整签署记录仍会进入后续上线链路。
- 修复后复盘签署必须包含完整评分、签署、复核人、证据和摘要字段；坏缓存会清理本地键，避免 POC 通过状态被不可解释的记录伪造。
- 验证：`poc-review-signoff-sync.test.ts` `4/4 passed`，前端全量 Vitest 提升到 `29 files / 138 tests passed`，`npm run lint` 通过。

## 6.6 POC Rollout Package Sync 复核

- `poc-rollout-package-sync` 是 POC 复盘签署进入上线交付、首批真实工单试点、报表和聊天问答的桥接；旧状态没有单测覆盖本地可信边界。
- 旧读取逻辑只校验外层字段和 `actions` 数组存在，缺少上线门禁或责任人的坏记录会残留，缺少行动 owner/action/dueAt/evidence 的子项也会进入看板。
- 修复后上线交付包必须包含完整外层交付字段和每个行动项字段；坏结构会清理本地键，避免上线动作被不可解释的缓存污染。
- 验证：`poc-rollout-package-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `30 files / 143 tests passed`，`npm run lint` 通过。

## 6.6 Quality Rework Sync 复核

- `quality-rework-sync` 是质量检验返工结果进入交期影响、建议动作和证据链上下文的桥接；旧状态没有单测覆盖本地可信边界。
- 旧读取逻辑直接 `JSON.parse(raw) as QualityReworkImpact`，缺少产品、工序、设备、批次、缺陷数量、返工工时、根因或 evidence 的坏记录仍会进入质量/排产看板。
- 修复后返工影响记录必须包含完整检验、工单、产品、工序、设备、物料、批次、OTD、建议动作、根因、证据和创建时间字段；坏 JSON 与坏结构都会清理本地键。
- 验证：`quality-rework-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `31 files / 148 tests passed`，`npm run lint` 通过。

## 6.6 Quality MRB Disposition Sync 复核

- `quality-mrb-disposition-sync` 是质量 MRB 判定、报废补料、排产重建和客户 OTD 说明之间的桥接；旧状态没有单测覆盖本地可信边界或闭环 OTD 镜像。
- 旧读取逻辑直接强转 JSON，缺少处置类型、状态、责任、OTD/排产影响、审计 trace 或 action evidence 的坏记录仍会进入质量/排产/客户说明链路。
- 修复后 MRB 处置记录必须包含完整检验、工单、处置、状态、责任、影响、审计和 action 字段；坏 JSON 与坏结构都会清理本地键，闭环路径继续镜像 closed OTD 证据。
- 验证：`quality-mrb-disposition-sync.test.ts` `6/6 passed`，前端全量 Vitest 提升到 `32 files / 154 tests passed`，`npm run lint` 通过。

## 6.6 Quality Knowledge Sample Sync 复核

- `quality-knowledge-sample-sync` 是扫码质量样本、同类缺陷草案、低分复核、再训练和灰度决策进入知识治理与 OTD 证据链的核心桥接；旧状态缺少单测覆盖本地数组可信边界。
- 旧读取逻辑会过滤坏记录但保留原始 localStorage；混合坏数组会让质量面板、聊天、审计回放和报表反复遇到同一个不可解释的旧样本或复核记录。
- 修复后质量知识本地数组读取会在坏结构出现时写回有效记录，全部无效、非数组或坏 JSON 时清理本地键；灰度决策仍保留既有默认值补齐逻辑。
- 验证：`quality-knowledge-sample-sync.test.ts` `5/5 passed`，前端全量 Vitest 提升到 `33 files / 159 tests passed`，`npm run lint` 通过。

## 6.6 Customer Equipment Fault Evidence 复核

- 客户设备故障样例是 POC evidence governance、设备风险和排产事件联动的输入；旧状态只校验 `batchId/equipmentCode`，可信边界过松。
- 旧读取逻辑会接受缺少文件来源、样本数、影响工单、停机小时、采集信号和准备时间的不完整记录，导致 POC 证据清单无法说明“谁提供、影响什么、信号是什么”。
- 修复后客户设备故障证据必须包含完整来源、影响、信号和准备字段；坏 JSON 与坏结构都会清理本地键。
- 验证：`equipment-risk-sync.test.ts` `6/6 passed`，前端全量 Vitest 提升到 `33 files / 160 tests passed`，`npm run lint` 通过。

## 6.6 POC Evidence Governance / Customer Order Import 复核

- `poc-evidence-governance` 是客户工单导入与客户设备故障样例进入 Admin、审计回放和报表验收清单的聚合层；旧状态没有单测锁定聚合输出的审计字段。
- `customer-order-import-sync` 旧读取逻辑只要求 `mappedFields` 是数组，空数组也会进入 POC 证据清单，导致字段血缘无法审计。
- 修复后客户工单导入证据必须包含至少一个非空字段映射；POC 聚合单测锁定两类证据的 auditId、object、evidence 和 steps 输出。
- 验证：`customer-order-import-sync.test.ts` `5/5 passed`，`poc-evidence-governance.test.ts` `2/2 passed`，前端全量 Vitest 提升到 `34 files / 163 tests passed`，`npm run lint` 通过。

## 6.6 Customer Equipment Fault Signal Lineage 复核

- 客户设备故障样例的 `capturedSignals` 是 POC 证据清单解释遥测、点检和维修工单来源的关键字段；旧状态只要求它是数组。
- 旧读取逻辑会接受空信号数组，导致 POC governance 输出的 `evidence` 为空，审计回放无法说明设备故障样例来自哪些信号。
- 修复后客户设备故障证据必须包含至少一个非空采集信号；空数组或空信号项都会清理本地键。
- 验证：`equipment-risk-sync.test.ts` `7/7 passed`，前端全量 Vitest 提升到 `34 files / 164 tests passed`，`npm run lint` 通过。

## 6.6 Knowledge Citations / Quality Knowledge Evidence Lineage 复核

- `knowledge-citations` 是聊天助手把质量知识样本转换为可引用来源的入口；旧状态没有单测覆盖质量知识样本的证据数组为空时的降级行为。
- 旧读取逻辑只要求 `capaRecommendations/reuseTargets/evidenceTraceIds` 是数组，空数组样本会被接受，并让聊天引用链输出空 CAPA 推荐、空证据链和 `可引用` 状态。
- 修复后质量知识样本必须包含至少一个非空 CAPA 推荐、复用范围和证据 trace；坏样本会被 `readQualityKnowledgeSamples` 清理，聊天引用链保持“需复核”。
- 验证：`knowledge-citations.test.ts` `1/1 passed`，`quality-knowledge-sample-sync.test.ts` `5/5 passed`。

## 6.6 Gantt Mapper Conflict Window 复核

- `gantt-mapper` 是排产计划进入甘特图、冲突提示和拖拽防呆的核心纯工具；旧状态没有单测覆盖长任务覆盖多个短任务的冲突窗口。
- 旧 `detectConflicts` 只拿当前任务和前一个相邻任务比较，若前一个短任务已结束但更早的长任务仍未结束，后续任务会漏报冲突。
- 修复后同一设备内按开始时间排序时保留结束时间最晚的 active 任务，所有后续任务都和 active 结束时间比较，冲突说明仍指向造成覆盖的工单。
- 验证：`gantt-mapper.test.ts` `1/1 passed`。

## 6.6 Gantt Mapper Setup Time Lineage 复核

- 甘特图任务的 `setupMinutes` 用于展示换型准备时间和支持排产审计解释；旧状态只取 `setupTime` 中第一个数字。
- 旧解析会把 `1 小时 30 分钟` 视为 1 分钟，导致换型成本、任务说明和审计导出低估准备时间。
- 修复后 `parseSetupTime` 支持小时/分钟组合、英文 `h/min/m` 简写和原有纯数字分钟兜底。
- 验证：`gantt-mapper.test.ts` `2/2 passed`。

## 6.6 Gantt Mapper Conflict Marker Lineage 复核

- `planToGanttData` 被主排产板和 Pareto 对比视图共同使用；旧状态下冲突标记只由 `ScheduleBoard.markConflicts` 后处理追加，不在 mapper 输出中保留。
- 旧行为会让直接消费 mapper 输出的甘特图视图缺少 `hasConflict/conflictMessage`，即使同一设备时间重叠已经可被 `detectConflicts` 识别，也不会进入统一数据契约。
- 修复后 mapper 层统一写入冲突标记，所有使用 `planToGanttData` 的视图都能收到冲突审计字段。
- 验证：`gantt-mapper.test.ts` `3/3 passed`。

## 6.6 Gantt Mapper Dependency Link Dedup 复核

- 甘特图依赖链接是排产前后工序关系的可视化审计来源；旧状态只校验依赖项存在，不去重重复依赖 ID。
- 旧行为会把重复 `dependentItems` 映射成重复 link，导致同一依赖箭头重复渲染，依赖计数和审计导出也可能重复。
- 修复后 mapper 按 link id 去重，重复输入只保留一条依赖链接。
- 验证：`gantt-mapper.test.ts` `4/4 passed`。

## 6.6 Gantt Mapper Invalid Time Window 复核

- 甘特图任务为了可展示会把非正 duration 归一为最小宽度；旧状态没有同时保留数据异常信号。
- 旧行为会让结束早于开始的排产项看起来像一个极短任务，审计视图无法知道后端/导入数据存在时间窗口错误。
- 修复后异常时间窗口仍用 0.01 天展示，但任务会带 `hasConflict` 和明确冲突说明，便于所有甘特图消费者 fail-loud。
- 验证：`gantt-mapper.test.ts` `5/5 passed`。

## 6.6 Gantt Mapper Flat Task Invalid Time Window 复核

- `itemsToFlatTasks` 是不带设备分组的甘特任务映射入口，可能被轻量视图或导出链路复用；旧状态没有继承异常时间窗口标记。
- 旧行为会让 flat task 的结束早于开始问题继续被最小展示时长掩盖，与 `planToGanttData` 的冲突契约不一致。
- 修复后 flat task 同样带 `hasConflict/conflictMessage`，排产时间窗口异常在所有 mapper 输出中保持一致。
- 验证：`gantt-mapper.test.ts` `6/6 passed`。

## 6.6 Gantt Mapper Flat Task Setup Time Lineage 复核

- `itemsToFlatTasks` 输出不带设备分组的任务列表；旧状态没有携带 `setupMinutes`，而分组计划映射已经携带换型准备时间。
- 旧行为会让 flat task 消费方无法展示或导出换型时间，排产审计字段在两个 mapper 出口之间不一致。
- 修复后 flat task 复用同一个 `parseSetupTime`，小时/分钟组合也能保留为分钟数。
- 验证：`gantt-mapper.test.ts` `7/7 passed`。

## 6.6 Gantt Mapper Decimal Setup Time 复核

- 小数小时是排产准备时间常见录入格式；旧 `parseSetupTime` 的整数正则没有锚定数字边界，会把 `1.5 小时` 中的小数尾部误读成 `5 小时`。
- 旧行为会把 1.5 小时准备时间审计成 300 分钟，严重高估换型时间，影响甘特图说明、导出和后续排产解释。
- 修复后小时/分钟单位解析支持小数并统一换算为分钟，既覆盖中文单位，也保留英文 `h/min/m` 简写和纯数字分钟兜底。
- 验证：`gantt-mapper.test.ts` `8/8 passed`。

## 6.6 CSV Export Header Escaping 复核

- `exportToCsv` 被库存、员工、采购等列表导出复用；导出文件是运营复盘和审计留痕的证据载体。
- 旧实现只对数据行 cell 做 CSV 转义，表头直接拼接；当表头包含逗号、双引号或换行时，CSV 首行列数会漂移，审计人员看到的字段血缘不稳定。
- 修复后表头与数据行使用同一转义逻辑，避免 header 特殊字符破坏列结构。
- 验证：`export.test.ts` `1/1 passed`。

## 6.6 useExport CSV Header Escaping 复核

- `useExport.downloadCsv` 是排产计划和报表页面的 CSV 导出入口；这些文件通常直接用于交付复盘、KPI 审计和客户说明。
- 旧实现对数据行统一加引号，但表头直接拼接；排产/报表字段名一旦包含逗号、双引号或换行，导出首行会和数据行列结构不一致。
- 修复后 `downloadCsv` 的表头和数据行共用同一个转义函数，排产与报表导出的列结构和字段血缘保持稳定。
- 验证：`use-export.test.ts` `1/1 passed`。

## 6.6 Shortage BOM Kitting Package Item Guard 复核

- BOM 齐套包是缺料风险、采购加急和排产释放的前端证据入口；明细项需要能解释物料、数量、单位和动作。
- 旧读取边界只看外层少量 ID 字段，`items` 中缺少物料名称、数量、单位或处置动作的坏记录仍会进入缺料面板。
- 修复后读取本地 BOM 齐套包时校验外层字段和每个 item 的关键字段；不完整证据会 fail-loud 清理本地键。
- 验证：`shortage-risk-sync.test.ts` `5/5 passed`。

## 6.6 Shortage Resolution Guard 复核

- 缺料闭环记录用于说明物料到货、可用量恢复和受影响工单释放；字段缺失会让闭环证据无法解释“何时、多少、影响谁”。
- 旧读取逻辑直接强转 JSON，只有少数字段的不完整对象也会进入前端闭环面板。
- 修复后本地缺料闭环记录必须包含物料、订单、数量、单位、闭环时间和说明字段，坏结构会清理本地键。
- 验证：`shortage-risk-sync.test.ts` `6/6 passed`。

## 6.6 Auth Store Local User Cache Guard 复核

- `aimes_user` 是路由权限、聊天审计、扫码 actor 和 auth 启动态共同使用的身份缓存；解析规则分叉会让坏缓存反复污染不同入口。
- 旧 `auth` store 直接 `JSON.parse(aimes_user)`，坏 JSON 只被吞掉异常并返回未登录，但不会清理缓存；下一次启动仍会遇到同一坏身份证据。
- 修复后 auth 启动读取复用 `getLocalUser()`，坏 JSON 由共享解析器清理；登录态恢复还要求完整 `username/displayName/role/mustChangePassword`，避免半截缓存被拼成有效用户。
- 验证：`auth.store.test.ts` `4/4 passed`，`local-user.test.ts` `2/2 passed`。

## 6.6 Report Actor Local User Cache Guard 复核

- 报表 OTD KPI 承诺包和外协承诺包会把当前 actor 写入本地/后端证据；actor 来源必须和其他身份入口共享同一坏缓存清理规则。
- 旧 `ReportBoard.currentActor()` 私自读取并解析 `aimes_user`，坏 JSON 只 fallback 为 `report.viewer`，不会清理损坏缓存；身份解析规则继续和 auth/router/chat/scanner 分叉。
- 修复后报表 actor 使用 `getLocalUserReportActor()`，保留 username 优先的签名语义，同时继承共享解析器的坏 JSON 清理。
- 验证：`local-user.test.ts` `3/3 passed`；生产代码搜索确认 `ReportBoard.vue` 不再直读 `aimes_user`。

## 6.6 HTTP Refresh Response Guard 复核

- refresh token 是前端身份续期链路的核心入口；响应可信边界过松会把异常后端/代理响应固化进 localStorage 并污染后续请求。
- 旧 `performRefresh()` 直接把 `data.token` 和 `data.refreshToken` 写入本地存储；当 refresh 响应缺少 token 时，会把 `undefined` 用作新 Authorization header 并重试原请求。
- 修复后 refresh 响应必须包含非空 token 与 refreshToken；无效响应会走现有清理登录态和跳转登录路径，不再重试业务请求。
- 验证：`http-refresh.test.ts` `1/1 passed`，相邻身份测试 `auth.store.test.ts` 与 `local-user.test.ts` `7/7 passed`。

## 6.6 HTTP Refresh Retry Header Guard 复核

- 401 响应拦截器需要对异常 Axios config 边界 fail-safe；否则 refresh 成功也可能因为原请求对象缺少 headers 而被误判为续期失败。
- 旧实现直接 `config.headers.Authorization = ...`，当错误对象没有 headers 时抛异常，随后 catch 清空登录态并拒绝原请求。
- 修复后重试前会初始化 headers 对象，确保成功 refresh 后可以稳定带新 token 重放原请求。
- 验证：`http-refresh.test.ts` `2/2 passed`，相邻身份测试 `auth.store.test.ts` 与 `local-user.test.ts` `7/7 passed`。

## 6.6 HTTP Request Authorization Header Guard 复核

- 请求拦截器是所有业务 API 出口；它应当能处理没有 headers 对象的边界 config，而不是在附加 token 时中断请求。
- 旧实现直接 `config.headers.Authorization = ...`，如果调用方或测试传入的 config 没有 headers，则请求在发出前抛异常。
- 修复后请求拦截器和 refresh 重试路径都先初始化 headers，再写入 Authorization，身份链路的 token 注入边界一致。
- 验证：`http-refresh.test.ts` `3/3 passed`，相邻身份测试 `auth.store.test.ts` 与 `local-user.test.ts` `7/7 passed`。

## 6.6 HTTP / SignalR Access Token Shared Guard 复核

- `aimes_token` 同时服务 HTTP Authorization 和多个 SignalR hub；旧状态下 HTTP 与三个实时连接入口各自读取 localStorage，空白 token 会被 SignalR 当作字符串凭据送出。
- 修复后 `getLocalAccessToken()` 成为共享读取入口，统一把缺失或纯空白 token 解释为 `null`；SignalR 工厂继续按库接口回退为空字符串，但不再直接透传空白缓存。
- `api/http.ts` 保留 `TOKEN_KEY` 用于清理和 refresh 写入，只把请求注入路径切到共享 guard，避免扩大 refresh 行为变更。
- 验证：`auth-token.test.ts` `1/1 passed`，`http-refresh.test.ts` 与 `notifications.store.test.ts` 合计 `4/4 passed`。

## 6.6 Access Token Whitespace Normalization 复核

- token 缓存来自浏览器 localStorage，边界空白不是有效凭据内容；如果原样透传，HTTP 会生成带空格的 `Bearer` 值，SignalR 也会把不可解释的凭据交给 hub 握手。
- 修复后共享 token guard 统一做 trim，既保留正常 token，又避免空白污染所有复用该入口的 HTTP/实时连接路径。
- 验证：`auth-token.test.ts` `2/2 passed`，相邻 `http-refresh.test.ts` 与 `notifications.store.test.ts` 合计 `4/4 passed`。

## 6.6 Auth Boot / Router Token Guard 复核

- auth store 和 router guard 是浏览器刷新后的第一道身份边界；旧状态下它们直接检查 `localStorage.getItem('aimes_token')`，与 HTTP/SignalR 的共享 token guard 口径分叉。
- 修复后空白 token 不会恢复登录态，也不会通过受保护路由；有效 token 仍由共享 guard trim 后供启动链路使用。
- 搜索确认当前关键 token 注入/启动入口：HTTP、SignalR、auth store、router 均调用 `getLocalAccessToken()`。
- 验证：`router-auth.test.ts`、`auth.store.test.ts`、`auth-token.test.ts` 合计 `8/8 passed`。

## 6.6 Router Role Whitespace Normalization 复核

- 角色授权依赖前端缓存与后端角色名精确匹配；旧 `getLocalUserRole()` 只判断 trim 非空但返回原始值，`"  Admin  "` 会被 Admin-only 路由误拒。
- 修复后共享角色读取入口返回 trim 后的 role，让 router guard 使用标准化角色值，同时保留空白 role 拒绝语义。
- 验证：`local-user.test.ts` 覆盖共享角色归一化，`router-auth.test.ts` 覆盖 `/admin` 实际守卫路径，两者合计 `6/6 passed`。

## 6.6 Local User Actor Whitespace Normalization 复核

- displayName / username 会进入聊天、扫码、报表签名和审计 actor；旧共享读取入口只判断非空，返回值仍可能带边界空白，降低证据可读性和比对稳定性。
- 修复后本地身份 actor 输出统一 trim，保持 username 优先的报表签名语义，也保持空白字段回退语义。
- 验证：`local-user.test.ts` 覆盖 actor/displayName 归一化；相邻 `auth.store.test.ts` 与 `router-auth.test.ts` 合计 `12/12 passed`。

## 6.6 Auth Boot Cached Identity Normalization 复核

- auth store 启动恢复登录态使用 `getLocalUser()`，因此该共享读取入口必须返回可直接用于前端状态和权限判断的干净身份字段。
- 旧读取边界只解析 JSON，不归一化 `username/displayName/role`；即使 token 已 trim，恢复出的 `AuthUser` 仍可能带不可见边界空白。
- 修复后 `readCachedUser()` 在返回前统一 trim 非空字符串字段，并保留空白字段为 `undefined`；auth store 的完整字段校验会拒绝半截或空白身份缓存。
- 验证：`auth.store.test.ts` 覆盖启动恢复身份归一化；相邻 `local-user.test.ts` 与 `router-auth.test.ts` 合计 `13/13 passed`。
- 收尾验证：前端全量 Vitest `42 files / 199 tests passed`，ESLint `--max-warnings 0` 通过，touched-file `git diff --check` 仅有 LF/CRLF 提示且尾随空白扫描无命中。

## 6.6 HTTP Refresh Token Whitespace Normalization 复核

- refresh 响应是 access token 轮换链路的可信边界；即使响应字段非空，边界空白也不属于有效凭据内容。
- 旧实现只用 trim 判断 token 是否非空，随后原样持久化并返回给重试请求，导致本次 401 重放和后续 localStorage 缓存都可能带不可见空白。
- 修复后 `performRefresh()` 在写入 `aimes_token` / `aimes_refresh_token` 前统一 trim，并把归一化 access token 返回给 retry header。
- 验证：`http-refresh.test.ts` 覆盖 malformed refresh、缺 headers、成功 refresh 和 token 归一化；相邻 `auth-token.test.ts`、`auth.store.test.ts` 合计 `12/12 passed`。
- 收尾验证：前端全量 Vitest `42 files / 200 tests passed`，ESLint `--max-warnings 0` 通过。

## 6.6 Cached Refresh Token Whitespace Normalization 复核

- 旧 refresh token 缓存来自浏览器本地状态，和 access token 一样不应把边界空白解释为凭据内容。
- 旧实现只判断 `localStorage.getItem('aimes_refresh_token')` 是否存在，随后原样发送到 `/auth/refresh`；这会把缓存污染透传到认证端点。
- 修复后 refresh 请求体使用 trim 后的旧 refresh token；如果旧值为空白，走既有 refresh 失败清理登录态路径。
- 验证：`http-refresh.test.ts` 覆盖旧 refresh token 请求体归一化；相邻 `auth-token.test.ts`、`auth.store.test.ts` 合计 `13/13 passed`。
- 收尾验证：前端全量 Vitest `42 files / 201 tests passed`，ESLint `--max-warnings 0` 通过。

## 6.6 Backend Login Token Persistence Normalization 复核

- 后端登录响应是 token pair 进入浏览器状态的第一入口；如果这里原样持久化边界空白，后续 reload、HTTP 和 refresh 链路都要靠下游兜底。
- 旧实现直接把 `res.token` 放入 `AuthUser`，并把 `user.token` / `res.refreshToken` 原样写入 localStorage。
- 修复后登录成功路径和 `saveUser()` 都使用同一 token trim 规则，返回给 UI 的登录态和落盘凭据保持一致。
- 验证：`auth.store.test.ts` 覆盖后端登录 token pair 归一化；相邻 `http-refresh.test.ts`、`auth-token.test.ts` 合计 `14/14 passed`。
- 收尾验证：前端全量 Vitest `42 files / 202 tests passed`，ESLint `--max-warnings 0` 通过。

## 6.6 Frontend Unit Coverage CI Gate 复核

- 前端已有单测和 lint，但缺少 coverage 脚本与 CI step；这会让覆盖率阈值证据依赖人工本地执行，不能作为 PR/CI 门禁。
- 修复后 `test:unit:coverage` 使用 Vitest v8 coverage provider，并在 CI frontend job 的 unit tests 后执行，确保覆盖率阈值随 CI 运行。
- 当前阈值设为保守防倒退门槛：lines/statements/branches/functions 均为 10；本地实测总覆盖率 lines/statements `17.05%`、branches `69.79%`、functions `60.77%`。
- `frontend-ci-coverage.test.ts` 直接读取 `package.json` 和外层 CI workflow，防止后续删除 coverage script 或 CI step 时无声回退。
- 风险：10% 阈值只代表最低回归门槛，不代表覆盖率成熟；外部 GitHub Actions runner 尚未实跑，发布级 CI 证据仍缺。
- 验证：目标 coverage gate 单测通过，`npm run test:unit:coverage`、全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Frontend Coverage Threshold Raise 复核

- 继续把 coverage 门禁从“存在”推进到“更难倒退”：初始 10% 阈值过低，低于当前 lines/statements `17.05%` 太多，无法及时捕捉中等幅度回退。
- 修复后四个 Vitest coverage threshold 均为 `15`；branches/functions 当前余量较大，lines/statements 只留约 2.05 个百分点，能更早暴露覆盖率下降。
- `frontend-ci-coverage.test.ts` 不直接 import `vitest.config.ts`，而是读取配置文本；这是为了避免测试环境加载 Vite/esbuild config 时触发 TextEncoder/Uint8Array invariant 问题。
- 风险：15% 仍是防倒退线，不是成熟覆盖率；继续提升前应先补更多页面/组件级测试，避免门槛超过当前真实覆盖率。
- 验证：目标测试红绿已确认，`npm run test:unit:coverage` 在 15% 阈值下通过，全量单测和 lint 均通过。

## 6.6 Login Page Whitespace Credential Guard 复核

- 登录页是凭据进入前端 auth store 的第一入口；旧表单只用 `!username || !password` 禁用按钮，纯空白字符串会通过校验并进入登录链路。
- 修复后提交入口统一 trim 用户名和密码，空白凭据在组件边界被拒绝，既不调用 auth store，也不触发 `/dashboard` 跳转。
- 该修复与后端登录 token trim、auth store 缓存归一化形成一致边界：凭据输入和凭据持久化都不再默许不可见边界空白。
- 组件级测试让 `LoginPage.vue` 从 0 覆盖进入 coverage 门禁，当前该组件行覆盖为 `96.05%`，全局 lines/statements 提升到 `17.51%`。
- 风险：当前只覆盖空白提交拒绝路径；后续可继续补成功登录跳转、后端错误展示、loading/disabled 状态。
- 验证：目标组件测试、相邻 auth store、coverage、全量单测和 lint 均通过。

## 6.6 Login Page Whitespace Submit Button Guard 复核

- 空白凭据提交 guard 已能保护逻辑入口，但按钮仍可点击会给用户错误的可提交反馈，也增加脚本/键盘提交路径与视觉状态不一致的维护成本。
- 修复后按钮状态复用 trim 后有效性，空白输入时视觉层和逻辑层都拒绝提交；提交函数保留 guard，避免单靠 disabled 属性承担安全边界。
- 这是小范围 UI 行为修复，没有改变有效凭据登录路径；有效登录仍会 trim 后调用 auth store。
- 风险：登录页后端错误展示、loading 文案和成功跳转仍需要后续组件测试覆盖。
- 验证：目标组件测试红绿已确认，coverage、全量单测和 lint 均通过。

## 6.6 Toast Container Alert Semantics 复核

- Toast 是全局错误反馈入口；旧实现只靠图标和颜色表达严重性，屏幕阅读器无法把错误 toast 当作需要立即播报的 alert。
- 修复后错误 toast 暴露 `role="alert"` / `aria-live="assertive"`，非错误 toast 走 `status` / `polite`，符合不同通知紧急程度。
- 组件测试使用真实 `ToastContainer.vue` 渲染，断言 alert 内容包含标题和消息，避免只验证 class 而漏掉用户可感知语义。
- 该切片让 `ToastContainer.vue` 从 0 覆盖进入门禁，当前行覆盖 `100%`，全局 lines/statements 提升到 `17.70%`。
- 风险：目前只覆盖 error toast；后续可补 warning/info/success 的 polite status 语义和多 toast 顺序。
- 验证：目标组件测试、相邻通知 store、coverage、全量单测和 lint 均通过。

## 6.6 Toast Decorative Icon Semantics 复核

- Toast 图标只是对通知类型的视觉提示；标题、消息、role 和 live region 已经提供语义信息，图标不应被辅助技术重复播报。
- 旧状态下 `.toast-icon` 没有 `aria-hidden`，错误、成功等符号可能与 toast 正文一起形成冗余朗读。
- 修复后 `.toast-icon` 统一标记 `aria-hidden="true"`，保留视觉提示，同时让可访问名称聚焦在标题和消息上。
- 风险：warning/info/success 的 `role="status"` / `aria-live="polite"` 语义仍可补直接测试，多 toast 顺序也仍未覆盖。
- 验证：`toast-container.test.ts` `2/2 passed`，相邻 `notifications.store.test.ts` `1/1 passed`，coverage、全量单测和 lint 均通过。

## 6.6 Toast Atomic Live Region 复核

- Toast 是动态插入的全局反馈；live region 若不声明 atomic，辅助技术可能只播报局部变更，导致用户只听到标题或消息片段。
- 修复后每条 toast 都设置 `aria-atomic="true"`，让错误 alert 和非错误 status 都按完整通知播报。
- 组件测试覆盖 warning toast 的 `role="status"`、`aria-live="polite"` 和 `aria-atomic="true"`，补齐非错误 toast 的直接语义断言。
- 风险：多 toast 顺序、自动移除后的焦点/播报表现仍未用组件测试覆盖。
- 验证：目标测试红绿已确认，`toast-container.test.ts` `3/3 passed`，相邻通知 store、coverage、全量单测和 lint 均通过。

## 6.6 Login Page Error Alert Semantics 复核

- 登录页是身份入口；校验错误只作为视觉文本显示时，键盘或屏幕阅读器用户可能不知道提交被拒绝的原因。
- 修复后 `.login-error` 使用 `role="alert"` 与 `aria-live="assertive"`，空白凭据等即时校验错误会进入辅助技术播报路径。
- 成功登录路径也已由组件测试锁定：输入两端空白会 trim 后提交，成功后跳转 `/dashboard`；该断言是防回归，不是本次红灯来源。
- 风险：后端登录失败、loading 文案与按钮状态仍可继续补组件测试。
- 验证：目标测试红绿已确认，登录页测试 `4/4 passed`，相邻身份测试 `11/11 passed`，coverage、全量单测和 lint 均通过。

## 6.6 Login Page Busy Submit Semantics 复核

- 登录请求 pending 时，按钮禁用和文案变化能阻止重复提交并提示视觉状态；但缺少 `aria-busy` 时，辅助技术用户不能稳定获得“正在处理”语义。
- 修复后 submit button 在 loading 期间输出 `aria-busy="true"`，与现有 `disabled` 和 `登录中...` 文案保持一致。
- 测试通过 pending promise 控制登录请求停留在加载态，断言按钮文案、禁用状态和忙碌语义，覆盖真实组件路径。
- 风险：后端登录失败错误文案展示仍可补专门测试；当前只锁定加载中的按钮语义。
- 验证：目标测试红绿已确认，登录页测试 `5/5 passed`，相邻身份测试 `11/11 passed`，coverage、全量单测和 lint 均通过。

## 6.6 Login Page Error Field Association 复核

- 登录错误已有 alert/live region，但字段本身未声明 invalid，也未通过 `aria-describedby` 关联错误说明；屏幕阅读器在输入框上下文中可能无法知道哪个错误适用于哪个字段。
- 修复后错误 alert 有稳定 `login-error` id，用户名和密码输入框在错误存在时都指向该说明并标记 `aria-invalid="true"`。
- 该策略适用于当前表单级错误文案；后续若拆分字段级错误，可以再把 `aria-describedby` 分别指向字段级说明。
- 风险：后端登录失败目前也会让两个凭据字段同时 invalid；这符合当前“登录失败”表单级错误模型，但字段级错误仍未细分。
- 验证：目标测试红绿已确认，登录页测试 `6/6 passed`，相邻身份测试 `11/11 passed`，coverage、全量单测和 lint 均通过。

## 6.6 Login Page Failed Login Password Clear 复核

- 登录失败后保留用户名有助于用户修正密码，但保留失败密码会让敏感凭据继续停留在 DOM/input 状态中。
- 修复后失败路径显示后端/认证错误并保留用户名，同时清空密码字段且不触发 dashboard 跳转。
- 测试覆盖真实组件路径：mock auth store reject 后断言 alert 文案、用户名保留、密码清空和 router 未调用。
- 风险：失败后焦点位置尚未测试；后续可考虑把焦点移回密码框或错误提示。
- 验证：目标测试红绿已确认，登录页测试 `7/7 passed`，相邻身份测试 `11/11 passed`，coverage、全量单测和 lint 均通过。

## 6.6 Login Page Failed Login Focus Recovery 复核

- 登录失败清空密码后，用户的下一步通常是重新输入密码；旧状态下焦点回到 `body`，键盘用户需要重新定位到密码框。
- 修复后失败路径在清空密码并完成 DOM 更新后聚焦密码输入框，保留用户名和错误提示，降低重试成本。
- 测试把组件挂到 `document.body`，通过真实 DOM `activeElement` 断言焦点位置，并用 `finally` 卸载组件避免污染后续测试。
- 风险：当前焦点策略绑定表单级登录失败；若后续拆分字段级错误，需要重新评估用户名错误时是否仍应聚焦密码框。
- 验证：目标测试红绿已确认，登录页测试 `8/8 passed`，相邻身份测试 `11/11 passed`，coverage、全量单测和 lint 均通过。
