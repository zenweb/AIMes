# 2026-05-31 Sprint 6 Code Hygiene Issue

## 已关闭

- `MES.Api/Program.cs` 启动完成回调直接调用 `Console.WriteLine` 打印评估人横幅。
- 风险：生产服务绕过 `ILogger`，日志无法统一进入结构化管线、级别过滤、sink 和集中采集。
- Sprint 6 / 6.7 要求 PR 模板承接人工代码卫生检查，但仓库缺少 `.github/pull_request_template.md`。
- Sprint 6 / 6.2 要求 `TestAuthHandler` 支持多角色参数化；旧实现把多个 `X-Test-Role` 值合并为一个角色字符串，导致 Admin-only policy 无法识别其中的 `Admin`。
- Sprint 6 / 6.3 要求集成测试按 `[Collection]` 显式串行化；旧状态只有 assembly 级全局禁并行，新增测试类没有局部可见的串行约束。
- Sprint 6 / 6.4 要求 `PerformanceTests` 独立 DbContext + 独立种子；旧实现复用 `TestWebApplicationFactory`、`MES_Test_DB` 和通用 `TestDataSeedFilter`。
- Sprint 6 / 6.5 要求 E2E 全面替换 `waitForTimeout`；旧实现中 `dashboard.spec.ts`、`modules.spec.ts`、`demo-asset-capture.spec.ts` 仍存在固定等待。
- Sprint 6 / 6.6 要求前端关键 store/composable 单测；旧状态没有 `test:unit` 脚本，`vitest` 未安装，无法运行前端单测。
- 新增 Vitest 后测试环境暴露 `localStorage.clear is not a function`，说明 auth store 的浏览器状态依赖需要在单测中显式隔离。
- 扩展 offline demo 单测后暴露 Vitest 默认 `BASE_URL` 为 `/`，与 Nuxt `app.baseURL = '/scheduling/'` 不一致，导致 asset path 测试失败。
- 根 CI frontend job 未运行 `npm run test:unit`，前端单测只在本地可用，不能阻塞 PR。
- 新增风险处置同步单测后，直接 mock `riskEvidence` 未拦截动态 import 路径，导致 jsdom 触发真实 XHR 噪音并暴露测试隔离不足。
- Sprint 6 / 6.8 要求覆盖率低于阈值阻塞 PR；旧 CI 只生成/展示 cobertura 报告，不检查阈值。
- Sprint 6 / 6.9 要求补齐贡献与安全治理文档；旧状态缺少 `CONTRIBUTING.md` 与 `SECURITY.md`，README 文档索引也没有对应入口。
- Sprint 6 / 6.10 要求 ADR-010 和 ADR-001~006；旧状态没有 `_docs/_adr` 目录，关键 remediation 决策散落在计划、路线图和 changelog 中。
- Sprint 6 / 6.11 要求 VERSION、CHANGELOG 汇总和 git tag 流程；旧状态缺少 `VERSION`，`CHANGELOG.md` 没有当前 remediation 版本标记和 `v1.0.0` tag 门槛。
- Sprint 6 / 6.1 要求补齐无测 AppService；旧状态 `BomAppService` 没有单测，且齐套计算没有把 `LossRate` 纳入需求，可能低估缺料风险。
- BOM 损耗率修正若只停在 `BomAppService`，排产齐套链路仍会通过 `BomExplosionService` / `MaterialKittingChecker` 低估需求，形成 API 与排产预检口径分裂。
- Sprint 6 / 6.1 要求补齐无测 AppService；旧状态 `AnomalyAppService` 没有单测，且 `Severity` 只识别 PascalCase，`" critical "` 等真实 API 输入会被静默降级为 `Medium`。
- 审计首轮严重度修复时发现 `request.Severity.Trim()` 对显式 `null` 不安全，会把原先默认 `Medium` 的缺省语义变成空引用异常。
- Sprint 6 / 6.1 要求补齐无测 AppService；旧状态 `AuditLogAppService` 没有单测，列表摘要、详情 payload/hash、写入上下文缺少回归保护。
- `AuditEndpointFilter` 通过 `IAuditLogAppService.WriteAuditLogAsync` 写过滤器审计，但 `AuditLogRepository.AddAsync` 只 `Add` 不 `SaveChanges`；未被业务 UoW 包裹时，成功请求后的过滤器审计不会落库。
- Sprint 6 / 6.1 要求补齐无测 AppService；旧状态 `RoutingAppService` 没有单测，创建路线时步骤标准工时、设备类型、质检标记和参数没有写入领域对象。
- `ProcessRoute.AddStep` 旧实现按插入顺序重写 `StepSequence`，当请求步骤乱序时，详情页会按错误工艺顺序返回步骤。
- Sprint 6 / 6.1 要求补齐无测 AppService；旧状态 `KnowledgeAppService` 没有单测，知识查询、上传分块、聊天历史缺少回归保护。
- `KnowledgeAppService.SplitIntoChunks` 旧实现对空白/短文档会在 `position = end - overlap` 后回退到 0，导致循环不前进并卡住上传。
- Sprint 6 / 6.1 要求补齐无测 AppService；旧状态 `DashboardKpiService` 没有单测，Dashboard 排产达成率与 Report OTD 使用不同口径。
- `DashboardKpiService` 旧实现只以已完成工单为分母，未把已经到期但未完成的工单算入未准时交付，导致 Dashboard KPI 偏乐观。
- Sprint 6 / 6.1 要求补齐无测 AppService；旧状态 `RiskAppService` 没有单测，演示数据标记、计数汇总和前端字段契约缺少回归保护。
- `RiskAppService` 旧实现使用 `DateTime.Now` 生成面板时间，API 返回本地时区 `GeneratedAt`，跨时区前端和日志解释容易不一致。
- Sprint 6 / 6.1 要求补齐无测 AppService；旧状态 `ScheduleAgentService` 没有单测，调度 Agent 决策、跨域动作和权限拒绝审计缺少回归保护。
- `ScheduleAgentService.RecordPolicyRejectionAsync` 旧实现把默认拒绝原因写入 `AgentActionResult.Reason`，但审计 payload 仍是 `reason:null`，导致审计回放缺少拒绝原因。
- `ScheduleAgentService.UpsertRiskActionTraceAsync` 旧实现把 evidence `CreatedAt` 写成保存时刻；而查询按 `CreatedAt` 倒序，可能让风险处置证据回放顺序偏离前端/业务事件时间。
- `ScheduleAgentService.UpsertAssistantActionAuditAsync` 旧实现把 evidence `CreatedAt` 写成保存时刻；而查询按 `CreatedAt` 倒序，可能让助手动作审计回放顺序偏离前端动作发生时间。
- `ScheduleAgentService.UpsertAnomalyDispatchRecordAsync` 旧实现把 evidence `CreatedAt` 写成保存时刻；而查询按 `CreatedAt` 倒序，可能让异常分流回放顺序偏离前端分流事件时间。
- `ScheduleAgentService.UpsertMonitoringSituationEscalationAsync` 旧实现把 evidence `CreatedAt` 写成保存时刻；而前端闭环记录按 `ClosedAt` 镜像到 OTD 证据链，后端回放顺序可能偏离真实闭环时间。
- `ScheduleAgentService.UpsertRiskSlaReviewAsync` 旧实现把 evidence `CreatedAt` 写成保存时刻；而前端闭环记录按 `ClosedAt` 镜像到 OTD 证据链，后端回放顺序可能偏离真实晨会闭环时间。
- Sprint 6 / 6.1 要求补齐无测 Application service；旧状态 `OperationService` 没有单测，扫码、开工、完工主链路缺少回归保护。
- `OperationService.StartAsync` 旧实现只启动 `OperationExecution`，没有同步启动关联 `WorkOrder`；随后 `CompleteAsync` 调用 `workOrder.AddCompletedQuantity` 会要求工单已 `InProgress`，形成开工→完工断链。
- `OperationRepository` 与 `WorkOrderRepository.UpdateAsync` 旧实现内部调用 `SaveChangesAsync`；当 `OperationService.CompleteAsync` 依赖 `IUnitOfWork` 做工序执行、工单、报工原子提交时，仓储自提交会提前打穿事务边界。
- 仓储去自提交后，`OperationService.ScanAsync` 旧写法没有 UoW 包裹创建/绑定路径，导致扫码端点创建执行记录后不会落库。
- InMemory 正向链路无法证明 `OperationService.CompleteAsync` 在真实关系型事务下的回滚语义，需要关系型 provider 测试覆盖报工写入失败时的部分提交风险。

## 处理

