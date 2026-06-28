# 2026-06-11 Plan: Security Evidence Refresh

## 目标

刷新 v1.0.0 安全自动证据，并明确人工发布闸门仍需人类验证。

## 执行顺序

1. 运行 security self-assessment。
2. 运行 Attack Chain automated support。
3. 新增并运行 `scripts/run-attack-chain-staging-transcript.ps1`，补充当前 staging 的 non-mutating HTTP transcript。
4. 新增并运行 `scripts/prepare-attack-chain-staging-accounts.ps1`，准备可审计 admin/operator 临时账号。
5. 新增并运行 `scripts/run-attack-chain-staging-account-probes.ps1`，补充 account-backed staging probes。
6. 新增并运行 `scripts/run-attack-chain-staging-audit-redaction-probe.ps1`，补充 audit redaction staging probe。
7. 修正并复跑 staging transcript 报告文案。
8. 运行真实 Chrome 前端 e2e 子集，补充 login/audit/monitoring/quality 浏览器证据。
9. 采集真实 Chrome login/audit/monitoring/quality 关键页面截图并记录 manifest。
10. 生成 Attack Chain human review packet 和 manual pending 报告。
11. 复核 hosted CI 分支口径，确认 GitHub 默认分支 `V1` 是否有当前 CI/Eval run。
12. 推送 `V1` 到 GitHub 并等待 hosted CI/Eval 完成。
13. 更新 security signoff / gray readiness 证据引用。
14. 生成 release human action packet。
15. 新增 security signoff 生成脚本并生成 pending 报告。
16. 强化 gray observation 脚本的 security signoff 前置校验，并生成 unsigned blocked 证据。
17. 补齐 Attack Chain staging 临时账号 cleanup dry-run，覆盖 admin/operator 与 audit redaction probe 样本用户。
18. 收紧 release gate audit 的 security signoff scope，避免独立 gray observation FAIL 误伤已签字的 security signoff。
19. 收紧 gray observation OBSERVING 启动证据校验，要求观察窗口起点与非占位 gray start evidence。
20. 收紧 gray observation 的 security signoff 前置校验，拒绝只有 `Status/Decision: SIGNED` 的薄签字包。
21. 收紧 Attack Chain manual verification 的占位拒绝，覆盖 verifier 与冒号尾部 evidence 占位。
22. 同步 release human action packet 与 Attack Chain human review packet，使人工执行说明匹配最新 guard。
23. 同步主 security signoff packet，使其要求脚本化有效 `Result: PASS` 签字包。
24. 收紧 security signoff 生成脚本的 Attack Chain 前置校验，要求 A/B/C 逐链 PASS 与 evidence。
25. 收紧 gray observation 的 evidence 占位拒绝，禁止 `UNSIGNED` / `FAIL` 作为可接受 evidence。
26. 运行 aggregate release gate audit。
27. 更新 CC plan 桥接页和 security signoff packet 引用。
28. Docker/网络恢复后复跑当前 release gate audit，确认自动项 PASS 且剩余失败项未漂移。
29. 收敛人工执行包引用与复跑审计模板，确保人工推进每个 gate 后能立即验证总审计状态。
30. 生成阶段一 Sprint 0-3 验收矩阵，避免 release gate 只覆盖 B-track 而遗漏 CC plan 验收项的审计追踪。
31. 对阶段一矩阵中的三项 `PARTIAL/INDIRECT` 做轻量证据收紧，新增独立报告并只升级有具体代码/测试锚点的行。
32. 复跑当前 release gate audit，并修正主 security signoff packet 中残留的旧 staging evidence 引用。
33. 修正当前可复用脚本入口的默认 staging evidence path，确保人工 signoff 和 Attack Chain transcript 默认使用 docker-restored staging 证据。
34. 补强 security signoff 生成脚本的引用证据 PASS 校验，防止缺 hosted CI/staging/security/frontend 等证据时薄签字。
35. 修正 release gate audit 脚本默认参数，确保无参审计也使用当前权威证据。
36. 修正 release gate audit 架构测试的默认报告锚点，确保测试约束读取当前默认审计报告而不是 2026-06-02 历史报告。
37. 补强 release human action packet 的 security signoff 命令，显式 pin 所有机器证据输入，避免人工执行依赖脚本默认值。
38. 修正 security signoff 报告正文的引用证据状态输出，确保缺证据时正文显示 FAIL 而不是硬编码 PASS。
39. 收紧 Hosted CI evidence 与 release gate audit，要求 Hosted CI 证据属于 `zenweb/AIMes` 仓库和 `V1` release 分支。
40. 收紧 Hosted CI evidence 与 release gate audit，要求 Hosted CI run head SHA 匹配当前 release commit SHA。
41. 对齐 Hosted CI required evidence 文案，使报告说明包含实际判定要求的 release repository、release branch 与 head SHA。
42. 对齐 PostgreSQL/staging required evidence 文案，使报告说明包含实际判定要求的 Production environment、PostgreSQL connection、Docker dependencies、EF migrations、API startup、`/live` 与 `/ready`。
43. 对齐 Security signoff required evidence 文案，使报告说明包含实际判定要求的 SIGNED decision、signer、SignedAt、evidence、self-assessment 与 Attack Chain A/B/C PASS。
44. 对齐 Gray observation required evidence 文案，使报告说明包含实际判定要求的 PASS gray release id、observation timestamps、14 calendar days、P0/P1=0 与 evidence。
45. 对齐 Attack Chain A/B/C required evidence 文案，使报告说明包含实际判定要求的 VERIFIED status、verifier、VerifiedAt、每链 Manual verification PASS 与非占位 evidence。
46. 重生成默认当前 release gate audit 报告，并用架构测试固定五项最新 Required evidence 文案，避免默认报告落后于脚本表格。
47. 补强 Sprint 0 五个核心模块持久化证据，新增 file-backed SQLite create-restart-query 测试并更新阶段一验收矩阵。
48. 补强 Sprint 3 sensitive audit fields redaction 证据，把矩阵从 prepared staging probe 口径升级为单元测试、endpoint 集成测试和架构守护。
49. 补强 Sprint 3 non-auth `/api/v1/*` authorization 证据，把运行时匿名拒绝测试从抽样 endpoint 扩展到 16 个真实非 auth API group endpoint。
50. 补强 Sprint 1 SignalR subscribe role boundary 证据，把矩阵从宽泛 Attack Chain A 支持升级为 `NotificationHub` 直接策略测试和架构守护。
51. 补强 Sprint 1 refresh tokens stored hashed 证据，把矩阵从宽泛 Attack Chain B 支持升级为 `AuthEndpoints` hash-storage 直接集成测试和架构守护。
52. 补强 Sprint 1 Login rate limit partitioned by IP + username 证据，把矩阵从宽泛 security self-assessment 升级为 middleware/order/partition key 直接单测和架构守护。
53. 补强 Sprint 1 Seeder does not create empty password hash 证据和领域约束，把矩阵从宽泛 security self-assessment 升级为 `EfDemoDataSeeder`/`PasswordHasher`/`SystemUser.Create`/登录集成测试直接证据。
54. 补强 Sprint 1 Admin default password removed and first-login change enforced 证据和启动日志实现，把矩阵从宽泛真实浏览器说明升级为“不广告默认凭据 + 首次改密强制”直接测试/架构守护。
55. 补强 Sprint 1 ChatPanel markdown/XSS 证据，把矩阵从宽泛 security self-assessment / real Chrome 说明升级为 escape-first renderer、unsafe HTML unit test、真实 Chrome XSS e2e 和架构守护。
56. 补强 Sprint 1 Anomaly frontend double-prefix 证据，把矩阵从宽泛 real Chrome frontend flows 升级为 baseURL-relative API wrapper、路径 unit test、真实 Chrome request-path e2e 和架构守护。
57. 补强 Sprint 0 Dashboard KPI no Random.Shared 证据，把矩阵从宽泛 endpoint random 扫描升级为 `DashboardKpiService` 确定性计算、真实 Chrome 后端响应原样展示 e2e 和架构守护。
58. 补强 Sprint 0 JWT signing key fail-closed 证据，把矩阵从宽泛 security self-assessment 升级为 `JwtOptions`/`ValidateOnStart()`/`SigningKeyStore` 直接实现锚点、缺 key/短 key 启动失败集成测试和架构守护。
59. 补强 Sprint 0 Production CORS not AllowAnyOrigin 证据，把矩阵从宽泛 Attack Chain C / staging transcript 升级为 `CorsOptions`/`AddCorsServices` Production policy 直接实现锚点、no-wildcard/缺 origin 集成测试和架构守护。
60. 补强 Sprint 3 quality gray monitoring UI 证据，把矩阵从宽泛 observability/staging health 说明升级为 `admin.spec.ts` 真实 Chrome R3 灰度监控指标用例、frontend evidence targeted rerun 和架构守护，并保留 release gray observation gate 边界。
61. 补强 Sprint 2 Anomaly create transaction rollback 证据，把矩阵从宽泛 UoW/audit layering gates 升级为 `AnomalyEndpoints.CreateAsync` UoW 顺序、`AuditLogRepository.AddAsync` 不自提交、notification failure 集成回滚测试和架构守护。
62. 补强 Sprint 2 Inventory StockOut transaction atomicity 证据，把矩阵从宽泛 UoW/audit layering gates 升级为 `InventoryAppService.StockOutAsync` UoW 顺序、`MaterialRepository.UpdateAsync` / `StockTransactionRepository.AddAsync` 不自提交、StockOut 成功提交/失败回滚集成测试和架构守护。
63. 补强 Sprint 2 critical list pagination 证据，把矩阵从宽泛 list app-service repository paging gates 升级为 Equipment/Admin/Scheduling page/pageSize 目标单测、Scheduling HTTP 分页集成测试和架构守护。
64. 补强 Sprint 3 Purchase submit/confirm/cancel validation filter 证据，把矩阵从宽泛 H9 gate 升级为 Purchase endpoint/filter/flow 直接证据和架构守护。
65. 补强 Sprint 3 OperationCanceledException handled separately 证据，把矩阵从宽泛 M11 gate 升级为 `ExceptionMiddleware` 取消异常处理、499/无 ProblemDetails 单测和架构守护。
66. Docker/网络恢复确认后复跑真实 Chrome release-critical 前端套件，确认 login/audit/monitoring/quality 证据未随环境恢复漂移。
67. 补强 Sprint 3 Domain state rules use `DomainRuleViolationException` 证据，把矩阵从宽泛 M12 gate 升级为 WorkOrder/Equipment/OperationExecution/Material 直接领域单测和架构守护。
68. 补强 Sprint 2 concurrency token 证据，把矩阵从 M7 模型元数据升级为 WorkOrder/Equipment/Material/SchedulePlan stale-update 集成测试和架构守护。
69. 补强 Sprint 2 `ScheduleRepository.GetAllAsync` split query / stable paging 证据，把矩阵从静态架构门升级为 SQLite 集成测试和架构守护。
70. Docker Desktop 在当前 Codex 会话内恢复后，复跑 PostgreSQL/staging rehearsal 与 release gate audit，确认自动 staging 门禁 fresh PASS，发布总门仍只卡三个人工/墙钟项。
71. 补强 Sprint 2 repository reads `AsNoTracking()` 证据，把矩阵从静态扫描升级为核心仓储读路径 `ChangeTracker.Entries()` 运行时断言和架构守护。
72. 补强 Sprint 3 target mutating endpoints audit 证据，把矩阵从 H7 静态扫描升级为静态端点链覆盖 + Employee/Admin 真实 HTTP endpoint audit 落库/脱敏测试和架构守护。
73. 补强 Sprint 3 `AuditEndpointFilter` 分层证据，把矩阵从 H3 静态 no-DbContext 扫描升级为直接 filter 单元测试，证明审计写入经 `IAuditLogAppService` 与 `IUnitOfWork`。
74. Docker/网络恢复确认后复跑 5 分钟 Demo 主链路真实 Chrome 证据，证明 Dashboard -> Scheduling -> Audit -> Report 当前仍可回放。

