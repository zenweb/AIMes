# 2026-06-11 Issue: Security automated evidence refreshed, manual gates remain open

## 症状

- 旧安全证据仍指向 2026-06-07。
- Release gate 剩余项需要区分自动证据已 PASS 和人工闸门未关闭。

## 根因

Attack Chain 与 security signoff 被设计为人工发布闸门：自动化测试只能提供辅助证据，不能替代 verifier、VerifiedAt、signer 或灰度观察。

## 处置

- 刷新 2026-06-11 security self-assessment。
- 刷新 2026-06-11 Attack Chain automated support。
- 新增脚本并补充 2026-06-11 non-mutating staging transcript。
- 修复 staging transcript 报告 system user count 文案并复跑。
- 补充真实 Chrome 前端 e2e 证据、关键页面截图与 Attack Chain human review packet。
- 复核 Hosted CI 分支口径：GitHub 默认分支为 `V1`，但现有 hosted CI PASS 均在 `main`，不能证明当前 `V1`。
- 生成 2026-06-11 manual pending 报告并保留 FAIL。
- 生成 2026-06-11 aggregate release gate audit 并保留 FAIL。
- 补齐 staging 临时账号 cleanup dry-run，确保 admin/operator 与 audit redaction probe 样本用户可在人工验证后统一显式清理。
- 修复 release gate audit 对 security signoff 正文的过宽阻断扫描，避免把独立 Gray observation FAIL 误判为 security signoff FAIL。
- 补强 gray observation OBSERVING 启动证据校验，避免灰度开始后缺少观察窗口起点和启动证据。
- 补强 gray observation 对 security signoff 的前置校验，避免薄签字文件绕过 signer/evidence/Attack Chain PASS 要求。
- 补强 gray observation 的 evidence 占位拒绝，避免 `UNSIGNED` / `FAIL` 被当作可接受证据。
- 补强 Attack Chain manual verification 占位拒绝，避免 `Verifier=TBD` 或 `Chain A: TBD` 被误当成真实人工证据。
- 同步人工执行包与 human review packet，使文档说明匹配最新占位拒绝和有效 signoff PASS 前置条件。
- 同步主 security signoff packet，使其明确禁止手工薄签字并要求脚本化生成有效 `Result: PASS`。
- 补强 security signoff 生成脚本的 Attack Chain 前置校验，避免只有总体 VERIFIED/PASS 的薄 Attack Chain 报告触发签字。

## 当前状态