- 新增 Sprint 6 代码卫生架构门禁，禁止 backend 源码直接调用 `Console.Write*`。
- 将启动横幅迁移为 `ILogger<Program>.LogInformation(...)`，保留原有运维可见信息。
- 新增 PR 模板，要求 reviewer 检查 `static List`、`Console.Write*`、`.Result`、`.Wait()` 并确认 `ArchitectureTests`。
- 新增 PR 模板架构门禁，防止模板缺失或遗漏 6.7 的关键人工检查项。
- 将 `TestAuthHandler` 的 `X-Test-Role` 解析改为多值/逗号分隔展开，并为每个角色写入独立 `ClaimTypes.Role`。
- 新增多角色授权集成测试，锁定 `Operator` + `Admin` 测试身份可通过 Admin policy。
- 新增 `IntegrationSerialCollection` 并为集成测试 `*Tests` 类标注 `[Collection("IntegrationSerial")]`。
- 新增架构门禁，防止后续新增集成测试类遗漏显式 serial collection。
- 新增 `PerformanceTestWebApplicationFactory`，使用独立 `Performance_Test_DB`。
- 新增 `PerformanceTestDataSeedFilter`，仅种性能测试所需的设备、管理员和配置数据。
- 新增性能测试隔离门禁，防止回退到共享 factory、共享 DB 或共享 seed filter。
- 将 E2E 固定等待替换为页面根元素、关键面板、关键文本的 Playwright auto-wait 断言。
- 新增 E2E 硬等待门禁，防止 `waitForTimeout` 回流。
- 新增 `vitest`、`@vue/test-utils`、`jsdom` 和 `test:unit`，并提交 lockfile 解析结果。
- 新增 `vitest.config.ts`，统一前端单测入口和 jsdom 环境。
- 新增 `auth.store.test.ts`，用内存 `localStorage` 隔离测试状态，覆盖后端登录持久化、离线 demo 登录和响应式登出。
- 新增 `error-message.test.ts`，覆盖错误消息提取顺序和 fallback。
- 新增 `offline-demo-mode.test.ts`，覆盖 demo mode、离线错误、日志抑制和 base asset path。
- 新增 `schedule-feedback-sync.test.ts`，覆盖排产反馈 localStorage snapshot、OTD 证据链镜像、坏 JSON 自清理和不完整 snapshot 忽略。
- 新增 `risk-action-sync.test.ts`，覆盖风险处置 localStorage trace、OTD 证据链镜像、best-effort backend sync、backend-first fallback、去重、截断和坏 JSON 自清理。
- 将风险处置单测 mock 层下沉到 `api/http`，避免 jsdom 单测误发 XHR。
- 抽出 `test-storage.ts`，统一内存 `localStorage` 测试夹具。
- `vitest.config.ts` 设置 `base: '/scheduling/'`，对齐 Nuxt base URL。
- 根 CI frontend job 在 build 前新增 `npm run test:unit`。
- 新增 `check-cobertura-threshold.ps1`，对 Cobertura line / branch 覆盖率做加权汇总并在低于阈值时失败。
- 根 CI backend job 在 coverage 生成后新增 Coverage Threshold step，当前阈值为 line `10%` / branch `20%`。
- 扩展 ESLint 范围，让 `tests/unit` 和 `vitest.config.ts` 进入 `npm run lint`。
- 新增 `CONTRIBUTING.md`，把 issue-first 协作、PR 要求、本地检查、代码规则和 `_docs` 记录要求写成仓库入口文档。
- 新增 `SECURITY.md`，把私下漏洞报告、支持版本、严重度分级、安全基线和披露策略写成仓库入口文档。
- `README.md` 文档索引新增 `CONTRIBUTING.md` 与 `SECURITY.md`。
- 新增 `_docs/_adr/ADR-001` 至 `ADR-006`，分别记录生产迁移、发布分层、审计分层、UoW 边界、架构门禁、AI 辅助安全合规审查决策。
- 新增 `_docs/_adr/ADR-010-cc-remediation-audit-decisions.md`，汇总 CC remediation 审计决策。
- 新增 `VERSION`，当前值为 `0.1.0-remediation.20260531`。
- `CHANGELOG.md` 新增 `Release Process`，记录 `v1.0.0` tag 前置门槛、命令和 GitHub Release 证据要求。
- `CHANGELOG.md` 的 `Unreleased` 段汇总治理文档、ADR、版本文件和发布流程变更。
- 新增 `BomAppServiceTests`，覆盖仓储分页、多层 BOM 累计展开和含损耗率齐套需求。
- `BomAppService` 的展开累计需求加入 `LossRate` 系数，齐套检查复用该需求量计算短缺。
- 新增基础设施层损耗率测试，覆盖 `BomExplosionService` 输出含损耗需求与 `MaterialKittingChecker` 按含损耗需求判缺料。
- `BomExplosionService` 在源头将 `LossRate` 纳入 `BomRequirementSummary.QuantityPerUnit`。
- 新增 `AnomalyAppServiceTests`，覆盖严重度归一化、空严重度默认值、开放异常仓储分页/CT 传播、AI 分析建议优先级映射。
- `AnomalyAppService.CreateAnomalyAsync` 改为 null-safe trim + 不区分大小写解析严重度，未知/空值仍默认 `Medium`。
- 新增 `AuditLogAppServiceTests`，覆盖审计列表摘要、详情 payload/hash、写入上下文和发起方。
- 新增员工创建审计落库集成回归，复现并锁定 `AuditEndpointFilter` 写入后必须持久化。
- `AuditEndpointFilter` 调用 `IUnitOfWork.ExecuteAsync` 包裹过滤器审计写入，由 UoW 统一保存，且仍不直接依赖 `DbContext`。
- 新增 `RoutingAppServiceTests`，覆盖路线创建步骤工时/设备/质检/参数保真、按编码查询步骤排序、列表分页元数据。
- `RoutingAppService.CreateRouteAsync` 创建 `RoutingStep` 后写入标准工时、设备类型、质检标记和参数。
- `RoutingStep` 新增领域行为 `ConfigureStandards` / `AddParameter`；`ProcessRoute.AddStep` 保留请求序号并排序集合。
- 新增 `KnowledgeAppServiceTests`，覆盖知识查询检索与会话历史、空白文档跳过、文档上传分类元数据。
- `KnowledgeAppService.UploadDocumentAsync` 对空白文档返回 `Skipped`，跳过 embedding 和 upsert。
- `KnowledgeAppService.SplitIntoChunks` 过滤空白 chunk，并在到达文末时退出循环。
- 新增 `DashboardKpiServiceTests`，覆盖 OTD 分母口径、设备/质量/物料告警映射和仓储 CT 传播。
- `DashboardKpiService` 复用 `ProductionKpiCalculator.CalculateOnTimeRate`，统一 Dashboard 与 Report 的 OTD 计算。
- 新增 `RiskAppServiceTests`，覆盖演示数据标记、UTC 生成时间、四类风险计数汇总和前端消费字段契约。
- `RiskAppService.GetRiskDashboardAsync` 改为使用 `DateTime.UtcNow` 生成面板时间。
- 新增 `ScheduleAgentServiceTests`，覆盖最近调度决策查询映射、决策缺失时跨域动作失败不落孤儿审计、策略拒绝 fallback 审计留痕。
- `ScheduleAgentService.RecordPolicyRejectionAsync` 统一计算 `rejectionReason`，并把同一个拒绝原因写入动作结果和审计 payload。
- 新增 `ScheduleAgentServiceTests.UpsertRiskActionTraceAsync_ShouldPersistEventTimestampForEvidenceOrdering`，覆盖风险处置 trace evidence key、审计字段和事件时间排序语义。
- `ScheduleAgentService.UpsertRiskActionTraceAsync` 将 `RiskActionTraceDto.CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertAssistantActionAuditAsync_ShouldPersistEventTimestampForEvidenceOrdering`，覆盖助手动作审计 evidence key、审计字段和动作时间排序语义。
- `ScheduleAgentService.UpsertAssistantActionAuditAsync` 将 `AssistantActionAuditRecordDto.CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertAnomalyDispatchRecordAsync_ShouldPersistEventTimestampForEvidenceOrdering`，覆盖异常分流 evidence key、审计字段和分流事件时间排序语义。
- `ScheduleAgentService.UpsertAnomalyDispatchRecordAsync` 将 `AnomalyDispatchRecordDto.CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertMonitoringSituationEscalationAsync_ShouldPersistClosedTimestampForEvidenceOrdering`，覆盖现场态势升级 evidence key、审计字段和闭环事件时间排序语义。
- `ScheduleAgentService.UpsertMonitoringSituationEscalationAsync` 将 `MonitoringSituationEscalationDto.ClosedAt ?? CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertRiskSlaReviewAsync_ShouldPersistClosedTimestampForEvidenceOrdering`，覆盖风险 SLA 复核 evidence key、审计字段和闭环事件时间排序语义。
- `ScheduleAgentService.UpsertRiskSlaReviewAsync` 将 `RiskSlaReviewRecordDto.ClosedAt ?? CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertAssistantRecoveryPackageAsync_ShouldPersistClosedTimestampForEvidenceOrdering`，覆盖交付恢复包 evidence key、审计字段和闭环事件时间排序语义。
- `ScheduleAgentService.UpsertAssistantRecoveryPackageAsync` 将 `AssistantRecoveryPackageDto.ClosedAt ?? CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertAssistantAnomalyPackageAsync_ShouldPersistEventTimestampForEvidenceOrdering`，覆盖助手异常处置包 evidence key、审计字段和创建事件时间排序语义。
- `ScheduleAgentService.UpsertAssistantAnomalyPackageAsync` 将 `AssistantAnomalyDispositionPackageDto.CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertAssistantEngineeringConstraintPackageAsync_ShouldPersistEventTimestampForEvidenceOrdering`，覆盖助手工程约束包 evidence key、审计字段和创建事件时间排序语义。
- `ScheduleAgentService.UpsertAssistantEngineeringConstraintPackageAsync` 将 `AssistantEngineeringConstraintPackageDto.CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertProductionAnomalyEventAsync_ShouldPersistDetectedTimestampForEvidenceOrdering`，覆盖生产异常事件 evidence key、审计字段和发现事件时间排序语义。
- `ScheduleAgentService.UpsertProductionAnomalyEventAsync` 将 `ProductionAnomalyEventDto.DetectedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertLaborReassignmentAsync_ShouldPersistEventTimestampForEvidenceOrdering`，覆盖人力调拨 evidence key、审计字段和调拨事件时间排序语义。
- `ScheduleAgentService.UpsertLaborReassignmentAsync` 将 `LaborReassignmentRecordDto.CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertLaborQualificationBlockAsync_ShouldPersistReleasedTimestampForEvidenceOrdering`，覆盖人员资质阻断 evidence key、审计字段和释放事件时间排序语义。
- `ScheduleAgentService.UpsertLaborQualificationBlockAsync` 将 `LaborQualificationBlockRecordDto.ReleasedAt ?? CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertBarcodeScanEvidenceAsync_ShouldPersistEventTimestampForEvidenceOrdering`，覆盖扫码追溯 evidence key、审计字段和扫码事件时间排序语义。
- `ScheduleAgentService.UpsertBarcodeScanEvidenceAsync` 将 `BarcodeScanEvidenceRecordDto.CreatedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertQualityCapaClosureAsync_ShouldPersistVerifiedTimestampForEvidenceOrdering`，覆盖质量 CAPA 闭环 evidence key、审计字段和验证事件时间排序语义。
- `ScheduleAgentService.UpsertQualityCapaClosureAsync` 将 `QualityCapaClosureDto.VerifiedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.UpsertAgentConfigApprovalAsync_ShouldPersistDecisionTimestampForEvidenceOrdering`，覆盖 Agent 配置审批 evidence key、审计字段和决策事件时间排序语义。
- `ScheduleAgentService.UpsertAgentConfigApprovalAsync` 将 `AgentConfigApprovalRecordDto.DecidedAt ?? SubmittedAt` 解析为 UTC 写入 `AgentEvidenceLink.CreatedAt`，解析失败时才回退当前时间。
- 新增 `ScheduleAgentServiceTests.RecommendAsync_ShouldPersistScheduleRequestEvidenceWithDecisionTimestamp`，覆盖 Agent 推荐 `ScheduleRequest` evidence key、decision 关联和推荐决策时间排序语义。
- `ScheduleAgentService.RecommendAsync` 为 `ScheduleRequest` evidence 显式写入 `AgentDecision.CreatedAt`，避免 `AgentEvidenceLink` 默认构造时刻污染回放排序。
- `ScheduleAgentService` 真实 evidence upsert 中 `CreatedAt = DateTime.UtcNow` 已清零；剩余 `DateTime.UtcNow` 属于 `WriteAuditAsync` 审计写入时刻。
- 新增 `Sprint6ScheduleAgentEvidenceLinks_ShouldSetBusinessEventTimestamp` 架构门禁，扫描 `ScheduleAgentService` 中所有 `new AgentEvidenceLink` 初始化块，要求显式写入业务事件 `CreatedAt` 并禁止保存时刻回流。
- `ScheduleAgentService` 查询映射链路旧写法使用 `.Where(item => item is not null).Select(item => item!)` 压制 nullable warning，违反项目禁用 `!` 压制规则。
- 新增 `QueryRiskActionTracesAsync_ShouldSkipInvalidEvidenceAndUseDefaultTake`，锁定坏 JSON evidence 跳过和默认查询上限。
- 新增 `Sprint6ScheduleAgentService_ShouldNotUseNullForgivingOperator`，并把 `ScheduleAgentService` 查询映射链路改为 `WhereNotNull(...)` helper，移除 `item!`。
- `SchedulingContextProvider` 旧写法使用 `RouteCode!` 收集 route code；`ReportEndpoints` 旧写法使用 `ActualEndDate!` 聚合日生产报表，均违反项目禁用 `!` 压制规则。
- 新增 `Sprint6CriticalBackendFiles_ShouldNotUseNullForgivingOperator`，并将 route code 与 daily output 聚合改为可空安全投影。
- `NotificationConfigRepository` 与 `RefreshTokenRepository` 旧写法对非空 DbSet 属性继续使用 `NotificationConfigs!` / `RefreshTokens!`，属于无必要 null-forgiving 压制。
- 新增 `Sprint6AdminTokenRepositories_ShouldNotUseNullForgivingOperator`，并移除通知配置/刷新令牌仓储中的 DbSet `!`。
- `AuthEndpoints.LoginAsync` 旧写法在 `IAuthService.ValidateAsync` 返回成功后仍用 `role!` / `displayName!` 签发 token 和响应；如果认证数据异常为空，会绕过 nullable 保护并生成不完整身份 claim。
- 新增 `Sprint6AuthEndpoints_ShouldNotUseNullForgivingForTokenClaims`，并在登录成功路径显式收窄 `role` 与 `displayName`，缺失时返回 Unauthorized 而不是签发 token。
- `ExceptionMiddleware` 旧写法使用 `problem.Status!.Value` 写响应状态码；虽然当前 switch 分支都会设置状态码，但该写法绕过项目禁用 `!` 压制规则，未来新增分支时也不够 fail loud。
- 新增 `Sprint6ExceptionMiddleware_ShouldNotUseNullForgivingForProblemStatus`，并将状态码读取改为显式 `problemStatus` 变量；若未来遗漏设置 `ProblemDetails.Status`，会抛出明确异常。
- 多个 Minimal API handler 因可选 query 参数排在 DI 服务参数前，旧写法使用 `= default!` 满足 C# 参数顺序；这仍违反项目禁用 null-forgiving 压制规则。
- 新增 `Sprint6EndpointHandlers_ShouldNotUseDefaultNullForgivingParameters`，并通过重排 handler 参数移除 Endpoint `default!`；路由/query 契约保持按名称绑定。
- 新增 `OperationServiceTests`，覆盖扫码创建工序执行并绑定人员/工位、开工同步关联工单、完工 UoW 内更新执行/工单/报工。
- `OperationService.StartAsync` 在工序执行开工后读取关联工单，若 `CanStart` 则调用 `Start()` 并通过 `UpdateAsync(..., ct)` 保存。
- 新增 `ProductionControllerTests.ProductionFlow_ShouldScanStartAndCompleteOperation`，通过端点验证扫码、开工、完工后 EF 中的工单完成数、工序状态和报工物料消耗。
- 新增 `ProductionOperationRepositories_ShouldNotCommitInsideOperationUnitOfWork` 架构门禁，锁定生产报工链路相关仓储写方法不自提交。
- `OperationRepository.AddExecutionAsync` / `UpdateExecutionAsync` / `AddReportAsync` 与 `WorkOrderRepository.UpdateAsync` 移除内部 `SaveChangesAsync`。
- `OperationService.ScanAsync` 的执行记录创建和绑定写路径改为通过 `IUnitOfWork.ExecuteAsync` 提交。
- 新增 `OperationTransactionRepositoryTests.CompleteAsync_WhenReportWriteFails_ShouldRollbackExecutionAndWorkOrderUpdates`，用 SQLite in-memory 关系型 provider 和失败仓储装饰器验证报工写入失败时执行记录、工单完成数与报工记录整体回滚。