## Stop Condition

- 自动安全证据为 PASS。
- Staging transcript 明确哪些链路已由机器采集，哪些仍需人工账号。
- Account-backed probes 已采集 admin/operator 授权边界，且报告不写入密码。
- Audit redaction probe 已采集脱敏证据，且报告不写入明文密码。
- Real Chrome frontend evidence 已覆盖 user-critical auth/audit/monitoring/quality、Demo 主链路和 fail-loud no-forged-evidence 路径。
- Real Chrome screenshot evidence 已覆盖 login/audit/monitoring/quality，且截图前有 DOM 断言。
- Attack Chain human review packet 已列出人类 verifier 需要接受的 A/B/C 证据。
- Hosted CI 必须针对 GitHub 默认分支 `V1`；当前 `V1` hosted CI/Eval 已 PASS。
- Release human action packet 已准备，但仍保持 PREPARED_ONLY。
- Security signoff 生成脚本已准备，pending 报告明确 FAIL。
- Gray observation 脚本已阻止未签字启动，unsigned blocked 报告明确 FAIL。
- Staging cleanup dry-run 已准备，且默认不删除人工验证仍可能需要的临时/样本账号。
- Security signoff predicate 已通过目标架构测试、PowerShell parser 和临时样本验证：独立 Gray observation FAIL 不再误伤 signed signoff。
- Gray observation OBSERVING 已通过目标架构测试、PowerShell parser 和缺证据负例验证：观察中仍 FAIL，但必须保留可审计起点证据。
- Gray observation security signoff 前置校验已通过目标架构测试、PowerShell parser 和薄签字负例验证：灰度启动要求有效签字包，而不是两个 SIGNED 字样。
- Gray observation evidence 占位拒绝已通过目标架构测试、PowerShell parser 和 `Evidence: FAIL` 薄签字负例验证。
- Attack Chain manual verification 已通过目标架构测试、PowerShell parser 和占位负例验证：Verifier 与每链 evidence 必须是真实非占位值。
- Human action packet 已同步最新 guard：人工验证不填占位，gray start 必须等待有效 security signoff PASS。
- 主 security signoff packet 已同步最新 guard：手工薄签字不是有效 release gate evidence。
- Security signoff 生成脚本已通过目标架构测试、PowerShell parser 和薄 Attack Chain 负例验证：总体 VERIFIED/PASS 不足以触发签字。
- Attack Chain manual pending 明确 FAIL。
- Aggregate release gate 明确 FAIL，且剩余失败项为 Attack Chain manual、security signoff、gray observation。
- 当前 release gate audit 复跑明确 FAIL，且 Hosted CI / PostgreSQL-staging 为 PASS；剩余失败项仍只有 Attack Chain manual、security signoff、gray observation。
- 人工执行包已统一引用 docker-restored staging 证据，并提供 signoff 后、gray start 后、gray PASS 后的 release gate audit 复跑模板。
- 阶段一 Sprint 0-3 验收矩阵已生成，并明确区分 `PASS`、`PARTIAL/INDIRECT` 与 `HUMAN/WALL-CLOCK REQUIRED`。
- 阶段一原三项 `PARTIAL/INDIRECT` 已由 `_docs/_reports/phase-one-partial-evidence-tightening-20260611.md` 收紧为矩阵 `PASS`；仍不改变 Attack Chain manual、security signoff、gray observation 三个发布边界。
- 当前 release gate audit 已复跑；自动门禁仍 PASS，失败项仍只有人工/墙钟门禁。主 signoff packet 已统一使用 docker-restored staging 证据。
- 当前 signoff/transcript 脚本默认值也已统一使用 docker-restored staging 证据，历史快照报告不回写。
- Security signoff 引用证据 PASS 校验已通过目标架构测试、PowerShell parser、缺 staging evidence 负例，以及当前 release gate audit 复跑验证。
- Release gate audit 默认参数已通过目标架构测试、PowerShell parser 和无参审计负例验证：默认使用当前证据，且仍只失败三个人工/墙钟门禁。
- Release gate audit 架构测试锚点已通过双测试过滤器验证、PowerShell parser、旧 2026-06-02 锚点扫描和敏感串扫描。
- Release human action packet 的 security signoff evidence input pinning 已通过 RED/GREEN 架构测试、`run-security-signoff.ps1` parser、参数扫描、旧锚点扫描和敏感串扫描。
- Security signoff 动态 evidence status 已通过 RED/GREEN 架构测试、正式缺 staging evidence 负例、`run-security-signoff.ps1` parser、固定 PASS 文案扫描和敏感串扫描。
- Hosted CI repo/branch guard 已通过 RED/GREEN 架构测试、`run-hosted-ci-evidence.ps1` / `run-release-gate-audit.ps1` parser、错误分支负例、当前证据复跑审计、临时文件清理和敏感串扫描。
- Hosted CI head SHA guard 已通过 RED/GREEN 架构测试、`run-hosted-ci-evidence.ps1` / `run-release-gate-audit.ps1` parser、错误 HeadSha 负例、当前证据复跑审计、临时文件清理和敏感串扫描。
- Hosted CI required evidence 文案对齐已通过 RED/GREEN 架构测试、`run-hosted-ci-evidence.ps1` / `run-release-gate-audit.ps1` parser、当前证据复跑审计和敏感串扫描。
- PostgreSQL/staging required evidence 文案对齐已通过 RED/GREEN 架构测试、`run-release-gate-audit.ps1` parser、当前证据复跑审计和敏感串扫描。
- Security signoff required evidence 文案对齐已通过 RED/GREEN 架构测试、`run-release-gate-audit.ps1` parser、当前证据复跑审计和敏感串扫描。
- Gray observation required evidence 文案对齐已通过 RED/GREEN 架构测试、`run-release-gate-audit.ps1` parser、当前证据复跑审计和敏感串扫描。
- Attack Chain A/B/C required evidence 文案对齐已通过 RED/GREEN 架构测试、`run-release-gate-audit.ps1` parser、当前证据复跑审计和敏感串扫描。
- 默认当前 release gate audit 报告文案对齐已通过 RED/GREEN 架构测试、`run-release-gate-audit.ps1` parser、重生成 `_docs/_reports/release-gate-audit-20260611-default-current.md` 和敏感串扫描。
- Sprint 0 五个核心模块持久化恢复证据已通过目标集成测试和架构守护：`CoreModules_ShouldSurviveApplicationRestartAndRemainQueryable` PASS，`Sprint0CoreModulePersistence_ShouldHaveRestartRecoveryEvidence` PASS。
- Sprint 3 sensitive audit fields redaction 证据已通过目标单元测试、endpoint 集成测试和架构守护：`RedactAndSerialize_ShouldMaskNestedSensitiveFields` PASS，`CreateUser_ShouldRedactPasswordInAuditLog` PASS，`Sprint3AuditRedaction_ShouldHaveDirectUnitAndEndpointEvidence` PASS。
- Sprint 3 non-auth `/api/v1/*` authorization 证据已通过目标集成测试和架构守护：`ApiV1EndpointsExceptAuth_ShouldRejectAnonymousRequests` PASS，16 passed；`Sprint3ApiV1Authorization_ShouldHaveDirectAnonymousRejectionCoverage` PASS。
- Sprint 1 SignalR subscribe role boundary 证据已通过 RED/GREEN 架构守护和目标单元测试：`Sprint1SignalRSubscribeRoleBoundary_ShouldHaveDirectPolicyEvidence` 先因矩阵缺直接证据引用 FAIL，更新矩阵后 PASS；`CanSubscribe_WhenRoleDoesNotMatchChannel_ShouldReject|CanSubscribe_WhenRoleMatchesChannel_ShouldAllow` PASS。
- Sprint 1 refresh tokens stored hashed 证据已通过 RED/GREEN 架构守护和目标集成测试：`Sprint1RefreshTokens_ShouldHaveDirectHashStorageEvidence` 先因矩阵缺直接证据引用 FAIL，更新矩阵后 PASS；`Login_ShouldPersistOnlyHashedRefreshToken` PASS。
- Sprint 1 Login rate limit partitioned by IP + username 证据已通过 RED/GREEN 架构守护和目标单元测试：`Sprint1LoginRateLimit_ShouldHaveIpAndUsernamePartitionEvidence` 先因矩阵缺直接证据引用 FAIL，更新矩阵后 PASS；`AuthRateLimitPartitionKeyTests` PASS。
- Sprint 1 Seeder does not create empty password hash 证据已通过 RED/GREEN 领域单元测试、目标集成测试和架构守护：`Create_WhenPasswordHashIsEmpty_ShouldReject` 先 FAIL 后 PASS；`Login_WithValidCredentials_ShouldReturnToken` PASS；`Sprint1DemoSeeder_ShouldCreateNonEmptyHashedInitialPasswords` PASS。
- Sprint 1 Admin default password removed and first-login change enforced 证据已通过 RED/GREEN 架构守护、目标单元测试和目标集成测试：`Sprint1AdminDefaultPassword_ShouldNotBeAdvertisedAndFirstLoginShouldBeEnforced` 先因启动日志公开默认凭据 FAIL，修复后因矩阵缺锚点 FAIL，更新矩阵后 PASS；first-login domain/auth/admin endpoint 目标测试 PASS。
- Sprint 1 ChatPanel markdown/XSS 证据已通过目标 unit、真实 Chrome e2e 和架构守护：`chat-panel.test.ts` 39 passed；`npm run test:e2e -- chat.spec.ts -g "真实浏览器转义后端返回的 unsafe HTML 且只渲染受限 markdown"` 1 passed；`Sprint1ChatPanelMarkdownXss_ShouldHaveDirectEscapingEvidence` PASS。
- Sprint 1 Anomaly frontend double-prefix 证据已通过目标 unit、真实 Chrome e2e 和架构守护：`anomaly-api.test.ts` 1 passed；`npm run test:e2e -- anomaly.spec.ts -g "真实浏览器只请求单层 api/v1 anomaly 路径"` 首次因测试未关闭 offline demo mode FAIL，修正前置条件后 1 passed；`Sprint1AnomalyFrontendDoublePrefix_ShouldHaveDirectRouteEvidence` PASS。
- Sprint 0 Dashboard KPI no Random.Shared 证据已通过 RED/GREEN 架构守护和真实 Chrome e2e：`Sprint0DashboardKpi_ShouldHaveDirectRealBrowserDeterministicEvidence` 先因缺 dashboard 真实浏览器证据 FAIL，补 e2e、矩阵和 frontend evidence 后 PASS；`npm run test:e2e -- dashboard.spec.ts -g "真实浏览器按后端生产概览响应原样展示 KPI，不回退随机指标"` 1 passed。
- Sprint 0 JWT signing key fail-closed 证据已通过 RED/GREEN 架构守护和目标集成测试：`Sprint0JwtSigningKey_ShouldHaveDirectFailClosedStartupEvidence` 先因矩阵缺直接证据锚点 FAIL，更新矩阵后 PASS；`JwtStartupValidationTests` 2 passed。
- Sprint 0 Production CORS not AllowAnyOrigin 证据已通过 RED/GREEN 架构守护和目标集成测试：`Sprint0ProductionCors_ShouldHaveDirectNoWildcardEvidence` 先因矩阵缺直接证据锚点 FAIL，更新矩阵后 PASS；`CorsPolicyTests` 2 passed。
- Sprint 3 quality gray monitoring UI 证据已通过 RED 和真实 Chrome e2e：`Sprint3QualityGrayMonitor_ShouldHaveDirectRealBrowserEvidence` 先因 frontend evidence 缺 targeted rerun 章节 FAIL；`npm run test:e2e -- admin.spec.ts -g "R3 灰度发布进入 Agent 灰度监控指标"` 1 passed。
- Sprint 2 Anomaly create transaction rollback 证据已通过目标集成测试和 RED/GREEN 架构守护：`Create_WhenNotificationFails_ShouldRollbackAnomalyAndAudit` PASS；`Sprint2AnomalyCreateTransaction_ShouldHaveDirectRollbackEvidence` 修正签名 token 后先因矩阵缺直接证据锚点 FAIL，更新矩阵和证据报告后 PASS。
- Sprint 2 Inventory StockOut transaction atomicity 证据已通过目标集成测试和 RED/GREEN 架构守护：`Sprint2InventoryStockOutTransaction_ShouldHaveDirectAtomicEvidence` 先因矩阵缺直接证据锚点 FAIL，补矩阵后又因缺精确回滚断言 token FAIL，更新矩阵和证据报告后 PASS；`StockOutAsync_ShouldCommitMaterialUpdateAndTransactionThroughUnitOfWork|StockOutAsync_WhenTransactionWriteFails_ShouldNotPersistMaterialDecrement` PASS，2 passed。
- Sprint 2 critical list pagination 证据已通过目标测试和 RED/GREEN 架构守护：`Sprint2CriticalListPagination_ShouldHaveDirectPageSizeEvidence` 先因 Scheduling controller token 过严 FAIL，修正后因矩阵缺直接分页测试锚点 FAIL，更新矩阵和证据报告后 PASS；Equipment/Admin/Scheduling pageSize 单测复跑 PASS，3 passed；Scheduling HTTP 分页集成测试 PASS，1 passed。
- Sprint 3 Purchase state-change validation 证据已通过目标集成测试和 RED/GREEN 架构守护：`Sprint3PurchaseStateChangeValidation_ShouldHaveDirectEndpointEvidence` 先因矩阵缺直接 Purchase endpoint/filter/flow 证据锚点 FAIL，更新矩阵和证据报告后 PASS；`SubmitAndConfirm_ShouldTransitionStatus|Cancel_ShouldSetCancelled` PASS，2 passed。
- Sprint 3 OperationCanceledException handling 证据已通过目标单测和 RED/GREEN 架构守护：`Sprint3OperationCanceledException_ShouldHaveDirectMiddlewareEvidence` 先因矩阵缺直接 middleware/test 证据锚点 FAIL，更新矩阵和证据报告后 PASS；`InvokeAsync_WhenOperationCanceled_ShouldReturnClientClosedRequestWithoutProblemDetails` PASS，1 passed。
- Docker/网络恢复确认后的真实 Chrome release-critical 前端证据已复跑：`npm run test:e2e -- login.spec.ts audit.spec.ts monitoring.spec.ts quality.spec.ts` production build PASS，78 passed；该证据不关闭 Attack Chain manual、security signoff 或 gray observation。
- Sprint 3 DomainRuleViolationException 证据已通过 RED/GREEN 架构守护和目标单测：`Sprint3DomainRuleViolationException_ShouldHaveDirectDomainUnitEvidence` 先因领域测试只断言 `InvalidOperationException` / 矩阵缺直接锚点 FAIL；WorkOrder/Equipment/OperationExecution/Material 目标单测 PASS，89 passed；矩阵更新后由架构守护固定。
- Sprint 2 concurrency token 证据已通过 RED/GREEN 架构守护和目标集成测试：`Sprint2ConcurrencyTokens_ShouldHaveDirectUpdateConflictEvidence` 先因缺 stale-update 测试/矩阵锚点 FAIL；`ConcurrencyTokenTests` 首次因 EF1002 raw SQL 插值 FAIL，改为白名单 SQL + 参数化 id 后 PASS，4 passed；矩阵更新后由架构守护固定。
- Sprint 2 ScheduleRepository split-query/stable paging 证据已通过 RED/GREEN 架构守护和目标集成测试：`Sprint2ScheduleRepositoryPaging_ShouldHaveDirectSplitQueryEvidence` 先因矩阵缺直接 `ScheduleRepositoryTests` 锚点 FAIL；`GetAllAsync_UsesSplitQueryAndStablePagedOrdering` PASS，1 passed；矩阵更新后由架构守护固定。
- Docker current-session PostgreSQL/staging fresh evidence 已通过：`run-staging-rehearsal.ps1` 生成 `_docs/_reports/staging-rehearsal-20260611-docker-restored-current.md`，报告 `Result: PASS`，`/live` 与 `/ready` 均 HTTP 200。
- 使用 fresh staging 证据复跑 release gate audit 已通过边界确认：`_docs/_reports/release-gate-audit-20260611-after-docker-current-staging-rerun.md` 仍按预期 FAIL，且失败项只有 Attack Chain manual、security signoff、gray observation。
- Sprint 2 repository AsNoTracking 运行时证据已通过 RED/GREEN 架构守护和目标集成测试：`Sprint2RepositoryAsNoTracking_ShouldHaveDirectChangeTrackerEvidence` 先因缺 direct ChangeTracker evidence FAIL；`CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext` PASS，1 passed；矩阵更新后架构守护 PASS。
- Sprint 3 target mutating endpoint audit 证据已通过 RED/GREEN 架构守护和目标集成测试：`Sprint3TargetMutatingEndpoints_ShouldHaveDirectEndpointAuditEvidence` 先因矩阵/报告缺 direct endpoint audit 锚点 FAIL；`Create_ShouldPersistAuditLogFromEndpointFilter|CreateUser_ShouldRedactPasswordInAuditLog` PASS，2 passed；矩阵更新后架构守护 PASS。
- Sprint 3 AuditEndpointFilter layering 证据已通过 RED/GREEN 架构守护和目标单测：`Sprint3AuditEndpointFilterLayering_ShouldHaveDirectUnitEvidence` 先因缺 direct filter unit evidence FAIL；`Post_ShouldWriteAuditThroughAppServiceInsideUnitOfWork` PASS，1 passed；矩阵更新后架构守护 PASS。
- Docker/网络恢复后的 5 分钟 Demo 主链路真实 Chrome 证据已复跑：`npm run test:e2e -- tests/e2e/demo-smoke.spec.ts -g "Dashboard -> Scheduling -> Audit -> Report"` production build PASS，1 passed；该证据不关闭 Attack Chain manual、security signoff 或 gray observation。