- 自动安全证据：PASS。
- Staging non-mutating transcript：PREPARED_ONLY。
- Staging account-backed probes：PREPARED_ONLY；admin/operator 授权边界已脚本化采集，Agent cross-domain action 仍需人工检查。
- Staging audit redaction probe：PREPARED_ONLY；审计脱敏证据已脚本化采集，仍需人工 verifier 接受。
- Real Chrome frontend evidence：PASS；login/audit/monitoring/quality 78 个真实浏览器 e2e 通过，Docker/网络恢复确认后 2026-06-11T21:21:18+08:00 复跑仍为 78 passed。
- Real Chrome demo main chain evidence：PASS；Docker/网络恢复确认后 `demo-smoke.spec.ts` 的 `Dashboard -> Scheduling -> Audit -> Report 可回放` 在生产构建 + Chrome 下 1 passed，已追加到 `_docs/_reports/frontend-real-browser-evidence-20260611.md`。
- Real Chrome screenshot evidence：PASS；login/audit/monitoring/quality 4 张截图已生成并记录 manifest。
- Attack Chain human review packet：PREPARED_ONLY；等待人类 verifier 接受或退回证据。
- Hosted CI on `V1`：PASS；CI run `27318467207` 与 Agent Evaluation run `27318467206` 均在 GitHub `V1` / `d8bb6e484f86a6fbd6673317385caf34ba774ee2` 成功。
- Release human action packet：PREPARED_ONLY；可执行材料已准备，但不能替代人类 verifier、signer 或 14 天墙钟观察。
- Security signoff automation：PREPARED_ONLY；脚本已准备，但当前 pending 报告仍 FAIL，等待 Attack Chain VERIFIED/PASS 与 signer。
- Gray observation guard：PREPARED_ONLY；脚本已阻止未签字 OBSERVING/PASS，等待 signoff 后才能开始灰度观察。
- Gray observation start evidence：PREPARED_ONLY；OBSERVING 现在也要求 `ObservationStartedAt` 与非占位 evidence，缺失样本按预期 FAIL。
- Gray observation thin signoff guard：PREPARED_ONLY；只有 `Status/Decision: SIGNED` 的薄签字样本按预期 FAIL。
- Gray observation fail-evidence signoff guard：PREPARED_ONLY；`Evidence: FAIL` 的薄签字样本按预期 FAIL。
- Attack Chain placeholder guard：PREPARED_ONLY；Verifier 占位与冒号尾部 evidence 占位样本按预期 FAIL。
- Human action packet consistency：PREPARED_ONLY；执行包已明确 Attack Chain 占位拒绝和 gray start 有效 signoff PASS 要求。
- Security signoff packet consistency：PREPARED_ONLY；主 signoff 包已明确 `scripts/run-security-signoff.ps1` 为签字入口，当前仍 `Result: FAIL`。
- Security signoff thin Attack Chain guard：PREPARED_ONLY；缺 A/B/C 逐链证据的薄 Attack Chain 样本按预期 FAIL。
- Staging cleanup：PREPARED_ONLY；`_docs/_reports/attack-chain-staging-cleanup-20260611-dry-run.md` 已列出三个临时/样本账号，但未执行删除。
- Release gate audit security signoff scope：PASS；临时样本证明 signed signoff 中提及独立 Gray observation FAIL 时，总审计只卡 Gray observation。
- Current release gate audit rerun：FAIL；`_docs/_reports/release-gate-audit-20260611-current-rerun.md` 证明 Hosted CI 与 PostgreSQL/staging PASS，失败项只有 Attack Chain manual、security signoff、gray observation。
- Human execution packet consistency：PREPARED_ONLY；`_docs/_reports/release-human-action-packet-20260611.md` 已统一 docker-restored staging 证据，并为 signoff、gray start、gray PASS 后提供审计复跑模板。
- Phase-one acceptance traceability：PASS for automated Sprint 0-3 matrix rows；`_docs/_reports/phase-one-sprint0-3-acceptance-matrix-20260611.md` 已补齐 Sprint 0-3 验收项到当前证据的映射，`_docs/_reports/phase-one-partial-evidence-tightening-20260611.md` 已把原三项 `PARTIAL/INDIRECT` 补到具体代码/测试锚点。发布边界仍不变。
- Signoff evidence drift：FIXED；主 security signoff packet 曾保留旧 staging report 引用，现已统一到 `_docs/_reports/staging-rehearsal-20260611-docker-restored.md`。
- Current script default drift：FIXED；`run-security-signoff.ps1` 和 `run-attack-chain-staging-transcript.ps1` 曾默认/输出旧 staging evidence path，现已统一到 docker-restored staging 证据。
- Thin signoff referenced-evidence gap：FIXED；`run-security-signoff.ps1` 曾只校验 Attack Chain 人工报告和 signer 字段，现已要求 hosted CI、PostgreSQL/staging、security self-assessment、Attack Chain automated support、真实 Chrome 前端证据均存在且 PASS。
- Release gate audit default drift：FIXED；`run-release-gate-audit.ps1` 默认参数曾指向 2026-06-02 旧证据，现在默认使用 2026-06-11 当前权威证据。
- Release gate audit test anchor drift：FIXED；`ReleaseGateAudit_ShouldAggregateAllBlockingBTrackEvidence` 曾仍读取 `_docs/_reports/release-gate-audit-20260602.md`，现已同步到 `_docs/_reports/release-gate-audit-20260611-default-current.md`。
- Release human action packet signoff input drift risk：FIXED；人工 security signoff 命令曾依赖脚本默认值承接部分机器证据路径，现已在 runbook 中显式 pin 全部 signoff 引用证据。
- Security signoff report hard-coded PASS text：FIXED；`run-security-signoff.ps1` 曾在报告正文硬编码引用证据 PASS 文案，现已改为按实际 evidence report 动态输出 PASS/FAIL。
- Hosted CI branch/repository spoofing risk：FIXED；release gate audit 曾未强制 Hosted CI evidence 属于 `zenweb/AIMes` 的 `V1` 分支，现已在 evidence script 和 audit predicate 中固定校验。
- Hosted CI stale head SHA risk：FIXED；release gate audit 曾未强制 Hosted CI run 的 `HeadSha` 匹配 release `CommitSha`，现已由 evidence script 和 audit predicate 双层校验。
- Hosted CI required evidence wording drift：FIXED；release gate audit 表格曾只写 RunUrl/RunId/job summary，现已同步包含 release repository、release branch 与 head SHA。
- PostgreSQL/staging required evidence wording drift：FIXED；release gate audit 表格曾只写 migrations 和 /live /ready，现已同步包含 Production 环境、PostgreSQL 连接、Docker 依赖和 API startup。
- Security signoff required evidence wording drift：FIXED；release gate audit 表格曾只写 signer 改 SIGNED，现已同步包含 signer、SignedAt、evidence、self-assessment 与 Attack Chain A/B/C PASS。
- Gray observation required evidence wording drift：FIXED；release gate audit 表格曾只写首次灰度和 P0/P1=0，现已同步包含 PASS 状态、gray release id、观察时间戳、14 天窗口和 evidence。
- Attack Chain A/B/C required evidence wording drift：FIXED；release gate audit 表格曾只写 verifier、timestamp 和 A/B/C evidence，现已同步包含 VERIFIED status、每链 Manual verification PASS 与非占位 evidence。
- Default current audit report wording drift：FIXED；`_docs/_reports/release-gate-audit-20260611-default-current.md` 曾保留旧 Required evidence 简写，现已重生成并由架构测试固定五项最新文案。
- Sprint 0 core module restart-recovery evidence gap：FIXED；五个核心模块持久化曾主要依赖静态扫描/间接证据，现已有 file-backed SQLite create-restart-query 集成测试和架构测试守护。
- Sprint 3 sensitive audit redaction prepared-only evidence gap：FIXED；矩阵曾只写 staging audit redaction probe prepared，现已引用敏感字段脱敏单元测试、Admin endpoint 审计脱敏集成测试和架构守护。
- Sprint 3 non-auth API authorization sampled evidence gap：FIXED；授权边界运行时测试曾只抽样 equipment/dashboard，现已覆盖 16 个真实非 auth `/api/v1/*` group endpoint 并由架构测试固定。
- Sprint 1 SignalR subscribe role boundary broad evidence gap：FIXED；矩阵曾只写 Attack Chain A automated support，现已引用 `NotificationHub.CanSubscribeToChannel` 直接 allow/reject 单测和架构守护。
- Sprint 1 refresh token hash-storage broad evidence gap：FIXED；矩阵曾只写 Attack Chain B automated support，现已引用 `AuthControllerTests.Login_ShouldPersistOnlyHashedRefreshToken` 直接验证 DB 存 hash、不存明文 token，并由架构测试固定。
- Sprint 1 login rate-limit broad evidence gap：FIXED；矩阵曾只写 security self-assessment，现已引用 `AuthRateLimitPartitionKeyTests` 直接验证 IP+username 分区、用户名规范化和 unknown fallback，并由架构测试固定 middleware 顺序和 Program policy。
- Sprint 1 seeder empty password hash domain gap：FIXED；`SystemUser.Create` 曾允许空 `passwordHash`，虽然当前 seeder 传入 `PasswordHasher.Hash(...)`，但领域入口没有防线；现已新增单元测试和领域校验，并由阶段一矩阵/架构测试固定。
- Sprint 1 startup default credential disclosure gap：FIXED；`Program.cs` 启动日志曾公开 `DefaultAccount=admin / admin123`，与“默认密码已移除”发布口径冲突；现已移除密码输出，并由架构守护固定不再广告默认凭据。
- Sprint 1 ChatPanel markdown/XSS broad evidence gap：FIXED；矩阵曾只引用宽泛 security self-assessment / real Chrome 证据，现已补直接 unit、真实 Chrome e2e 和架构守护，证明 unsafe backend HTML 被转义为文本且没有 `script`/`img` 节点落入助手消息 DOM。
- Sprint 1 Anomaly frontend double-prefix broad evidence gap：FIXED；矩阵曾只引用宽泛 real Chrome frontend flows，现已补 API wrapper 单测、真实 Chrome 请求路径 e2e 和架构守护，证明 anomaly 前端只请求单层 `/api/v1/anomaly`，不会回退到 `/api/v1/api/v1/anomaly`。
- Sprint 0 Dashboard KPI broad evidence gap：FIXED；矩阵曾只引用 endpoint `Random` 扫描和 hosted CI，现已补 `DashboardKpiService` 确定性计算锚点、真实 Chrome `/api/v1/dashboard` 响应原样展示用例和架构守护，证明 Dashboard KPI 不依赖随机/演示 fallback。
- Sprint 0 JWT signing-key broad evidence gap：FIXED；矩阵曾只引用 security self-assessment 和 hosted CI，现已补 `JwtOptions` / `ValidateOnStart()` / `SigningKeyStore` 直接实现锚点、缺 key/短 key 启动失败集成测试和架构守护，证明生产 JWT key 缺失或过短会 fail closed。
- Sprint 0 Production CORS broad evidence gap：FIXED；矩阵曾只引用 Attack Chain C automated support 和 staging transcript，现已补 `CorsOptions` / `AddCorsServices` Production policy 直接实现锚点、配置 origin 不通配与缺 origin 启动失败集成测试和架构守护，证明生产 CORS 不会 `AllowAnyOrigin`。
- Sprint 3 quality gray monitoring UI broad evidence gap：FIXED；矩阵曾只引用 observability 架构守护和 staging health，现已补 `admin.spec.ts` 真实 Chrome 用例、frontend evidence targeted rerun 和架构守护，证明 Agent 治理页展示 R3 灰度监控指标、audit id 与 trace id；该证据明确不关闭发布灰度 14 天观察闸门。
- Sprint 2 Anomaly create transaction broad evidence gap：FIXED；矩阵曾只写 ArchitectureTests UoW/audit layering gates 和 hosted CI，现已补 `AnomalyEndpoints.CreateAsync` 直接 UoW 包裹、`AuditLogRepository.AddAsync` 不自提交、notification failure 集成回滚测试和架构守护。
- Sprint 2 Inventory StockOut transaction broad evidence gap：FIXED；矩阵曾只写 ArchitectureTests UoW/audit layering gates 和 hosted CI，现已补 `InventoryAppService.StockOutAsync` 直接 UoW 顺序、`MaterialRepository.UpdateAsync` / `StockTransactionRepository.AddAsync` 不自提交、StockOut 成功提交与 transaction write failure 回滚集成测试和架构守护。
- Sprint 2 critical list pagination broad evidence gap：FIXED；矩阵曾只写 list app-service repository paging gates 和 hosted CI，现已补 Equipment/Admin/Scheduling page/pageSize 直接单测、Scheduling HTTP 分页集成测试和架构守护。
- Sprint 3 Purchase state-change validation broad evidence gap：FIXED；矩阵曾只写 H9 purchase validation gate 和 hosted CI，现已补 Purchase submit/confirm/cancel endpoint filter 链、`ValidationEndpointFilter` 行为、Purchase 状态流转集成测试和架构守护。
- Sprint 3 OperationCanceledException broad evidence gap：FIXED；矩阵曾只写 M11 exception middleware gate 和 hosted CI，现已补 `ExceptionMiddleware` 取消异常处理直接实现锚点、499/无 ProblemDetails 单测和架构守护。
- Sprint 3 DomainRuleViolationException broad evidence gap：FIXED；矩阵曾只写 M12 domain rule gate，且核心领域单测多处只断言 `InvalidOperationException` 基类；现已补 WorkOrder/Equipment/OperationExecution/Material 直接 `DomainRuleViolationException` 单测和架构守护。
- Sprint 2 concurrency token metadata-only evidence gap：FIXED；矩阵曾只写 M7 模型配置和 hosted CI，现已补 WorkOrder/Equipment/Material/SchedulePlan stale-update 集成测试，证明旧版本保存会抛 `DbUpdateConcurrencyException`。
- Sprint 2 ScheduleRepository static-only evidence gap：FIXED；矩阵曾只写静态 AsSplitQuery/stable paging 架构门，现已补 SQLite 集成测试证明 split SQL、稳定分页和 include items 运行时行为。
- Docker current-session staging evidence：PASS；Docker Desktop 在当前 Codex 会话内恢复后，`_docs/_reports/staging-rehearsal-20260611-docker-restored-current.md` 证明 PostgreSQL/staging rehearsal fresh PASS。
- Current release gate audit with fresh staging：FAIL_EXPECTED；`_docs/_reports/release-gate-audit-20260611-after-docker-current-staging-rerun.md` 证明 Hosted CI 与 PostgreSQL/staging PASS，失败项仍只有 Attack Chain manual、security signoff、gray observation。
- Sprint 2 repository AsNoTracking static-only evidence gap：FIXED；矩阵曾只引用静态 `RepositoryReadQueries_ShouldUseAsNoTracking` 和 hosted CI，现已补 `RepositoryAsNoTrackingTests.CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext`，证明核心仓储代表性读路径运行后不留下 tracked entities。
- Sprint 3 target mutating endpoint audit static-only evidence gap：FIXED；矩阵曾只引用 H7 静态 endpoint filter gate，现已补 Employee/Admin 两条真实 HTTP endpoint audit 落库/脱敏测试，并由 `Sprint3TargetMutatingEndpoints_ShouldHaveDirectEndpointAuditEvidence` 固定。
- Sprint 3 AuditEndpointFilter layering static-only evidence gap：FIXED；矩阵曾只引用 H3 静态 no-DbContext gate，现已补直接 filter 单测证明审计写入经 `IAuditLogAppService` 和 `IUnitOfWork`，并由 `Sprint3AuditEndpointFilterLayering_ShouldHaveDirectUnitEvidence` 固定。
- Real Chrome demo main chain current evidence gap：FIXED；2026-06-11 主前端证据曾覆盖 login/audit/monitoring/quality 和多个定向安全路径，但 Docker/网络恢复后的 5 分钟 Demo 主链路仍只在旧 2026-06-07 报告中。现已复跑 `demo-smoke.spec.ts`，证明 Dashboard -> Scheduling -> Audit -> Report 当前 production preview + Chrome 仍可回放。
- 人工 Attack Chain：FAIL。
- Security signoff：FAIL。
- Gray observation：FAIL。