## 待跟踪

- 后续如需要更强门禁，可将 `static List`、`.Result`、`.Wait()`、`Console.Write*` 从架构测试/PR 模板升级为 Roslyn analyzer 或 CI 专用 analyzer。
- 需要在真实部署/灰度环境确认日志 sink 能采集新的启动信息。
- 若生产需要真实多角色用户，应另行审计 JWT 签发、解析和前端角色模型；本轮只修测试基础设施。
- 后续仍需衡量集成测试运行时间标准差是否小于 10%；本轮只完成显式串行化结构，不宣称稳定性指标已达标。
- 性能阈值仍是当前测试内硬编码阈值；若 CI 机器波动较大，后续需要改 benchmark/采样策略，而不是简单放宽阈值。
- `npm run test:e2e` 仍会输出 Node `DEP0180` deprecation warning；本轮未升级 Node 或 Playwright 依赖。
- 6.6 仍未覆盖所有关键 store/composable，尤其是剩余多个 localStorage sync util 和业务 store。
- 根 CI 仅做文件接入，本轮未在 GitHub Actions hosted runner 实跑。
- 6.8 当前阈值偏保守，只能防止显著倒退；还不能代表覆盖率质量已经达成最终目标。
- 本地 Integration coverage 采样 240s 超时；需要在 CI runner 或更长本地窗口验证完整合并 coverage 门禁。
- `npm install` 出现 `whatwg-encoding@3.1.1` deprecation warning；当前不影响 Vitest 运行，后续依赖维护时处理。
- `npm run build` 仍输出 Node `DEP0180 fs.Stats constructor is deprecated`；构建通过，但 CI 日志仍有 DX 噪音。
- 6.9 的“根目录”当前按 `v1` git 仓库根处理；外层 `C:\AIWorks\AIMes` 不是 git 仓库，是否也需要面向 GitHub 首页放置治理文档仍需发布入口决策。
- ADR 是决策记录，不替代实施证据；其中涉及的迁移实跑、安全签字、灰度和观察窗口仍必须单独补齐。
- 本轮没有创建 `v1.0.0` tag，也没有 GitHub Release 实跑证据；发布仍需等 release gate 全部满足。
- 6.1 仍未完成全部 9 个无测 AppService 的 3 条单测要求；BOM 片只是其中一片。
- 6.1 仍未完成全部 9 个无测 AppService 的 3 条单测要求；BOM 与 Anomaly 已补，`AuditLogAppService`、`KnowledgeAppService`、`RoutingAppService`、`DashboardKpiService` 等仍待推进。
- 6.1 仍未完成全部 9 个无测 AppService 的 3 条单测要求；BOM、Anomaly、AuditLog 已补，`KnowledgeAppService`、`RoutingAppService`、`DashboardKpiService` 等仍待推进。
- 过滤器审计本轮只覆盖 Employee 创建这一条代表路径；其他挂载 `AuditEndpointFilter` 的模块还缺端到端落库回归。
- 6.1 仍未完成全部 9 个无测 AppService 的 3 条单测要求；BOM、Anomaly、AuditLog、Routing 已补，`KnowledgeAppService`、`DashboardKpiService` 等仍待推进。
- `RoutingAppService.GetAllRoutesAsync` 仍是全量读取后内存分页；当前已记录为后续分页改造候选。
- 6.1 仍未完成全部 9 个无测 AppService 的 3 条单测要求；BOM、Anomaly、AuditLog、Routing、Knowledge 已补，`DashboardKpiService` 等仍待推进。
- `KnowledgeAppService` 聊天历史仍是进程内状态；重启/多副本场景下会丢失或不一致，后续若进入生产知识助手路径需单独治理。
- 6.1 仍需对照原“9 个无测 AppService”清单复核是否全覆盖；当前已补 BOM、Anomaly、AuditLog、Routing、Knowledge、DashboardKpi。
- Dashboard KPI 当前仍直接使用 `DateTime.UtcNow`，未来若出现边界时间 flaky，应引入 clock 抽象。
- `RiskAppService` 当前仍是演示数据服务，`IsDemoData = true` 不能替代真实风险计算、数据源接入或业务闭环验证。
- `ExportAppService` 在 Application 层当前只是接口；若需要导出测试，应面向 Infrastructure 的 ClosedXML/QuestPDF 实现单独设计，避免把接口当作 AppService 行为测试目标。
- `ScheduleAgentService` 的 evidence CreatedAt 初始化已有架构门禁兜底；其他 DTO 映射、query 反序列化和非时间字段契约仍需继续分批补测。
- null-forgiving 清理本轮只覆盖 `ScheduleAgentService`；其他文件中的历史 `!` 用法仍需逐项判断是否可安全消除。
- `SchedulingContextProvider` 与 `ReportEndpoints` 已纳入 null-forgiving 门禁；其他文件中的历史 `!` 用法仍需逐项判断是否可安全消除。
- `NotificationConfigRepository`、`RefreshTokenRepository`、Auth token claim、ExceptionMiddleware ProblemDetails.Status 与 Endpoint handler `default!` 已纳入 null-forgiving 门禁；后端生产代码 `identifier!` / `default!` 扫描已无命中。
- 历史红灯：`SchedulingControllerTests` 全类曾失败 `20/61`，其中多项是 Scheduling evidence 审计记录缺失断言，另有请求取消超时；本轮已按系统化调试定位到 audit 未通过 UoW 提交，并重新验证 `61/61 passed`。
- `OperationService` 位于 Application Services 目录但不是 `*AppService`；本轮已按实际业务服务纳入补测，并补了 InMemory Production API 正向集成回归。
- 本轮已补 SQLite 关系型 provider 回滚测试证明 `CompleteAsync` 的事务原子性；后续仍需 PostgreSQL/staging 环境实跑作为发布证据。
- 并行运行同一输出目录下的 .NET 测试项目会触发文件锁；后续本地验证需串行执行。
- 前端 BOM 静态 demo 数据仍可能显示未含损耗的 `totalQuantity`；如要对外演示损耗率口径，需要单独同步前端静态样例。
## Scheduling Evidence Audit 未提交

- 问题：`SchedulingControllerTests.EquipmentEvidenceApi_ShouldUpsertQueryAndAuditDowntimeAndCustomerFault` 暴露 Scheduling evidence upsert 后审计记录缺失；`AgentDecisionRepository.UpsertEvidenceLinkAsync` 自提交让 evidence 可见，但 `ScheduleAgentService.WriteAuditAsync` 只 Add audit 未提交。
- 处理：`ScheduleAgentService.WriteAuditAsync` 已改为通过 `IUnitOfWork.ExecuteAsync` 包裹 `IAuditLogRepository.AddAsync`，由 UoW 统一提交 audit log。
- 测试夹具：`ScheduleAgentServiceTests` 已补 UoW mock 委托执行，避免测试环境吞掉 UoW 内部 action。
- 验证：单条 equipment evidence 失败用例通过，`ScheduleAgentServiceTests` `19/19 passed`，`SchedulingControllerTests` `61/61 passed`，`MES.Application` build `0 warning / 0 error`。

## Notifications Store 子路径资源问题

- 问题：`notifications` store 的浏览器通知 icon 旧实现固定为 `/favicon.ico`；当前应用以 `/scheduling/` base path 构建时，通知图标会绕过应用子路径。
- 处理：`sendBrowserNotification` 改用 `appAssetPath('favicon.ico')`，与 offline demo / asset path 工具保持一致。
- 测试：新增 `notifications.store.test.ts`，mock SignalR critical quality alert 并断言 `Notification` 使用 `/scheduling/favicon.ico`。
- 验证：通知 store 单测通过，前端全量 Vitest `6 files / 21 tests passed`。

## Quality CAPA Sync 后端失败不回退

- 问题：`readQualityCapaClosureBackendFirst` 旧实现直接 await 后端查询；网络失败时 promise reject，质量闭环面板无法使用本地 `aimes_quality_capa_closure` 兜底。
- 处理：backend-first 读取增加 catch，异常时返回 `readQualityCapaClosure()`。
- 测试：新增 `quality-capa-sync.test.ts`，覆盖 CAPA 写入、OTD 证据链镜像、后端 upsert mock、后端失败 fallback 和坏 JSON 清理。
- 验证：质量 CAPA sync 单测 `3/3 passed`，前端全量 Vitest `7 files / 24 tests passed`。

## Equipment Risk Sync 不完整本地记录

- 问题：`readEquipmentDowntimeEvent` 旧实现只做 JSON parse，不校验字段；缺少 `affectedOrders`、`maintenanceWindow` 或 `protectionStrategy` 的旧记录仍会被排产/报告页面读取。
- 处理：读取 equipment downtime 时校验关键字段，不完整记录会从 `aimes_equipment_downtime_event` 清理并返回 `null`。
- 测试：新增 `equipment-risk-sync.test.ts`，覆盖设备停机写入/读取、后端 upsert、backend-first fallback、坏 JSON 清理、不完整记录清理和客户故障样例默认值。
- 验证：设备风险 sync 单测 `5/5 passed`，前端全量 Vitest `8 files / 29 tests passed`，前端 lint 通过。

## Shortage Risk Sync 派生事件影响范围丢失

- 问题：`writeBomKittingPackage` 旧实现派生 `ShortageKittingEvent` 时把 `affectedOrders` 写成单个 `workOrderNumber`，丢失 BOM 齐套包 `summary` 中的跨工单缺料影响。
- 处理：派生 shortage event 时使用 `record.summary || record.workOrderNumber`，优先保留完整影响说明。
- 测试：新增 `shortage-risk-sync.test.ts`，覆盖 BOM 齐套包写入、后端 upsert、派生 shortage event、backend-first fallback、坏 JSON 清理和物料编码匹配。
- 验证：缺料风险 sync 单测 `4/4 passed`，前端全量 Vitest `9 files / 33 tests passed`，前端 lint 通过。

## Agent Config Approval Sync 本地 Override 未校验

- 问题：`readAgentConfigApprovals` 旧实现解析损坏 JSON 后不清理本地键，且会把同 `id` 的非法状态 override 合并到默认审批记录，可能让治理看板和质量实验门禁读取到不可识别状态。
- 处理：新增本地 override 类型守卫，仅接受字符串 `id` 和合法审批状态；损坏 JSON 解析失败时清理 `aimes_agent_config_approvals`。
- 测试：新增 `agent-config-approval-sync.test.ts`，覆盖审批决策持久化、后端同步、backend-first fallback、坏 JSON 清理和非法状态忽略。
- 验证：Agent 配置审批 sync 单测 `4/4 passed`，前端全量 Vitest `10 files / 37 tests passed`，前端 lint 通过。

## Risk SLA Review Sync 不完整本地记录

- 问题：`readRiskSlaReviewRecord` 旧实现遇到结构不完整的 `aimes_risk_sla_review` 只返回 `null`，但不会删除本地旧值；风险看板后续仍会重复读取无法说明影响工单、审计 trace 和责任动作的晨会复核状态。
- 处理：本地 JSON 解析成功但结构校验失败时清理 `aimes_risk_sla_review`，与坏 JSON 清理行为保持一致。
- 测试：新增 `risk-sla-review-sync.test.ts`，覆盖晨会复核写入、闭环、OTD active/closed 镜像、后端同步、backend-first fallback、坏 JSON 清理和不完整记录清理。
- 验证：风险 SLA 复核 sync 单测 `5/5 passed`，前端全量 Vitest `11 files / 42 tests passed`，前端 lint 通过。

## Anomaly Dispatch Sync 不完整本地记录

- 问题：`readAnomalyDispatchRecords` 旧实现只校验少量字段，缺少责任人、影响工单、排产窗口、动作建议、审计 ID 或状态标签的异常分流记录仍会被看板读取，无法解释“谁处理、影响什么、下一步做什么”。
- 处理：收紧 `isRecord`，要求合法异常类型和完整责任/影响/动作/审计字段；本地数组中存在坏结构时重写为有效记录，全部无效时清理 `aimes_anomaly_dispatch_records`。
- 测试：新增 `anomaly-dispatch-sync.test.ts`，覆盖异常分流写入、OTD 镜像、后端同步、backend-first fallback、按类型读取、去重截断、坏 JSON 清理和不完整记录清理。
- 验证：异常分流 sync 单测 `5/5 passed`，前端全量 Vitest `12 files / 47 tests passed`，前端 lint 通过。

## Labor Assignment Sync 不完整本地记录

- 问题：`readLaborReassignments` / `readLaborQualificationBlocks` 旧实现会过滤不完整记录但保留本地坏数组；生产/人员看板后续仍会反复读取无法解释资质风险、替班人员或复核责任人的旧状态。
- 处理：人员替班与资质阻断读取时，若过滤后数量少于原数组，则写回有效记录；如果没有有效记录则清理对应 localStorage key。
- 测试：新增 `labor-assignment-sync.test.ts`，覆盖资质阻断、替班、复核、释放、生产开工证据、后端 fallback、坏 JSON 清理和不完整记录清理。
- 验证：人员同步单测 `6/6 passed`，前端全量 Vitest `13 files / 53 tests passed`，前端 lint 通过。

## Barcode Scan Evidence Sync 不完整本地记录

- 问题：`readBarcodeScanEvidenceRecords` 旧实现会过滤不完整扫码证据但保留本地坏数组；执行/扫码看板后续仍会反复读取缺少 trace、状态标签或下一核对点的旧扫码状态。
- 处理：扫码证据读取时，若过滤后数量少于原数组，则写回有效记录；如果没有有效记录则清理 `aimes_barcode_scan_evidence`。
- 测试：新增 `barcode-scan-evidence-sync.test.ts`，覆盖扫码记录生成、写入、OTD 镜像、后端同步、backend-first fallback、坏 JSON 清理和不完整记录清理。
- 验证：扫码证据 sync 单测 `7/7 passed`，前端全量 Vitest `14 files / 60 tests passed`，前端 lint 通过。

## Production Anomaly Sync 坏本地事件

- 问题：`readProductionAnomalyEvent` 旧实现不会清理损坏 JSON，且会把缺少工序、检测人、建议动作等关键字段的不完整对象强转为生产异常事件，可能污染生产异常列表和详情。
- 处理：新增生产异常事件类型守卫，读取本地记录时校验关键字段；坏 JSON 或坏结构都会清理 `aimes_production_anomaly_event`。
- 测试：新增 `production-anomaly-sync.test.ts`，覆盖生产异常写入、后端同步、backend-first fallback、列表/详情映射、坏 JSON 清理和不完整事件清理。
- 验证：生产异常 sync 单测 `5/5 passed`，前端全量 Vitest `15 files / 65 tests passed`，前端 lint 通过。

## Monitoring Situation Escalation Sync 不完整本地记录

- 问题：`readMonitoringSituationEscalations` 旧实现只校验少量字段，缺少责任人、排产动作、风险影响、OTD 影响或状态标签的现场态势升级包仍会进入监控看板，无法解释处置责任和交付影响。
- 处理：收紧现场态势升级记录守卫，要求责任、排产、风险、OTD、审计、状态和创建时间字段完整；本地数组中存在坏结构时写回有效记录，全部无效时清理 `aimes_monitoring_situation_escalations`。
- 测试：新增 `monitoring-situation-escalation-sync.test.ts`，覆盖升级包写入、闭环、OTD 镜像、后端同步、backend-first fallback、去重截断、坏 JSON 清理和不完整记录清理。
- 验证：现场态势升级 sync 单测 `6/6 passed`，前端全量 Vitest `16 files / 71 tests passed`，前端 lint 通过。

## Assistant Action Audit 坏本地审计记录

- 问题：`readAssistantActionAudits` 旧实现解析损坏 JSON 后不清理本地键，且只要求 `id/actionId/auditCode`；缺少动作标签、动作类型、操作者、角色、权限结果、结果消息或创建时间的审计记录仍会进入助手审计列表。
- 处理：新增助手动作类型与审计记录守卫，要求完整权限解释字段；坏 JSON、非数组和坏结构会清理 `aimes_assistant_action_audits` 或写回剩余有效记录。
- 测试：新增 `assistant-action-audit.test.ts`，覆盖 allowed/denied 写入、后端同步、backend-first fallback、容量截断、坏 JSON 清理和不完整记录清理。
- 验证：助手动作审计单测 `6/6 passed`，前端全量 Vitest `17 files / 77 tests passed`，前端 lint 通过。

## Assistant Recovery Package 不完整本地执行包

- 问题：`readAssistantRecoveryPackages` 旧实现只校验少数字段；缺少 actor、role、owner、排产动作、风险影响、OTD 影响或创建时间的交期恢复包仍会进入排产/采购/质量看板，无法解释责任动作和交付影响。
- 处理：收紧恢复包和 dispatch step 类型守卫；本地数组中存在坏结构时写回有效记录，全部无效或非数组时清理 `aimes_assistant_recovery_packages`。
- 测试：新增 `assistant-action-package-sync.test.ts`，覆盖恢复包写入、OTD 镜像、后端同步、backend-first fallback、采购/质量/整包闭环、容量截断、坏 JSON 清理和不完整记录清理。
- 验证：交期恢复包 sync 单测 `6/6 passed`，前端全量 Vitest `18 files / 83 tests passed`，前端 lint 通过。

## Assistant Anomaly Card 不完整本地处置包

- 问题：`readAssistantAnomalyDispositionPackages` 旧实现只校验少数字段；缺少 actor、role、owner、异常标题、设备、交付影响、排产窗口或创建时间的助手异常包仍会进入异常/风险/排产看板。
- 处理：收紧异常处置包和 dispatch step 类型守卫；本地数组中存在坏结构时写回有效记录，全部无效或非数组时清理 `aimes_assistant_anomaly_packages`。
- 测试：新增 `assistant-anomaly-card-sync.test.ts`，覆盖异常包写入、生产异常镜像、风险分流镜像、OTD 镜像、后端同步、backend-first fallback、容量截断、坏 JSON 清理和不完整记录清理。
- 验证：助手异常处置包 sync 单测 `5/5 passed`，前端全量 Vitest `19 files / 88 tests passed`，前端 lint 通过。

## Assistant Engineering Constraint Package 不完整本地约束包

- 问题：`readAssistantEngineeringConstraintPackages` 旧实现只校验少数字段；缺少 actor、role、owner、BOM/ECN/route/operation、OTD 影响或创建时间的工程约束包仍会进入工程/排产/质量看板。
- 处理：收紧工程约束包和 dispatch step 类型守卫；本地数组中存在坏结构时写回有效记录，全部无效或非数组时清理 `aimes_assistant_engineering_constraint_packages`。
- 测试：新增 `assistant-engineering-constraint-package-sync.test.ts`，覆盖工程约束包写入、工程变更影响种子、工艺能力种子、OTD 镜像、后端同步、backend-first fallback、容量截断、坏 JSON 清理和不完整记录清理。
- 验证：工程约束包 sync 单测 `5/5 passed`，前端全量 Vitest `20 files / 93 tests passed`，前端 lint 通过。

## OTD KPI Commitment 不完整本地客户承诺包

- 问题：`readOtdKpiCommitmentPackages` 旧实现只校验少数字段；缺少维度、标题、操作者、OTD 数值、责任人、承诺说明、创建时间或 action 详情的客户承诺包仍会进入报表/聊天/排产看板。
- 处理：收紧客户承诺包和 action 类型守卫；本地数组中存在坏结构时写回有效记录，全部无效或非数组时清理 `aimes_otd_kpi_commitment_packages`。
- 测试：新增 `otd-kpi-commitment-sync.test.ts`，覆盖承诺包写入、OTD 镜像、后端同步、backend-first fallback、latest fallback、容量截断、坏 JSON 清理和不完整记录清理。
- 验证：OTD KPI 承诺包 sync 单测 `6/6 passed`，前端全量 Vitest `21 files / 99 tests passed`，前端 lint 通过。

## Outsourcing Commitment 不完整本地外协承诺包

- 问题：`readOutsourcingCommitmentPackages` 旧实现只校验少数字段；缺少维度、标题、操作者、OTD 数值、责任人、承诺说明、创建时间或 action 详情的外协承诺包仍会进入报表/采购/排产看板。
- 处理：收紧外协承诺包和 action 类型守卫；本地数组中存在坏结构时写回有效记录，全部无效或非数组时清理 `aimes_outsourcing_commitment_packages`。
- 测试：新增 `outsourcing-commitment-sync.test.ts`，覆盖承诺包写入、OTD 镜像、后端同步、backend-first fallback、latest fallback、外协到货、排产释放、容量截断、坏 JSON 清理和不完整记录清理。
- 验证：外协承诺包 sync 单测 `7/7 passed`，前端全量 Vitest `22 files / 106 tests passed`，前端 lint 通过。

## OTD Evidence Chain 不完整本地证据链记录

- 问题：`readOtdEvidenceChainRecords` 旧实现会过滤缺少 summary、source、traceId、status 或 createdAt 的证据链记录，但不会删除原始坏数组；看板和上层 sync util 后续仍会反复读取同一坏状态。
- 处理：OTD 证据链读取时，若本地数组包含坏结构则写回有效记录；全部无效或非数组时清理 `aimes_otd_evidence_chain`。
- 测试：新增 `otd-evidence-chain-sync.test.ts`，覆盖 upsert 去重、容量截断、后端同步、backend-first fallback、闭环匹配、坏 JSON 清理和不完整记录清理。
- 验证：OTD 证据链 sync 单测 `5/5 passed`，前端全量 Vitest `23 files / 111 tests passed`，前端 lint 通过。

## Customer Order Import 坏本地导入证据

- 问题：`readCustomerOrderImportEvidence` 旧实现遇到损坏 JSON 只返回 `null` 不清理本地键，且只校验 `batchId/fileName`；缺少来源、订单数量、风险订单、映射字段或准备时间的证据会持续留在 `aimes_customer_order_import`。
- 处理：新增客户工单导入证据类型守卫，读取本地记录时校验关键解释字段；坏 JSON 或坏结构都会清理 `aimes_customer_order_import`。
- 测试：新增 `customer-order-import-sync.test.ts`，覆盖导入证据写入、后端同步、backend-first fallback、坏 JSON 清理和不完整证据清理。
- 验证：客户工单导入 sync 单测 `4/4 passed`，前端全量 Vitest `24 files / 115 tests passed`，前端 lint 通过。

## Engineering Change 坏本地工程证据

- 问题：替代料批准和工艺能力读取旧实现只校验少量字段；工程变更影响读取会把只有 `changeId/traceId` 的坏记录默认补齐，导致排产、聊天和审计回放可能使用无法解释责任、影响和审计链路的工程证据。
- 处理：新增三类工程证据类型守卫，要求替代料、ECN 影响和工艺能力记录具备完整对象、责任、影响、审计、状态和时间字段；坏结构清理对应 localStorage key。
- 测试：新增 `engineering-change-sync.test.ts`，覆盖三类证据写入、OTD 镜像、后端同步、backend-first fallback 和不完整本地记录清理。
- 验证：工程变更 sync 单测 `5/5 passed`，前端全量 Vitest `25 files / 120 tests passed`，前端 lint 通过。

## Knowledge Governance 不完整本地复核记录

- 问题：`readKnowledgeGovernanceReviews` 旧实现会过滤不完整知识治理复核记录，但保留原始坏数组；知识上传、审计回放和 AI 引用链路后续仍会反复遇到无法解释复核人或审计 trace 的旧值。
- 处理：知识治理复核读取时，若本地数组包含坏结构则写回有效记录；全部无效或非数组时清理 `aimes_knowledge_governance_reviews`。
- 测试：新增 `knowledge-governance-sync.test.ts`，覆盖复核写入、OTD 镜像、后端同步、backend-first fallback、混合坏结构写回和全坏结构清理。
- 验证：知识治理 sync 单测 `4/4 passed`，前端全量 Vitest `26 files / 124 tests passed`，前端 lint 通过。

## POC Hypercare 坏本地上线验收记录

- 问题：`readPocHypercareAcceptanceRecord` 旧实现对坏外层结构只返回 `null` 不清理本地键，且只要求 `monitors/checkpoints` 是数组；缺少指标 evidence 或检查点 action 的记录仍会进入生产概览、实时监控、报表和聊天问答。
- 处理：新增 Hypercare monitor/checkpoint 类型守卫，并在外层或子项坏结构时清理 `aimes_poc_hypercare_acceptance`。
- 测试：新增 `poc-hypercare-sync.test.ts`，覆盖上线验收写入、OTD 镜像、后端同步、backend-first fallback、坏 JSON 清理、不完整验收清理和坏子项清理。
- 验证：POC Hypercare sync 单测 `5/5 passed`，前端全量 Vitest `27 files / 129 tests passed`，前端 lint 通过。

## POC Pilot Run 坏本地试点运行记录

- 问题：`readPocPilotRunRecord` 旧实现对坏外层结构只返回 `null` 不清理本地键，且只要求 `workOrders/checkpoints` 是数组；缺少产品、路线、采纳决策或检查点 evidence 的记录仍会进入生产、排产、报表和 Hypercare 链路。
- 处理：新增试点工单和检查点类型守卫，并在外层或子项坏结构时清理 `aimes_poc_pilot_run`。
- 测试：新增 `poc-pilot-run-sync.test.ts`，覆盖试点运行写入、OTD 镜像、后端同步、backend-first fallback、坏 JSON 清理、不完整试点清理和坏子项清理。
- 验证：POC 试点运行 sync 单测 `5/5 passed`，前端全量 Vitest `28 files / 134 tests passed`，前端 lint 通过。

## POC Review Signoff 坏本地复盘签署记录

- 问题：`readPocReviewSignoffRecord` 旧实现坏 JSON 不清理，且只要求 `meetingId/auditId`；缺少评分、签署人、复核人或证据批次的不完整签署记录仍会进入上线交付包、报表和审计回放。
- 处理：新增 POC 复盘签署类型守卫，并在坏 JSON 或坏结构时清理 `aimes_poc_review_signoff`。
- 测试：新增 `poc-review-signoff-sync.test.ts`，覆盖签署写入、OTD 镜像、后端同步、backend-first fallback、坏 JSON 清理和不完整签署清理。
- 验证：POC 复盘签署 sync 单测 `4/4 passed`，前端全量 Vitest `29 files / 138 tests passed`，前端 lint 通过。

## POC Rollout Package 坏本地上线交付包

- 问题：`readPocRolloutPackageRecord` 旧实现对坏外层结构只返回 `null` 不清理本地键，且只要求 `actions` 是数组；缺少 owner、action、dueAt 或 evidence 的上线行动项仍会进入报表、聊天和试点运行链路。
- 处理：新增上线交付行动项类型守卫，并在外层或 action 坏结构时清理 `aimes_poc_rollout_package`。
- 测试：新增 `poc-rollout-package-sync.test.ts`，覆盖交付包写入、OTD 镜像、后端同步、backend-first fallback、坏 JSON 清理、不完整交付包清理和坏行动项清理。
- 验证：POC 上线交付包 sync 单测 `5/5 passed`，前端全量 Vitest `30 files / 143 tests passed`，前端 lint 通过。

## Quality Rework Sync 坏本地返工影响

- 问题：`readQualityReworkImpact` 旧实现直接强转 JSON；只有 `inspectionId/workOrderId/otdImpact` 的不完整记录也会被当作有效返工影响返回，无法解释产品、工序、设备、批次、根因和证据。
- 处理：新增返工影响类型守卫，读取本地记录时校验关键质量、排产、OTD、根因和 evidence 字段；坏 JSON 或坏结构都会清理 `aimes_quality_rework_impact`。
- 测试：新增 `quality-rework-sync.test.ts`，覆盖返工影响写入、后端同步、backend-first fallback、返工检验选择、impact 构建、坏 JSON 清理和不完整记录清理。
- 验证：质量返工 sync 单测 `5/5 passed`，前端全量 Vitest `31 files / 148 tests passed`，前端 lint 通过。

## Quality MRB Disposition Sync 坏本地处置记录

- 问题：`readQualityMrbDispositionRecord` 旧实现直接强转 JSON；缺少处置类型、状态、责任、OTD/排产影响、审计 trace 或 action evidence 的 MRB 记录仍会进入质量、排产和客户说明链路。
- 处理：新增 MRB 处置记录和 action 类型守卫，读取本地记录时校验关键质量、处置、排产、审计和 action 字段；坏 JSON 或坏结构都会清理 `aimes_quality_mrb_disposition`。
- 测试：新增 `quality-mrb-disposition-sync.test.ts`，覆盖 MRB 处置写入、OTD 镜像、后端同步、backend-first fallback、闭环、坏 JSON 清理、不完整记录清理和坏 action 清理。
- 验证：质量 MRB sync 单测 `6/6 passed`，前端全量 Vitest `32 files / 154 tests passed`，前端 lint 通过。

## Quality Knowledge Sample Sync 坏本地数组残留

- 问题：`readQualityKnowledgeSamples`、`readQualityKnowledgeReuseDrafts`、`readQualityKnowledgeReviewQueueRecords` 等读取入口会过滤坏结构但保留原始 localStorage；质量、聊天、报表和审计回放后续会反复遇到同一批不可解释的旧记录。
- 处理：新增共享读取 helper，读取质量知识本地数组时校验记录结构；混合坏结构写回有效记录，全部无效、非数组或坏 JSON 清理对应 key，并保留灰度决策默认值补齐逻辑。
- 测试：新增 `quality-knowledge-sample-sync.test.ts`，覆盖样本写入、OTD 镜像、后端同步、backend-first fallback、混合坏结构写回、全坏结构清理、坏 JSON 清理和复用草案/复核队列清理。
- 验证：质量知识样本 sync 单测 `5/5 passed`，前端全量 Vitest `33 files / 159 tests passed`，前端 lint 通过。

## Customer Equipment Fault Evidence 坏本地 POC 样例

- 问题：`readCustomerEquipmentFaultEvidence` 旧实现只要求 `batchId/equipmentCode`；缺少文件、来源、影响工单、停机小时、采集信号或准备时间的记录仍会进入 POC 证据治理清单。
- 处理：读取客户设备故障证据时校验完整 POC 样例字段；坏 JSON 或坏结构都会清理 `aimes_customer_equipment_fault_evidence`。
- 测试：扩展 `equipment-risk-sync.test.ts`，覆盖不完整客户设备故障证据清理。
- 验证：设备风险 sync 单测 `6/6 passed`，前端全量 Vitest `33 files / 160 tests passed`，前端 lint 通过。

## POC Evidence Governance / Customer Order Import 字段映射缺失

- 问题：`readCustomerOrderImportEvidence` 旧实现允许 `mappedFields: []`；POC evidence governance 会生成没有字段映射血缘的客户工单导入证据，无法说明客户字段如何进入验收口径。
- 处理：客户工单导入证据要求 `mappedFields` 非空且每项为非空字符串；空映射会清理 `aimes_customer_order_import`。
- 测试：新增 `poc-evidence-governance.test.ts` 覆盖 POC 聚合输出；扩展 `customer-order-import-sync.test.ts` 覆盖空字段映射清理。
- 验证：客户工单导入 sync 单测 `5/5 passed`，POC evidence governance 单测 `2/2 passed`，前端全量 Vitest `34 files / 163 tests passed`，前端 lint 通过。

## Customer Equipment Fault Evidence 采集信号缺失

- 问题：`readCustomerEquipmentFaultEvidence` 旧实现允许 `capturedSignals: []`；POC evidence governance 会生成没有遥测/点检信号来源的设备故障证据。
- 处理：客户设备故障证据要求 `capturedSignals` 非空且每项为非空字符串；空信号数组或空信号项会清理 `aimes_customer_equipment_fault_evidence`。
- 测试：扩展 `equipment-risk-sync.test.ts`，覆盖空采集信号清理。
- 验证：设备风险 sync 单测 `7/7 passed`，前端全量 Vitest `34 files / 164 tests passed`，前端 lint 通过。

## Knowledge Citations 空质量知识证据被误标可引用

- 问题：`readQualityKnowledgeSamples` 旧实现允许 `capaRecommendations/reuseTargets/evidenceTraceIds` 为空数组；`knowledge-citations` 会把缺少 CAPA 推荐和证据 trace 的样本标记为 `可引用`，并生成空内容 citation。
- 处理：质量知识样本要求 CAPA 推荐、复用范围和证据 trace 均非空且每项为非空字符串；空数组或空白项会在读取边界被清理。
- 测试：新增 `knowledge-citations.test.ts`，覆盖聊天引用在空质量知识证据下保持“需复核”。
- 验证：知识引用单测 `1/1 passed`，质量知识样本 sync 单测 `5/5 passed`。

## Gantt Mapper 长任务覆盖多任务冲突漏报

- 问题：`detectConflicts` 旧实现只比较相邻任务；同一设备上一条长任务覆盖多个后续短任务时，第二个及之后的重叠任务可能不会被标记冲突。
- 处理：同一设备内按开始时间排序后维护结束时间最晚的 active 任务，后续任务与 active 结束时间比较并保留冲突工单来源。
- 测试：新增 `gantt-mapper.test.ts`，覆盖长任务覆盖两个后续短任务时两个短任务都必须产生冲突说明。
- 验证：甘特映射单测 `1/1 passed`。

## Gantt Mapper 换型准备时间低估

- 问题：`parseSetupTime` 旧实现只取第一个数字；`1 小时 30 分钟` 会被映射为 1 分钟，影响甘特图任务说明和排产审计口径。
- 处理：解析小时/分钟组合标签并合并为分钟数，同时保留纯数字分钟兜底。
- 测试：扩展 `gantt-mapper.test.ts`，覆盖小时 + 分钟组合换型标签。
- 验证：甘特映射单测 `2/2 passed`。

## Gantt Mapper 冲突标记未进入统一任务契约

- 问题：`planToGanttData` 输出任务不带 `hasConflict/conflictMessage`；冲突只在 `ScheduleBoard.markConflicts` 后处理里可见，Pareto 对比等直接消费 mapper 的视图缺少冲突审计字段。
- 处理：计划映射阶段统一调用 `detectConflicts`，为重叠任务写入冲突标记和冲突说明。
- 测试：扩展 `gantt-mapper.test.ts`，覆盖 mapper 输出任务的冲突字段。
- 验证：甘特映射单测 `3/3 passed`。

## Gantt Mapper 重复依赖链接污染审计

- 问题：同一任务的 `dependentItems` 重复包含同一前序任务时，`planToGanttData` 会生成重复甘特图 link，导致依赖箭头和审计计数重复。
- 处理：生成 link 时按 `link-${source}-${target}` 去重，只保留第一条有效依赖。
- 测试：扩展 `gantt-mapper.test.ts`，覆盖重复依赖 ID 只输出一条 link。
- 验证：甘特映射单测 `4/4 passed`。

## Gantt Mapper 异常时间窗口被静默归一

- 问题：排产项结束时间早于开始时间时，`planToGanttData` 会把 duration 归一为 0.01 天，但不暴露任何冲突标记，审计视图难以发现坏时间窗口。
- 处理：异常时间窗口任务保留最小展示时长，同时写入 `hasConflict` 和明确冲突说明。
- 测试：扩展 `gantt-mapper.test.ts`，覆盖结束早于开始的排产项。
- 验证：甘特映射单测 `5/5 passed`。

## Gantt Mapper 扁平任务异常时间窗口被静默归一

- 问题：`itemsToFlatTasks` 同样会把结束早于开始的任务归一为 0.01 天，但不暴露冲突标记，导致 flat task 消费方无法审计坏时间窗口。
- 处理：扁平任务映射时也写入 `hasConflict` 和异常时间窗口说明。
- 测试：扩展 `gantt-mapper.test.ts`，覆盖 flat task 异常时间窗口。
- 验证：甘特映射单测 `6/6 passed`。

## Gantt Mapper 扁平任务缺失换型时间

- 问题：`itemsToFlatTasks` 旧输出没有 `setupMinutes`，flat task 消费方无法展示或审计换型准备时间。
- 处理：扁平任务映射复用 `parseSetupTime`，与分组计划映射保持同一换型时间口径。
- 测试：扩展 `gantt-mapper.test.ts`，覆盖 flat task 的小时 + 分钟 setup 标签。
- 验证：甘特映射单测 `7/7 passed`。

## Gantt Mapper 小数小时换型时间误读

- 问题：`parseSetupTime` 旧正则只匹配整数且没有阻止从小数尾部重新开始匹配，`1.5 小时` 会被识别成 `5 小时`，输出 `setupMinutes: 300`。
- 处理：小时/分钟单位解析改为支持小数数值，并统一用 `Number.parseFloat` 换算后四舍五入为分钟。
- 测试：扩展 `gantt-mapper.test.ts`，覆盖小数小时 setup 标签。
- 验证：甘特映射单测 `8/8 passed`。

## CSV 导出表头未转义

- 问题：`exportToCsv` 旧实现只转义数据行 cell，表头直接 `headers.join(',')`；表头含逗号、双引号或换行时会破坏 CSV 列结构。
- 处理：抽出共享 `escapeCsvCell`，表头与数据行统一执行 CSV 转义。
- 测试：新增 `export.test.ts`，覆盖特殊字符表头的审计导出列结构。
- 验证：CSV 导出单测 `1/1 passed`。

## useExport 排产/报表导出表头未转义

- 问题：`useExport.downloadCsv` 旧实现只给数据行 cell 加引号，表头直接拼接；排产/报表字段名含逗号、双引号或换行时会破坏首行列结构。
- 处理：表头和数据行共用 `escapeCsvCell`，统一输出带引号且双引号转义后的 CSV cell。
- 测试：新增 `use-export.test.ts`，覆盖排产/报表导出入口的特殊字符表头。
- 验证：`useExport` 导出单测 `1/1 passed`。

## BOM 齐套包明细坏结构被当作有效证据

- 问题：`readBomKittingPackage` 旧实现只检查外层 `bomCode/workOrderNumber/traceId`，缺少物料名称、数量、单位或动作的 `items` 明细仍会进入缺料看板。
- 处理：新增 BOM 齐套包与明细项类型守卫，读取到坏结构时清理 `aimes_bom_kitting_package`。
- 测试：扩展 `shortage-risk-sync.test.ts`，覆盖不完整 BOM package item 清理。
- 验证：缺料风险同步单测 `5/5 passed`。

## 缺料闭环坏结构被当作有效证据

- 问题：`readShortageRiskResolution` 旧实现直接强转 JSON，缺少影响订单、来源工单、单位、可用量、闭环时间或说明的不完整记录仍会进入闭环证据。
- 处理：新增缺料闭环类型守卫，读取到坏结构时清理 `aimes_shortage_risk_resolution`。
- 测试：扩展 `shortage-risk-sync.test.ts`，覆盖不完整缺料闭环记录清理。
- 验证：缺料风险同步单测 `6/6 passed`。

## Auth Store 损坏身份缓存未清理

- 问题：`auth.ts` 启动恢复登录态时直接解析 `aimes_user`；损坏 JSON 会被 catch 后吞掉并返回未登录，但坏缓存仍留在 localStorage，后续启动和其他身份读取入口会反复遇到同一坏证据。
- 处理：auth store 改为复用 `getLocalUser()` 的共享解析和坏 JSON 清理规则，并在恢复登录态前校验缓存用户具备完整身份字段。
- 测试：扩展 `auth.store.test.ts`，覆盖 token 存在但 `aimes_user` 损坏时必须返回未登录并清理坏缓存。
- 验证：auth store 单测 `4/4 passed`，local user 单测 `2/2 passed`。

## ReportBoard 报表 actor 私有解析身份缓存

- 问题：`ReportBoard.vue` 的 `currentActor()` 直接读取并解析 `aimes_user`；损坏 JSON 只回退为 `report.viewer`，不会清理坏缓存，报表承诺包 actor 与其他入口的身份解析规则分叉。
- 处理：新增 `getLocalUserReportActor()`，报表 actor 保持 username 优先，同时复用共享坏 JSON 清理规则；`ReportBoard.vue` 改为调用该函数。
- 测试：扩展 `local-user.test.ts`，覆盖 username 优先和坏缓存清理。
- 验证：local user 单测 `3/3 passed`。

## HTTP Refresh 响应缺字段仍被当作有效续期

- 问题：`api/http.ts` 的 `performRefresh()` 未校验 `/auth/refresh` 响应结构；缺少 `token` 的响应会被写入/使用为 `Bearer undefined`，并继续重试原业务请求。
- 处理：新增 refresh 响应类型守卫，要求 `token` 和 `refreshToken` 均为非空字符串；无效响应抛错并触发既有清理登录态路径。
- 测试：新增 `http-refresh.test.ts`，覆盖 malformed refresh response 必须清理 token、refresh token 和用户缓存，且不得重试原请求。
- 验证：HTTP refresh 单测 `1/1 passed`。

## HTTP Refresh 成功但原请求 headers 缺失会误清登录态

- 问题：401 拦截器 refresh 成功后直接写 `config.headers.Authorization`；如果原错误 config 没有 headers 对象，会抛错并进入 refresh 失败分支，清理登录态。
- 处理：重试原请求前兜底初始化 `config.headers`，再写入新的 Authorization header。
- 测试：扩展 `http-refresh.test.ts`，覆盖原请求缺 headers 时仍使用新 token 重试。
- 验证：HTTP refresh 单测 `2/2 passed`。

## HTTP 请求拦截器缺 headers 时无法附加 token

- 问题：请求拦截器附加 `Authorization` 时假定 `config.headers` 已存在；边界 config 缺少 headers 时会抛异常，请求无法发出。
- 处理：请求拦截器写 token 前兜底初始化 `config.headers`。
- 测试：扩展 `http-refresh.test.ts`，覆盖 config 无 headers 仍能附加 `Bearer access-token`。
- 验证：HTTP refresh 单测 `3/3 passed`。

## HTTP / SignalR Access Token 读取规则分叉

- 问题：HTTP 请求拦截器、通知 hub、Dashboard hub 和 Monitoring hub 分别读取 `aimes_token`；空白 token 没有统一 guard，实时连接可能发送不可用凭据。
- 处理：新增 `getLocalAccessToken()` 共享读取入口，缺失或纯空白 token 返回 `null`；HTTP 和 SignalR token factory 均复用该函数。
- 测试：新增 `auth-token.test.ts`，覆盖空白 token 忽略和非空 token 返回。
- 验证：auth token 单测 `1/1 passed`；HTTP refresh 与通知 store 相邻回归 `4/4 passed`。

## Access Token 边界空白被透传到凭据注入

- 问题：`getLocalAccessToken()` 只用 trim 判断非空，但返回原始 token；`"  access-token  "` 会原样进入 HTTP Authorization 或 SignalR credential factory。
- 处理：共享 token guard 返回 trim 后的 token，保证所有调用方拿到归一化凭据。
- 测试：扩展 `auth-token.test.ts`，覆盖带边界空白的 token 必须返回 `access-token`。
- 验证：auth token 单测 `2/2 passed`；HTTP refresh 与通知 store 相邻回归 `4/4 passed`。

## Auth 启动和 Router 守卫仍接受空白 token

- 问题：`auth.ts` 与 `router/index.ts` 直接读取 `aimes_token`；纯空白 token 会恢复登录态或放行受保护路由，和共享 token guard 的空白拒绝口径分叉。
- 处理：auth store 启动恢复和 router guard 均改为调用 `getLocalAccessToken()`。
- 测试：扩展 `auth.store.test.ts` 覆盖空白 token 不恢复登录态；新增 `router-auth.test.ts` 覆盖空白 token 访问 `/dashboard` 跳转 `/login`。
- 验证：身份启动/路由/共享 token 三组单测合计 `8/8 passed`。

## Router 角色授权被缓存角色边界空白误拒

- 问题：`getLocalUserRole()` 对 `"  Admin  "` 只判断非空但返回原始字符串，Admin-only 路由按 `includes('Admin')` 比对时会误拒合法角色。
- 处理：共享角色读取入口返回 trim 后的 role，空白 role 仍返回 `null`。
- 测试：扩展 `local-user.test.ts` 覆盖角色归一化；扩展 `router-auth.test.ts` 覆盖 `/admin` 守卫实际通过路径。
- 验证：local user 与 router auth 单测合计 `6/6 passed`。

## 本地身份 actor 输出保留边界空白

- 问题：`getLocalUserDisplayName()` 与 `getLocalUserReportActor()` 返回原始 displayName / username；缓存值带边界空白时，聊天、扫码、报表签名或审计 actor 会写入不可见空白。
- 处理：共享身份 actor 输出统一 trim；空白字段继续使用既有 fallback。
- 测试：扩展 `local-user.test.ts` 覆盖 displayName 和 report actor 的归一化输出。
- 验证：local user、auth store、router auth 相邻单测合计 `12/12 passed`。

## Auth 启动恢复身份字段保留边界空白

- 问题：auth store 已复用 `getLocalUser()` 启动恢复登录态，但该共享读取入口返回原始缓存对象；`aimes_user` 中带边界空白的 `username/displayName/role` 会进入 `AuthUser` 状态。
- 处理：`local-user.ts` 在 `readCachedUser()` 返回前统一归一化缓存身份字段，非空字符串 trim，空白字符串不再作为有效身份字段返回。
- 测试：扩展 `auth.store.test.ts`，覆盖 trim 后 token 与 trim 后缓存身份字段一起恢复为干净 `AuthUser`。
- 验证：auth store、local user、router auth 相邻单测合计 `13/13 passed`；前端全量 Vitest `42 files / 199 tests passed`，`npm run lint` 通过。

## HTTP Refresh 新 token 带边界空白会污染重试请求

- 问题：`performRefresh()` 只校验 refresh 响应 token trim 后非空，但原样写入 localStorage 并返回给 retry；响应中 `"  new-access-token  "` 会生成带空白的 Authorization header。
- 处理：refresh 响应通过结构校验后立即归一化 access token 和 refresh token，后续存储和 retry 只使用 trim 后值。
- 测试：扩展 `http-refresh.test.ts`，覆盖新 token pair 带边界空白时，重试 header 和 localStorage 都必须使用归一化值。
- 验证：HTTP refresh、auth-token、auth store 相邻单测合计 `12/12 passed`；前端全量 Vitest `42 files / 200 tests passed`，`npm run lint` 通过。

## HTTP Refresh 旧缓存 refresh token 带边界空白会污染请求体

- 问题：`performRefresh()` 从 localStorage 读取 `aimes_refresh_token` 后只判断 truthy，旧缓存值带边界空白时会原样发送到认证端点。
- 处理：读取旧 refresh token 后先 trim；trim 后为空则抛出 `no refresh token`，让既有失败路径清理登录态。
- 测试：扩展 `http-refresh.test.ts`，覆盖旧缓存 `"  refresh-token  "` 只以 `refresh-token` 进入 `/auth/refresh` 请求体。
- 验证：HTTP refresh、auth-token、auth store 相邻单测合计 `13/13 passed`；前端全量 Vitest `42 files / 201 tests passed`，`npm run lint` 通过。

## 后端登录 token pair 带边界空白会污染登录态缓存

- 问题：`auth.ts` 后端登录成功后直接使用 `res.token` 和 `res.refreshToken`；若响应带边界空白，当前 `AuthUser.token`、`aimes_token`、`aimes_refresh_token` 都会继承坏凭据。
- 处理：登录成功构造用户状态时 trim access token，保存用户时对 access token 和 refresh token 统一 trim。
- 测试：扩展 `auth.store.test.ts`，覆盖后端登录 token pair 带空白时，返回状态和本地缓存都必须归一化。
- 验证：auth store、HTTP refresh、auth-token 相邻单测合计 `14/14 passed`；前端全量 Vitest `42 files / 202 tests passed`，`npm run lint` 通过。

## 前端单测覆盖率没有 CI 门禁

- 问题：前端 CI 只运行 lint、unit tests 和 build；缺少 coverage script 与覆盖率阈值 step，无法防止覆盖率证据被跳过。
- 处理：新增 `test:unit:coverage`、Vitest v8 coverage 配置、`@vitest/coverage-v8`，并在 CI frontend job 中运行 coverage；本地 coverage 输出目录加入 `.gitignore`。
- 测试：新增 `frontend-ci-coverage.test.ts`，读取 `package.json` 和外层 `.github/workflows/ci.yml`，确认 coverage script 与 CI step 存在。
- 验证：frontend coverage gate 单测通过；`npm run test:unit:coverage`、全量 `npm run test:unit`、`npm run lint` 均通过。
- 剩余风险：当前 10% 阈值是保守防倒退线，不代表覆盖率成熟；外部 CI runner 尚未执行，发布级证据仍待补齐。

## 前端 coverage threshold 长期停留在初始安全线

- 问题：coverage 门禁刚接入时四个阈值均为 `10`，低于当前真实 lines/statements `17.05%`，防倒退能力偏弱。
- 处理：将 lines/branches/functions/statements threshold 提升到 `15`，并用 `frontend-ci-coverage.test.ts` 锁定该阈值地板。
- 测试：扩展 `frontend-ci-coverage.test.ts` 覆盖 `vitest.config.ts` 中四个阈值必须为 `15`。
- 验证：目标测试红绿通过，`npm run test:unit:coverage` 在新阈值下通过，全量 `npm run test:unit` 与 `npm run lint` 通过。
- 剩余风险：15% 仍不代表覆盖率成熟；后续应先补高价值页面/组件测试，再继续提高阈值。

## 登录页会提交纯空白凭据

- 问题：`LoginPage.vue` 的提交按钮只判断字符串 truthy，纯空白用户名和密码会进入 auth store 登录流程。
- 处理：登录提交入口 trim 用户名和密码；任一为空时显示用户可见错误并停止流程。
- 测试：新增 `login-page.test.ts`，挂载真实组件并提交空白输入，断言 auth store 和 router 均未被调用。
- 验证：目标测试红绿通过，`auth.store.test.ts` 相邻回归通过；coverage、全量单测和 lint 均通过。
- 剩余风险：登录页成功路径、后端错误路径和 loading 状态仍可继续补组件测试。

## 登录页空白凭据时按钮仍可点击

- 问题：提交逻辑已经拒绝空白凭据，但按钮禁用条件仍按原始字符串 truthy 判断，纯空白输入时按钮仍可点击。
- 处理：新增 trim 后 `canSubmit`，按钮禁用条件改为 `loading || !canSubmit`。
- 测试：扩展 `login-page.test.ts`，覆盖空白用户名/密码时 submit button 必须带 `disabled`。
- 验证：目标测试红绿通过，`auth.store.test.ts` 相邻回归通过；coverage、全量单测和 lint 均通过。
- 剩余风险：登录页成功路径、后端错误路径和 loading 状态仍可继续补组件测试。

## 错误 Toast 缺少 alert 语义

- 问题：`ToastContainer.vue` 通过颜色和图标展示错误，但缺少 `role="alert"` 与 assertive live region，辅助技术不能及时播报错误反馈。
- 处理：按 toast 类型设置 ARIA 语义；错误为 alert/assertive，非错误为 status/polite。
- 测试：新增 `toast-container.test.ts`，挂载真实组件并断言错误 toast 的 alert 语义、标题和消息。
- 验证：目标测试红绿通过，`notifications.store.test.ts` 相邻回归通过；coverage、全量单测和 lint 均通过。
- 剩余风险：warning/info/success 的 polite status 语义和多 toast 顺序仍可继续补测试。

## Toast 装饰性图标未隐藏于辅助技术

- 问题：`ToastContainer.vue` 的 `.toast-icon` 只是视觉符号，但未设置 `aria-hidden`，可能被辅助技术与标题/消息一起重复播报。
- 处理：为 `.toast-icon` 设置 `aria-hidden="true"`，让可访问语义集中在 toast 容器的 role、live region、标题和消息上。
- 测试：扩展 `toast-container.test.ts`，挂载真实组件并断言 `.toast-icon` 的 `aria-hidden` 为 `true`。
- 验证：目标测试红绿通过，`notifications.store.test.ts` 相邻回归通过；coverage、全量单测和 lint 均通过。
- 剩余风险：warning/info/success 的 polite status 语义和多 toast 顺序仍可继续补测试。

## Toast live region 缺少 atomic 播报语义

- 问题：`ToastContainer.vue` 已设置 `role` 与 `aria-live`，但缺少 `aria-atomic`；动态 toast 可能只播报局部变化，无法稳定读出完整标题和消息。
- 处理：为每条 `.toast-item` 设置 `aria-atomic="true"`，让 error alert 和非错误 status 都按整条通知播报。
- 测试：扩展 `toast-container.test.ts`，挂载 warning toast 并断言 `role="status"`、`aria-live="polite"` 和 `aria-atomic="true"`。
- 验证：目标测试红绿通过，`notifications.store.test.ts` 相邻回归通过；coverage、全量单测和 lint 均通过。
- 剩余风险：多 toast 顺序与自动移除后的播报体验仍可继续补测试。

## 登录页校验错误缺少 alert 语义

- 问题：`LoginPage.vue` 的 `.login-error` 只作为视觉文本渲染；空白凭据等校验错误不会以 alert/live region 形式通知辅助技术。
- 处理：为 `.login-error` 设置 `role="alert"` 与 `aria-live="assertive"`，保持现有文案和登录逻辑不变。
- 测试：扩展 `login-page.test.ts`，覆盖空白凭据提交后错误文本必须可通过 `[role="alert"]` 获取，并带 assertive live region。
- 验证：目标测试红绿通过，身份相邻测试通过；coverage、全量单测和 lint 均通过。
- 剩余风险：后端登录失败错误展示、loading 状态和成功路径 UI 状态仍可继续补测试。

## 登录页提交按钮加载态缺少 busy 语义

- 问题：`LoginPage.vue` 登录 pending 时按钮显示 `登录中...` 且被禁用，但没有 `aria-busy`，辅助技术无法直接识别提交正在处理。
- 处理：在 `loading` 为 true 时为 submit button 输出 `aria-busy="true"`，非 loading 状态不输出该属性。
- 测试：扩展 `login-page.test.ts`，用 pending promise 固定登录请求加载态，断言按钮文案、禁用状态和 busy 语义。
- 验证：目标测试红绿通过，身份相邻测试通过；coverage、全量单测和 lint 均通过。
- 剩余风险：后端登录失败错误展示仍可继续补测试。

## 登录页错误未关联到凭据输入框

- 问题：`LoginPage.vue` 的错误提示已有 alert 语义，但没有稳定 id；用户名/密码输入框也没有 `aria-invalid` 和 `aria-describedby`，字段上下文无法直接关联错误说明。
- 处理：为错误提示设置 `id="login-error"`；错误存在时，两个凭据输入框标记 `aria-invalid="true"` 并通过 `aria-describedby` 指向该错误。
- 测试：扩展 `login-page.test.ts`，覆盖空白凭据提交后 alert id、两个字段 invalid 状态和 describedby 关联。
- 验证：目标测试红绿通过，身份相邻测试通过；coverage、全量单测和 lint 均通过。
- 剩余风险：字段级错误尚未细分；当前仍采用表单级登录错误同时关联两个凭据字段。

## 登录失败后密码继续留在输入框

- 问题：`LoginPage.vue` 在 auth store reject 后显示错误但保留失败密码，敏感凭据会继续停留在页面 input 状态中。
- 处理：登录失败 catch 分支设置错误信息后清空 `password`，同时保留用户名方便用户重试。
- 测试：扩展 `login-page.test.ts`，覆盖登录失败后错误展示、用户名保留、密码清空和不跳转。
- 验证：目标测试红绿通过，身份相邻测试通过；coverage、全量单测和 lint 均通过。
- 剩余风险：失败后焦点管理尚未补测。

## 登录失败清空密码后焦点丢失

- 问题：`LoginPage.vue` 登录失败后会清空密码，但焦点停在 `body`，键盘用户无法直接输入新密码。
- 处理：为密码输入框增加模板 ref，登录失败清空密码后等待 DOM 更新并聚焦密码框。
- 测试：扩展 `login-page.test.ts`，把组件挂载到 `document.body`，断言失败后 `document.activeElement` 为密码输入框，并在 `finally` 中卸载组件。
- 验证：目标测试红绿通过，身份相邻测试通过；coverage、全量单测和 lint 均通过。
- 剩余风险：若未来拆分用户名/密码字段级错误，需重新审视失败后的焦点目标。
