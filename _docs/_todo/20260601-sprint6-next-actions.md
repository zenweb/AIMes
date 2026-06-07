# 2026-06-01 Sprint 6 下一步

## 已完成

- 6.6 局部：扩展 `login-page.test.ts`，覆盖登录失败后用户编辑密码必须清理 stale error。
- 6.6 局部：`LoginPage.vue` 在用户名/密码输入变化时清理已有错误，避免旧 alert 和字段 invalid 状态滞留。
- 已验证：红灯为编辑密码后 `[role="alert"]` 仍存在；修复后 `login-page.test.ts` `9/9 passed`。
- 已验证：相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。

## 下一步

- 继续推进 6.6：转向其他 0 覆盖关键组件，或继续补登录页字段级错误策略。
- 继续补前端页面/组件覆盖率后再评估下一次 coverage threshold 提升。
- 发布级证据仍缺 hosted CI、PostgreSQL/staging、首次灰度、安全签字和 2 周无 P0/P1 观察窗口，不能标记 v1.0.0 完成。

## 2026-06-01 6.6 Login Page Validation Focus Recovery 更新

- 已完成：扩展 `login-page.test.ts`，覆盖纯空白凭据提交后焦点必须回到用户名输入框。
- 已完成：`LoginPage.vue` 为用户名输入框增加 `ref`，空白校验失败后 `nextTick` 聚焦用户名。
- 已验证：红灯为 `document.activeElement` 仍是 `body`；修复后 `login-page.test.ts` `10/10 passed`。
- 已验证：相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 下一步：继续补 6.6 高价值组件/页面测试，或评估登录页字段级错误策略；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-06-01 6.6 Login Page First Invalid Field Focus 更新

- 已完成：扩展 `login-page.test.ts`，覆盖用户名有效但密码空白时，校验失败焦点必须落到密码输入框。
- 已完成：`LoginPage.vue` 空白校验失败后按第一个缺失字段选择焦点目标。
- 已验证：红灯为焦点仍在 `#username`；修复后 `login-page.test.ts` `11/11 passed`。
- 已验证：相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 下一步：继续补 6.6 高价值组件/页面测试；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-06-01 6.6 Login Page Field-Level Invalid State 更新

- 已完成：扩展 `login-page.test.ts`，覆盖用户名有效但密码空白时，只有密码字段应被标记 invalid。
- 已完成：`LoginPage.vue` 增加字段级 invalid 状态，空白校验只关联缺失字段；登录接口失败仍按凭证组合错误关联两个字段。
- 已验证：红灯为 `#username` 仍带 `aria-invalid="true"`；修复后 `login-page.test.ts` `12/12 passed`。
- 已验证：相邻身份测试 `11/11 passed`，coverage `45 files / 219 tests passed`，full unit `45 files / 219 tests passed`，lint 通过。
- 下一步：转向其他 0 覆盖关键组件或页面入口补 6.6 高价值测试；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-06-01 6.6 MainLayout Mobile Menu A11y 更新

- 已完成：新增 `main-layout.test.ts`，覆盖移动菜单按钮必须通过 `aria-expanded` 暴露开合状态，并通过 `aria-controls` 关联菜单面板。
- 已完成：`MainLayout.vue` 为移动菜单按钮和面板增加稳定可访问性关联，不改变菜单开合业务逻辑。
- 已验证：修正测试夹具后红灯为 `aria-expanded` 缺失；修复后 MainLayout 测试 `1/1 passed`。
- 已验证：登录页相邻测试 `12/12 passed`，coverage `46 files / 220 tests passed`，full unit `46 files / 220 tests passed`，lint 通过；总行/语句覆盖率提升到 `24.19%`。
- 下一步：继续补壳层退出登录、暗色模式持久化或其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-06-01 Claude Opus 4.8 外审后路由更新

- 已采纳：6.6 后续选片使用覆盖率杠杆规则，优先处理“低覆盖且用户必经”的组件，不再继续精修已 `100%` 覆盖的 LoginPage。
- 已核对：`coverage-summary.json` 显示总行/语句覆盖率 `24.19%`；`ScheduleBoard.vue` 为 `0.00%` 行覆盖、约 `2771` 行，是当前最大且核心的 0 覆盖组件。
- 下一步 A 轨：进入 `ScheduleBoard.vue` 首个高价值组件测试切片，优先覆盖 `/scheduling` 首屏业务承诺或关键入口。
- 下一步 B 轨：单独追踪 hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口；这些不能由前端单测替代。

## 2026-06-01 6.6 ScheduleBoard Optimize Error Alert 更新

- 已完成：新增 `schedule-board.test.ts`，覆盖排产优化失败后错误横幅必须以 alert 语义暴露。
- 已完成：`ScheduleBoard.vue` 为 `.error-banner` 增加 `role="alert"` 和 `aria-live="assertive"`，不改变优化和演示 fallback 逻辑。
- 已验证：目标红灯为 `.error-banner` 已显示 `优化失败: optimizer unavailable` 但找不到 `[role="alert"]`；修复后 ScheduleBoard 测试 `1/1 passed`。
- 已验证：相邻登录/壳层测试 `13/13 passed`，coverage `47 files / 221 tests passed`，full unit `47 files / 221 tests passed`，lint 通过；总行/语句覆盖率提升到 `36.51%`，`ScheduleBoard.vue` 行覆盖 `46.62%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 0 覆盖且用户必经组件，候选包括 `AdminBoard.vue`、`ReportBoard.vue`、`ProductionBoard.vue` 或继续补 `ScheduleBoard.vue` 的关键采纳/事件队列路径。
- 下一步 B 轨：hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍待单独补证。

## 2026-06-01 6.6 ProductionBoard Scan Miss Alert 更新

- 已完成：按覆盖率杠杆转向 `ProductionBoard.vue`，它当前为 `0.00%` 行覆盖且 `/production` 是生产报工用户必经入口。
- 已完成：新增 `production-board.test.ts`，覆盖扫码查不到工单/工序时错误通知必须以 alert 语义暴露。
- 已完成：`ProductionBoard.vue` 为错误通知增加 `role="alert"` / `aria-live="assertive"`，成功通知使用 `role="status"` / `aria-live="polite"`。
- 已验证：目标红灯为通知文本已出现但缺少 `[role="alert"]`；修复后 ProductionBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `15/15 passed`，coverage `48 files / 222 tests passed`，总行/语句覆盖率 `39.58%`，`ProductionBoard.vue` 行覆盖 `52.36%`，full unit `48 files / 222 tests passed`，lint 通过。
- 下一步 A 轨：继续补 `ProductionBoard.vue` 的开工资质阻断、完工回写、异常上报，或转向同为 0 覆盖的 `ReportBoard.vue` / `AdminBoard.vue`。
- 下一步 B 轨：hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍待单独补证。

## 2026-06-01 6.6 ProductionBoard Start Block Reason 更新

- 已完成：扩展 `production-board.test.ts`，覆盖热处理工序存在未闭环资质阻断时，禁用的“确认开工”按钮必须关联阻断原因。
- 已完成：`ProductionBoard.vue` 在开工资质 `blocked` 时渲染 `#start-qualification-block-reason`，并让确认按钮通过 `aria-describedby` 指向该说明。
- 已验证：目标红灯为禁用按钮缺少 `aria-describedby`；修复后 ProductionBoard 测试 `2/2 passed`。
- 已验证：相邻组合 `16/16 passed`，full unit `48 files / 223 tests passed`，coverage `48 files / 223 tests passed`，总行/语句覆盖率 `39.88%`，`ProductionBoard.vue` 行覆盖 `58.74%`，lint 通过。
- 下一步 A 轨：继续补 `ProductionBoard.vue` 的替班放行开工、完工回写、异常上报，或按覆盖率杠杆转向 `AdminBoard.vue` / `ReportBoard.vue`。
- 下一步 B 轨：hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍待单独补证。

## 2026-06-01 B 轨 Hosted CI Root Workflow 更新

- 已完成：确认当前 git 仓库根为 `C:\AIWorks\AIMes\v1`，远端为 `https://git.code.tencent.com/zenweb/AIMes.git`；仓库外层 `.github/workflows` 不能作为 hosted CI 发布证据。
- 已完成：恢复仓库根 `.github/workflows/ci.yml` 和 `.github/workflows/eval.yml`，并将 workflow 路径从旧 `v1/...` 模式改为当前仓库根相对路径。
- 已完成：H20 架构门和 `frontend-ci-coverage.test.ts` 改为读取仓库根 `.github/workflows/ci.yml`。
- 已验证：H20 架构门红灯为仓库根 CI 缺失，修复后 `1/1 passed`；前端 CI coverage 测试红灯为 `ENOENT`，修复后 `2/2 passed`。
- 已核对：当前环境 `gh repo view` / `gh run list` 失败于未登录 GitHub CLI，`git ls-remote --heads origin` 返回 `remote error: Git:Project not found.`，所以本机无法补远端 hosted run 证据。
- 下一步 B 轨：触发远端 hosted CI，保存 run URL / run id / job 摘要；没有远端 run 结果前，hosted CI 闸门只能算配置已就绪，不能算发布通过。

## 2026-06-01 B 轨 PostgreSQL/Staging Runbook Policy 更新

- 已完成：修正 `_docs/SOP.md`，移除现役目录树里的 `db/init.sql`，并把 API 启动性能描述改为已完成 schema 校验。
- 已完成：修正 `db/README.md` Docker 步骤，明确 Production 先显式执行 `dotnet ef database update`，再启动 API；pending migration 时 API 拒绝启动。
- 已验证：runbook policy 架构测试红灯先失败于 SOP 仍引用 `db/init.sql`；修复后 `ReleaseRunbooks_ShouldRequireExplicitProductionMigrationAndAvoidLegacyInitSql` `1/1 passed`。
- 已验证：H20 hosted CI 架构门 + PostgreSQL/staging runbook policy 合并过滤运行 `2/2 passed`。
- 下一步 B 轨：在真实 PostgreSQL/staging 环境按 runbook 实跑，保存迁移输出、API `/live` `/ready` 健康检查结果、脱敏连接串/环境摘要和操作时间戳。
- 仍待发布闸门：hosted CI run URL/run id、PostgreSQL/staging 实跑、首次灰度、安全签字、2 周无 P0/P1 观察窗口。

## 2026-06-01 B 轨 PostgreSQL/Staging Rehearsal Evidence Script 更新

- 已完成：新增 `scripts/run-staging-rehearsal.ps1`，把 staging 演练步骤固化为可复跑脚本。
- 已完成：新增架构门 `StagingRehearsal_ShouldHaveExecutableEvidenceScript`，要求脚本包含依赖启动、显式 EF migration、API 启动、`/live` `/ready` 和 `_docs/_reports` 证据输出。
- 已验证：脚本缺失时目标架构测试红灯；补脚本后目标测试 `1/1 passed`，与 runbook policy 合并过滤运行 `2/2 passed`。
- 已验证：PowerShell parser 检查 `scripts/run-staging-rehearsal.ps1` 通过。
- 本机实跑：`_docs/_reports/staging-rehearsal-20260601-local.md` 已生成，结果为 `FAIL`，失败点是 `docker` 命令不存在。
- 下一步 B 轨：在安装 Docker 且能访问 staging 依赖的环境运行 `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-YYYYMMDD-<env>.md`，拿到 `Result: PASS` 后再评估 staging 闸门。

## 2026-06-01 B 轨 Security Self-Assessment High/Critical 更新

- 已完成：修正 `scripts/run-security-self-assessment.ps1` 的 NuGet 漏洞解析，避免中文 clean 输出误判，并兼容 Windows PowerShell。
- 已完成：后端 NuGet high 阻断已修复，`System.IO.Packaging` pin 到 `8.0.1`，`RabbitMQ.Client` 提升到 `7.2.0`，并启用 central transitive pinning。
- 已完成：前端 `nuxt` 升到 `3.21.6`，移除旧 `nuxi` / `nitropack` override，并用 `js-beautify -> glob ^10.5.0` override 清掉 npm high/critical。
- 已验证：`_docs/_reports/security-self-assessment-20260601-local.md` 为 `Result: PASS`；`npm audit --audit-level=high` 退出 `0`；`npm ls glob nuxt` 退出 `0`；前端 unit/lint/build 均通过。
- 下一步 B 轨：人工执行 Attack Chain A/B/C 验证，补手工请求样例、日志/审计 payload 复核、配置复核证据，然后由 human signer 更新 `20260601-security-signoff.md`；当前不得把 `Status: UNSIGNED` 改为 signed。
- 剩余发布闸门：hosted CI run URL/run id、真实 PostgreSQL/staging PASS、首次灰度、安全签字、2 周无 P0/P1 观察窗口。

## 2026-06-01 B 轨 Gray Observation Evidence Gate 更新

- 已完成：新增 `scripts/run-gray-observation.ps1`，把首次灰度和 2 周无 P0/P1 观察窗口固化为可复跑证据脚本。
- 已完成：新增 `_docs/_reports/gray-observation-20260601.md`，当前状态为 `Status: NOT_STARTED`，结果为 `Result: FAIL`。
- 已验证：`GrayObservationGate_ShouldHaveEvidencePacketAndFailLoudUntilObservationCompletes` 先红后绿；PowerShell parser 通过；默认脚本执行会生成 FAIL 报告并抛错。
- 下一步 B 轨：首次灰度真正开始时，用 `-Status OBSERVING -GrayReleaseId <id> -GrayStartedAt <timestamp>` 生成观察中报告；观察满 14 天且 P0/P1 均为 0 后，才能用 `-Status PASS` 生成发布证据。
- 剩余发布闸门：hosted CI run URL/run id、真实 PostgreSQL/staging PASS、首次灰度 PASS 观察报告、安全签字。

## 2026-06-01 B 轨 Hosted CI Remote Run Evidence Gate 更新

- 已完成：新增 `scripts/run-hosted-ci-evidence.ps1`，把 hosted CI run URL/run id 固化为可复跑证据脚本。
- 已完成：新增 `_docs/_reports/hosted-ci-20260601.md`，当前状态为 `Status: MISSING_REMOTE_RUN`，结果为 `Result: FAIL`。
- 已验证：`HostedCiRunGate_ShouldHaveEvidenceScriptAndFailLoudWithoutRemoteRun` 先红后绿；PowerShell parser 通过；默认脚本执行会生成 FAIL 报告并抛错。
- 下一步 B 轨：在有远端权限的环境触发 hosted CI，拿到 run URL / run id / job 摘要后运行 `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-hosted-ci-evidence.ps1 -RunUrl <url> -RunId <id> -CommitSha <sha> -Evidence <job-summary>`。
- 剩余发布闸门：hosted CI PASS 证据、真实 PostgreSQL/staging PASS、首次灰度 PASS 观察报告、安全签字。

## 2026-06-01 B 轨 Attack Chain Manual Verification Gate 更新

- 已完成：新增 `scripts/run-attack-chain-verification.ps1`，把 Attack Chain A/B/C 手工验证固化为安全签字前置证据脚本。
- 已完成：新增 `_docs/_reports/attack-chain-verification-20260601.md`，当前状态为 `Status: PENDING_MANUAL_VERIFICATION`，结果为 `Result: FAIL`。
- 已验证：`AttackChainManualVerification_ShouldHaveEvidenceScriptAndFailLoudUntilVerified` 先红后绿；PowerShell parser 通过；默认脚本执行会生成 FAIL 报告并抛错。
- 下一步 B 轨：由 human verifier 手工验证 Attack Chain A/B/C，补 verifier、verified timestamp、三条 evidence 后再重新运行脚本；只有脚本 `Result: PASS` 后，human signer 才能评估是否更新 `20260601-security-signoff.md`。
- 剩余发布闸门：hosted CI PASS 证据、真实 PostgreSQL/staging PASS、首次灰度 PASS 观察报告、安全签字。

## 2026-06-01 6.6 AdminBoard Tabs A11y 更新

- 已完成：按覆盖率杠杆转向 `AdminBoard.vue`，它当前为最大 0 覆盖组件，且 `/admin` 是用户、角色、配置和 Agent 治理入口。
- 已完成：新增 `admin-board.test.ts`，覆盖系统管理分区切换必须以 `tablist` / `tab` / `aria-selected` 暴露当前分区。
- 已完成：`AdminBoard.vue` 为六个分区按钮补充可访问性 tab 语义，不改变数据加载或业务动作。
- 已验证：目标红灯为缺少 `[role="tablist"]`；修复后 AdminBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `17/17 passed`，scoped lint 通过，full unit `49 files / 224 tests passed`，coverage `49 files / 224 tests passed`；总行/语句覆盖率提升到 `44.31%`，`AdminBoard.vue` 行覆盖 `84.70%`。
- 已追补：`npm run lint` 初次全量执行曾超时；分段定位均通过后，最终重跑 `npm run lint` 通过。
- 下一步 A 轨：继续按覆盖率杠杆转向 `ReportBoard.vue`、`AuditDecisionReplayPanel.vue`、`PurchaseBoard.vue` 等仍为 0 覆盖的用户关键入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、首次灰度 PASS 观察报告、安全签字仍待单独补证。

## 2026-06-01 6.6 ReportBoard KPI Tabs A11y 更新

- 已完成：按覆盖率杠杆转向 `ReportBoard.vue`，它当前为最大 0 覆盖组件，且 `/report` 是 POC/经营复盘和导出入口。
- 已完成：新增 `report-board.test.ts`，覆盖 OTD KPI 钻取维度 tabs 必须用 `aria-selected` 暴露当前维度。
- 已完成：`ReportBoard.vue` 为 KPI 维度 tab 补充动态 `aria-selected`，不改变钻取筛选、承诺包生成或导出逻辑。
- 已验证：目标红灯为 `aria-selected` 缺失；修复后 ReportBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `18/18 passed`，scoped lint 通过，full lint 通过，full unit `50 files / 225 tests passed`，coverage 单独复跑 `50 files / 225 tests passed`；总行/语句覆盖率提升到 `48.19%`，`ReportBoard.vue` 行覆盖 `78.98%`。
- 调试记录：并行跑 full unit 与 coverage 时，coverage 进程曾在 `auth.store.test.ts` 出现 2 个失败；单独复跑 full unit/coverage 均通过，当前按并发干扰记录，不作为 ReportBoard 阻断。
- 下一步 A 轨：继续按覆盖率杠杆转向 `AuditDecisionReplayPanel.vue`、`PurchaseBoard.vue`、`DashboardBoard.vue` 等仍为 0 覆盖的关键入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、首次灰度 PASS 观察报告、安全签字仍待单独补证。

## 2026-06-01 6.6 DashboardBoard Command Journey A11y 更新

- 已完成：按覆盖率杠杆转向 `DashboardBoard.vue`，它本轮前为 `0.00%` 行覆盖，且 `/dashboard` 是生产运营控制塔与五步主线入口。
- 已完成：新增 `dashboard-board.test.ts`，覆盖 AI MES 指挥中心五步主线必须以有名称的有序列表暴露。
- 已完成：`DashboardBoard.vue` 将 `.command-grid` 改为 `ol[aria-label="AI MES 指挥中心主线"]`，并为每个步骤补 `li` 结构，不改变卡片链接或业务逻辑。
- 已验证：目标红灯为缺少 `[aria-label="AI MES 指挥中心主线"]`；修复后 DashboardBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `3/3 passed`，lint 通过，full unit `51 files / 226 tests passed`，coverage `51 files / 226 tests passed`；总行/语句覆盖率提升到 `50.07%`，`DashboardBoard.vue` 行覆盖 `95.34%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `AuditDecisionReplayPanel.vue`、`PurchaseBoard.vue`、`QualityBoard.vue` 或其他仍为 0 覆盖且用户关键的组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、首次灰度 PASS 观察报告、安全签字仍待单独补证；A 轨覆盖率达 `50.07%` 不能关闭发布闸门。

## 2026-06-01 6.6 PurchaseBoard Create Dialog A11y 更新

- 已完成：按覆盖率杠杆转向 `PurchaseBoard.vue`，它本轮前为 `0.00%` 行覆盖，且 `/purchase` 是缺料采购协同和供应风险闭环入口。
- 已完成：新增 `purchase-board.test.ts`，覆盖点击“+ 新建”后新建采购订单表单必须以带标题关联的 modal dialog 暴露。
- 已完成：`PurchaseBoard.vue` 为新建采购单弹窗补 `role="dialog"`、`aria-modal="true"` 和 `aria-labelledby="create-purchase-order-title"`。
- 已验证：目标红灯为缺少 `[role="dialog"]`；修复后 PurchaseBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `3/3 passed`，lint 通过，full unit `52 files / 227 tests passed`，coverage `52 files / 227 tests passed`；总行/语句覆盖率提升到 `53.60%`，`PurchaseBoard.vue` 行覆盖 `66.04%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `AuditDecisionReplayPanel.vue`、`QualityBoard.vue`、`QualityCapaTaskPanel.vue` 等仍为 0 覆盖的关键入口；或补 `PurchaseBoard.vue` 收货弹窗同类 dialog 语义。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、首次灰度 PASS 观察报告、安全签字仍待单独补证；A 轨覆盖率达 `53.60%` 不能关闭发布闸门。

## 2026-06-01 6.6 AuditDecisionReplayPanel Replay Selection A11y 更新

- 已完成：采纳 Claude Opus 4.8 外援建议，将 A 轨选片硬规则更新为“当前覆盖率最低且用户关键/发布证据相关优先”，不再精修已高覆盖组件。
- 已完成：按覆盖率杠杆转向 `AuditDecisionReplayPanel.vue`，它本轮前为 `0.00%` 行覆盖，且支撑 AI 决策审计、证据链回放和安全/审计可视化。
- 已完成：新增 `audit-decision-replay-panel.test.ts`，覆盖当前“回放决策链”按钮必须用 `aria-pressed` 暴露选中状态。
- 已完成：`AuditDecisionReplayPanel.vue` 为 `.replay-btn` 增加动态 `aria-pressed`，不改变审计读取或回放详情逻辑。
- 已验证：目标红灯为 `aria-pressed` 缺失；修复后 AuditDecisionReplayPanel 测试 `1/1 passed`。
- 已验证：相邻组合 `3/3 passed`，lint 通过，full unit `53 files / 228 tests passed`，coverage `53 files / 228 tests passed`；总行/语句覆盖率提升到 `54.83%`，`AuditDecisionReplayPanel.vue` 行覆盖 `35.86%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `QualityBoard.vue`、`QualityCapaTaskPanel.vue`、`MonitoringBoard.vue`、`KnowledgeGovernancePanel.vue` 等仍为 0 覆盖的关键入口；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `54.83%` 不能关闭发布闸门。

## 2026-06-01 6.6 QualityBoard Root Cause Dialog A11y 更新

- 已完成：按覆盖率杠杆转向 `QualityBoard.vue`，它本轮前为 `0.00%` 行覆盖，且 `/quality` 是质量处置、CAPA、MRB 与审计定位入口。
- 已完成：新增 `quality-board.test.ts`，覆盖点击“根因分析”后根因分析浮动面板必须以带标题关联的 modal dialog 暴露。
- 已完成：`QualityBoard.vue` 为 `.analysis-panel` 增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="root-cause-analysis-title"`，并给标题设置稳定 id。
- 已验证：目标红灯为缺少 `[role="dialog"]`；修复后 QualityBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `3/3 passed`，lint 通过，full unit `54 files / 229 tests passed`，coverage `54 files / 229 tests passed`；总行/语句覆盖率提升到 `59.76%`，`QualityBoard.vue` 行覆盖 `80.98%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `MonitoringBoard.vue`、`KnowledgeGovernancePanel.vue`、`SkillMatrixPanel.vue`、`DocumentUpload.vue`、`RiskActionQueuePanel.vue` 等仍为 0 覆盖的关键入口；`QualityCapaTaskPanel.vue` 已因 QualityBoard 挂载进入覆盖，不应只按旧 0 覆盖列表重复切。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `59.76%` 不能关闭发布闸门。

## 2026-06-01 6.6 MonitoringBoard Equipment Drawer A11y 更新

- 已完成：按覆盖率杠杆转向 `MonitoringBoard.vue`，它本轮前为 `0.00%` 行覆盖，且 `/monitoring` 是生产实时监控、现场态势和 Hypercare 观察入口。
- 已完成：新增 `monitoring-board.test.ts`，覆盖设备卡片必须可键盘聚焦并通过 Enter 打开带标题关联的详情 dialog。
- 已完成：`MonitoringBoard.vue` 为设备卡片补 `role="button"`、`tabindex="0"`、`aria-label`、Enter/Space 键入口，并为设备详情抽屉补 labelled modal dialog 语义。
- 已验证：目标红灯为设备卡缺少 `role="button"`；修复后 MonitoringBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `3/3 passed`，lint 通过，full unit `55 files / 230 tests passed`，coverage `55 files / 230 tests passed`；总行/语句覆盖率提升到 `62.59%`，`MonitoringBoard.vue` 行覆盖 `90.54%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `KnowledgeGovernancePanel.vue`、`SkillMatrixPanel.vue`、`DocumentUpload.vue`、`RiskActionQueuePanel.vue`、`BomBoard.vue` 等仍为 0 覆盖的关键入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `62.59%` 不能关闭发布闸门。

## 2026-06-01 6.6 KnowledgeGovernancePanel Review Button A11y 更新

- 已完成：按覆盖率杠杆转向 `KnowledgeGovernancePanel.vue`，它本轮前为 `0.00%` 行覆盖，且支撑 RAG 来源治理、引用追踪和合规口径确认。
- 已完成：新增 `knowledge-governance-panel.test.ts`，覆盖待复核文档按钮必须用文档标题提供可访问名称，并保持 `document-reviewed` emit payload。
- 已完成：`KnowledgeGovernancePanel.vue` 为文档复核按钮补动态 `aria-label`。
- 已验证：目标红灯为复核按钮缺少 `aria-label`；修复后 KnowledgeGovernancePanel 测试 `1/1 passed`。
- 已验证：相邻组合 `3/3 passed`，lint 通过，full unit `56 files / 231 tests passed`，coverage `56 files / 231 tests passed`；总行/语句覆盖率提升到 `63.88%`，`KnowledgeGovernancePanel.vue` 行覆盖 `68.78%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `SkillMatrixPanel.vue`、`DocumentUpload.vue`、`RiskActionQueuePanel.vue`、`BomBoard.vue`、`EquipmentBoard.vue` 等仍为 0 覆盖的关键入口；并考虑补质量资产治理按钮的文档/版本级可访问名称。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `63.88%` 不能关闭发布闸门。

## 2026-06-01 6.6 SkillMatrixPanel Qualification Block Alert A11y 更新

- 已完成：按覆盖率杠杆转向 `SkillMatrixPanel.vue`，它本轮前为 `0.00%` 行覆盖，且人员资质/替班阻断直接影响生产开工放行。
- 已完成：新增 `skill-matrix-panel.test.ts`，覆盖无有效替班候选时停工复核区域必须以 alert 语义暴露，并关联当前状态标题。
- 已完成：`SkillMatrixPanel.vue` 为停工复核区域补 `role="alert"`、`aria-labelledby`、标题 id，并用 `reviewAlertMessage` 在首屏明确“无有效替班候选”。
- 已验证：目标红灯先失败于 `role` 缺失，再失败于告警正文缺少明确短状态；修复后 SkillMatrixPanel 测试 `1/1 passed`。
- 已验证：相邻组合 `4/4 passed`，lint 通过，full unit `57 files / 232 tests passed`，coverage `57 files / 232 tests passed`；总行/语句覆盖率提升到 `64.54%`，`SkillMatrixPanel.vue` 行覆盖 `84.57%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `DocumentUpload.vue`、`RiskActionQueuePanel.vue`、`BomBoard.vue`、`EquipmentBoard.vue`、`KittingClosurePanel.vue` 等仍为 0 覆盖且用户关键的入口；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `64.54%` 不能关闭发布闸门。

## 2026-06-01 6.6 DocumentUpload Drop Zone A11y 更新

- 已完成：按覆盖率杠杆转向 `DocumentUpload.vue`，它本轮前为 `0.00%` 行覆盖，且知识源上传是 RAG/合规/质量知识治理入口。
- 已完成：新增 `document-upload.test.ts`，覆盖拖拽上传区必须是键盘可触达的文件选择入口。
- 已完成：`DocumentUpload.vue` 为 `.drop-zone` 补 `role="button"`、`tabindex="0"`、上传入口 `aria-label`，并支持点击、Enter、Space 触发隐藏 file input。
- 已验证：目标红灯为上传区缺少 `role="button"`；修复后 DocumentUpload 测试 `1/1 passed`。
- 已验证：相邻组合 `4/4 passed`，lint 通过，full unit `58 files / 233 tests passed`，coverage `58 files / 233 tests passed`；总行/语句覆盖率提升到 `65.52%`，`DocumentUpload.vue` 行覆盖 `57.92%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `RiskActionQueuePanel.vue`、`BomBoard.vue`、`EquipmentBoard.vue`、`KittingClosurePanel.vue`、`AnomalyBoard.vue` 等仍为 0 覆盖且用户关键的入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `65.52%` 不能关闭发布闸门。

## 2026-06-01 6.6 RiskActionQueuePanel Card Action A11y 更新

- 已完成：按覆盖率杠杆转向 `RiskActionQueuePanel.vue`，它本轮前为 `0.00%` 行覆盖，且风险处置队列是跨模块发布风险闭环入口。
- 已完成：新增 `risk-action-queue-panel.test.ts`，覆盖风险卡片“升级”按钮必须用风险标题提供可访问名称，并保持升级写入 trace 的行为。
- 已完成：`RiskActionQueuePanel.vue` 为“转派/升级/关闭”三类卡片动作按钮补动态 `aria-label`。
- 已验证：目标红灯为升级按钮缺少 `aria-label`；修复后 RiskActionQueuePanel 测试 `1/1 passed`。
- 已验证：相邻组合 `12/12 passed`，lint 通过，full unit `59 files / 234 tests passed`，coverage `59 files / 234 tests passed`；总行/语句覆盖率提升到 `67.71%`，`RiskActionQueuePanel.vue` 行覆盖 `80.04%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `BomBoard.vue`、`EquipmentBoard.vue`、`KittingClosurePanel.vue`、`AnomalyBoard.vue`、`RiskBoard.vue` 等仍为 0 覆盖且用户关键的入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `67.71%` 不能关闭发布闸门。

## 2026-06-01 6.6 BomBoard List Selection A11y 更新

- 已完成：按覆盖率杠杆转向 `BomBoard.vue`，它本轮前为 `0.00%` 行覆盖，且 BOM/替代料/齐套检查是排产和采购协同的关键输入。
- 已完成：新增 `bom-board.test.ts`，覆盖 BOM 列表必须以 listbox/option 暴露，并支持键盘选择记录。
- 已完成：`BomBoard.vue` 为列表容器补 `role="listbox"` / `aria-label`，为列表项补 `role="option"`、`tabindex`、动态 `aria-selected` 和 Enter/Space 键选择。
- 已验证：目标红灯为缺少 `[role="listbox"]`；修复后 BomBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `3/3 passed`，lint 通过，full unit `60 files / 235 tests passed`，coverage `60 files / 235 tests passed`；总行/语句覆盖率提升到 `68.72%`，`BomBoard.vue` 行覆盖 `72.95%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `EquipmentBoard.vue`、`KittingClosurePanel.vue`、`AnomalyBoard.vue`、`RiskBoard.vue`、`RoutingBoard.vue` 等仍为 0 覆盖且用户关键的入口；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `68.72%` 不能关闭发布闸门。

## 2026-06-01 6.6 EquipmentBoard Type Filter Regression 更新

- 已完成：按覆盖率杠杆转向 `EquipmentBoard.vue`，它本轮前为 `0.00%` 行覆盖，且 `/equipment` 是设备状态、维护和健康风险入口。
- 已完成：新增 `equipment-board.test.ts`，覆盖选择设备类型后列表必须只保留所选类型。
- 已完成：`EquipmentBoard.vue` 修正 `filteredEquipment` 的类型筛选条件，从排除所选类型改为保留所选类型。
- 已验证：目标红灯为选择 `CNC` 后页面显示 `ASM-001 装配线`；修复后 EquipmentBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `11/11 passed`，lint 通过，full unit `61 files / 236 tests passed`，coverage `61 files / 236 tests passed`；总行/语句覆盖率提升到 `69.85%`，`EquipmentBoard.vue` 行覆盖 `79.00%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `KittingClosurePanel.vue`、`AnomalyBoard.vue`、`RiskBoard.vue`、`RoutingBoard.vue`、`InventoryBoard.vue` 等仍为 0 覆盖且用户关键的入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `69.85%` 不能关闭发布闸门。

## 2026-06-01 6.6 KittingClosurePanel Shortage Action A11y 更新

- 已完成：按覆盖率杠杆转向 `KittingClosurePanel.vue`，它本轮前为 `0.00%` 行覆盖，且工单齐套闭环是缺料排产事件和 OTD 证据链入口。
- 已完成：新增 `kitting-closure-panel.test.ts`，覆盖同名“生成缺料排产事件”按钮必须包含工单/缺料上下文，并保持事件写入行为。
- 已完成：`KittingClosurePanel.vue` 为缺料按钮补动态 `aria-label`，并抽 `firstShortageItem()` / `shortageActionLabel()` 复用首个缺料物料判断。
- 已验证：目标红灯为按钮 `aria-label` 缺失；修复后 KittingClosurePanel 测试 `1/1 passed`。
- 已验证：相邻组合 `11/11 passed`，lint 通过，full unit `62 files / 237 tests passed`，coverage `62 files / 237 tests passed`；总行/语句覆盖率提升到 `71.91%`，`KittingClosurePanel.vue` 行覆盖 `92.95%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `AnomalyBoard.vue`、`RiskBoard.vue`、`RoutingBoard.vue`、`InventoryBoard.vue`、`ScannerBoard.vue` 等仍为 0 覆盖且用户关键的入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `71.91%` 不能关闭发布闸门。

## 2026-06-01 6.6 AnomalyBoard List Selection A11y 更新

- 已完成：按覆盖率杠杆转向 `AnomalyBoard.vue`，它是剩余 0 覆盖大组件之一，且 `/anomaly` 是现场异常处置、分流和风险联动入口。
- 已完成：新增 `anomaly-board.test.ts`，覆盖异常卡片必须以 listbox/option 暴露，并支持键盘打开异常详情。
- 已完成：`AnomalyBoard.vue` 为异常列表补 `role="listbox"` / `aria-label`，为异常卡片补 `role="option"`、`tabindex`、动态 `aria-selected` 和 Enter/Space 键选择。
- 已验证：目标红灯为缺少 `[role="option"]`；修复后 AnomalyBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `12/12 passed`，lint 通过，full unit `63 files / 238 tests passed`，coverage `63 files / 238 tests passed`；当前总行/语句覆盖率 `71.84%`，`AnomalyBoard.vue` 行覆盖 `70.91%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `RiskBoard.vue`、`RoutingBoard.vue`、`InventoryBoard.vue`、`ScannerBoard.vue`、`EmployeeBoard.vue` 等仍为 0 覆盖且用户关键的入口；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率不能关闭发布闸门。

## 2026-06-01 6.6 RiskBoard Load Failure Alert 更新

- 已完成：按覆盖率杠杆转向 `RiskBoard.vue`，`/risk` 是风险汇总、延期风险、设备/物料/瓶颈预警的集中入口。
- 已完成：新增 `risk-board.test.ts`，覆盖风险看板 API 失败后错误横幅必须以 alert 语义播报，同时保留演示数据 fallback。
- 已完成：`RiskBoard.vue` 为 `.error-banner` 补 `role="alert"` 和 `aria-live="assertive"`。
- 已验证：目标红灯为 `.error-banner` 已显示但缺少 `[role="alert"]`；修复后 RiskBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `12/12 passed`，lint 通过，full unit `64 files / 239 tests passed`，coverage `64 files / 239 tests passed`；总行/语句覆盖率 `73.75%`，`RiskBoard.vue` 行覆盖 `99.80%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `RoutingBoard.vue`、`InventoryBoard.vue`、`ScannerBoard.vue`、`EmployeeBoard.vue`、`BarcodePrintBoard.vue` 等仍为 0 覆盖且用户关键的入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `73.75%` 不能关闭发布闸门。

## 2026-06-01 6.6 RoutingBoard List Selection A11y 更新

- 已完成：按覆盖率杠杆转向 `RoutingBoard.vue`，`/routing` 是工艺路线、工序能力、质量门和排产约束入口。
- 已完成：新增 `routing-board.test.ts`，覆盖工艺路线列表必须以 listbox/option 暴露，并支持键盘选择路线。
- 已完成：`RoutingBoard.vue` 为路线列表补 `role="listbox"` / `aria-label`，为路线项补 `role="option"`、`tabindex`、动态 `aria-selected` 和 Enter/Space 键选择。
- 已验证：目标红灯为缺少 `[role="listbox"]`；修复后 RoutingBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `8/8 passed`，lint 通过，full unit `65 files / 240 tests passed`，coverage `65 files / 240 tests passed`；总行/语句覆盖率 `74.47%`，`RoutingBoard.vue` 行覆盖 `85.26%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `InventoryBoard.vue`、`ScannerBoard.vue`、`EmployeeBoard.vue`、`BarcodePrintBoard.vue`、`AuditLogBoard.vue` 等仍为 0 覆盖且用户关键的入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `74.47%` 不能关闭发布闸门。

## 2026-06-01 6.6 InventoryBoard List Selection A11y 更新

- 已完成：按覆盖率杠杆转向 `InventoryBoard.vue`，`/inventory` 是库存、缺料、齐套、采购协同和 OTD 证据链入口。
- 已完成：新增 `inventory-board.test.ts`，覆盖物料库存列表必须以 listbox/option 暴露，并支持键盘选择物料。
- 已完成：`InventoryBoard.vue` 为物料列表补 `role="listbox"` / `aria-label`，为物料项补 `role="option"`、`tabindex`、动态 `aria-selected` 和 Enter/Space 键选择。
- 已验证：目标红灯为缺少 `[role="listbox"]`；修复后 InventoryBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `13/13 passed`，lint 通过，full unit `66 files / 241 tests passed`，coverage `66 files / 241 tests passed`；总行/语句覆盖率 `74.34%`，`InventoryBoard.vue` 行覆盖 `85.32%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `ScannerBoard.vue`、`EmployeeBoard.vue`、`BarcodePrintBoard.vue`、`AuditLogBoard.vue` 等仍为低覆盖且用户关键的入口；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `74.34%` 不能关闭发布闸门。

## 2026-06-01 6.6 ScannerBoard Camera Placeholder A11y 更新

- 已完成：按覆盖率杠杆转向 `ScannerBoard.vue`，`/scanner` 是现场扫码、工单到站、设备点检和物料齐套证据入口。
- 已完成：新增 `scanner-board.test.ts`，覆盖摄像头占位区必须是键盘可触达的扫描入口。
- 已完成：`ScannerBoard.vue` 为 `.scanner-placeholder` 补 `role="button"`、`tabindex="0"`、`aria-label="开启摄像头扫描"`，并支持 Enter/Space 开启摄像头。
- 已验证：目标红灯为占位区 `role` 缺失；修复后 ScannerBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `10/10 passed`，lint 通过，full unit `67 files / 242 tests passed`，coverage `67 files / 242 tests passed`；总行/语句覆盖率 `74.82%`，`ScannerBoard.vue` 行覆盖 `63.08%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `EmployeeBoard.vue`、`BarcodePrintBoard.vue`、`AuditLogBoard.vue` 等仍为低覆盖且用户关键的入口；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `74.82%` 不能关闭发布闸门。

## 2026-06-01 6.6 EmployeeBoard Card Keyboard A11y 更新

- 已完成：按覆盖率杠杆转向 `EmployeeBoard.vue`，`/employee` 是人员管理、资质复核、替班放行和生产开工阻断解释入口。
- 已完成：新增 `employee-board.test.ts`，覆盖员工卡片必须是键盘可触达的员工详情入口。
- 已完成：`EmployeeBoard.vue` 为 `.emp-card` 补 `role="button"`、`tabindex="0"`、员工级 `aria-label`，并支持 Enter/Space 打开详情。
- 已验证：目标红灯为员工卡片 `role` 缺失；修复后 EmployeeBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `8/8 passed`，lint 通过，full unit `68 files / 243 tests passed`，coverage `68 files / 243 tests passed`；总行/语句覆盖率 `76.15%`，`EmployeeBoard.vue` 行覆盖 `76.58%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `BarcodePrintBoard.vue`、`AuditLogBoard.vue` 等仍为低覆盖且用户关键的入口；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `76.15%` 不能关闭发布闸门。

## 2026-06-01 6.6 BarcodePrintBoard Label Selection A11y 更新

- 已完成：按覆盖率杠杆转向 `BarcodePrintBoard.vue`，它本轮前为 `0.00%` 行覆盖，且条码/QR 打印是扫码验证和追溯标签入口。
- 已完成：新增 `barcode-print-board.test.ts`，覆盖标签卡片必须以 checkbox 语义暴露，并支持键盘选择标签。
- 已完成：`BarcodePrintBoard.vue` 为 `.label-card` 补 `role="checkbox"`、`tabindex`、动态 `aria-checked`、动态 `aria-label` 和 Enter/Space 键选择。
- 已验证：目标红灯为标签卡片 `role` 缺失；修复后 BarcodePrintBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `9/9 passed`，lint 通过，full unit `69 files / 244 tests passed`，coverage `69 files / 244 tests passed`；总行/语句覆盖率 `75.73%`，`BarcodePrintBoard.vue` 行覆盖 `81.43%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `AuditLogBoard.vue` 等仍为低覆盖且用户关键的入口；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `75.73%` 不能关闭发布闸门。

## 2026-06-01 6.6 AuditLogBoard Detail Action A11y 更新

- 已完成：按覆盖率杠杆转向 `AuditLogBoard.vue`，它本轮前为 `0.00%` 行覆盖，且审计日志是安全、合规和证据回放入口。
- 已完成：新增 `audit-log-board.test.ts`，覆盖同名“详情”按钮必须包含审计记录上下文，并保持打开选中日志详情的行为。
- 已完成：`AuditLogBoard.vue` 为详情按钮补动态 `aria-label`，包含用户、动作标签、资源和资源 ID。
- 已验证：目标红灯为详情按钮 `aria-label` 缺失；修复后 AuditLogBoard 测试 `1/1 passed`。
- 已验证：相邻组合 `8/8 passed`，lint 通过，full unit `70 files / 245 tests passed`，coverage `70 files / 245 tests passed`；总行/语句覆盖率 `76.96%`，`AuditLogBoard.vue` 行覆盖 `91.62%`。
- 下一步 A 轨：继续按覆盖率杠杆处理仍低覆盖且用户关键的入口；按当前 coverage，优先关注 `ScheduleBoard.vue`、`DocumentUpload.vue`、`ProductionBoard.vue` 或 `ScannerBoard.vue` 的未覆盖高风险路径，而不是精修已高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `76.96%` 不能关闭发布闸门。

## 2026-06-01 6.6 AuditDecisionReplayPanel Replay Button A11y 更新

- 已完成：按覆盖率杠杆转向 `AuditDecisionReplayPanel.vue`，它当前为最低覆盖组件，且审计回放是安全/合规/Agent 决策证据入口。
- 已完成：扩展 `audit-decision-replay-panel.test.ts`，覆盖同名“回放决策链”按钮必须包含具体决策标题，并保持选中状态切换。
- 已完成：`AuditDecisionReplayPanel.vue` 为 `.replay-btn` 补动态 `aria-label="回放决策链：<标题>"`。
- 已验证：目标红灯为回放按钮 `aria-label` 缺失；修复后 AuditDecisionReplayPanel 测试 `1/1 passed`。
- 已验证：相邻组合 `8/8 passed`，lint 通过，full unit `70 files / 245 tests passed`，coverage `70 files / 245 tests passed`；总行/语句覆盖率 `76.96%`，`AuditDecisionReplayPanel.vue` 行覆盖 `36.17%`。
- 下一步 A 轨：`AuditDecisionReplayPanel.vue` 仍是最低覆盖大组件，但后续应转向真实 backend-first 映射分支；如果单片过大，则按 `ScheduleBoard.vue`、`DocumentUpload.vue`、`ProductionBoard.vue` 等低覆盖关键入口继续切。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `76.96%` 不能关闭发布闸门。

## 2026-06-01 6.6 AuditDecisionReplayPanel Backend Business Write Replay 更新

- 已完成：继续处理 `AuditDecisionReplayPanel.vue`，从 UI 微断言转向后端 Agent 业务落库审计回放分支。
- 已完成：扩展 `audit-decision-replay-panel.test.ts`，mock `AgentExecutePurchaseAction` 后端审计，覆盖采购收货落库回放默认展示、业务写入步骤和业务页链接可访问名称。
- 已完成：`AuditDecisionReplayPanel.vue` 为 `.trace-link` 补动态 `aria-label`，包含业务页名称和业务对象。
- 已验证：目标红灯为业务页链接 `aria-label` 缺失；修复后 AuditDecisionReplayPanel 测试 `2/2 passed`。
- 已验证：相邻组合 `9/9 passed`，lint 通过，full unit `70 files / 246 tests passed`，coverage `70 files / 246 tests passed`；总行/语句覆盖率 `77.08%`，`AuditDecisionReplayPanel.vue` 行覆盖 `39.73%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `AuditDecisionReplayPanel.vue` 的质量/设备/OTD/配置审批映射分支，或转向 `ScheduleBoard.vue`、`DocumentUpload.vue`、`ProductionBoard.vue` 等低覆盖关键入口。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `77.08%` 不能关闭发布闸门。

## 2026-06-01 6.6 ScheduleBoard Optimization Warning Status A11y 更新

- 已完成：按覆盖率杠杆转向 `ScheduleBoard.vue`，它是排产核心入口，且优化预警会影响计划员对瓶颈窗口、冲突和降级状态的判断。
- 已完成：扩展 `schedule-board.test.ts`，覆盖优化成功返回 warnings 后必须以 polite status 区域播报排产预警。
- 已完成：`ScheduleBoard.vue` 为 `.warnings-bar` 补 `role="status"`、`aria-live="polite"` 和 `aria-label="排产预警"`。
- 已验证：目标红灯为预警条 `role` 缺失；修复后 ScheduleBoard 测试 `2/2 passed`。
- 已验证：相邻组合 `14/14 passed`，lint 通过，full unit `70 files / 247 tests passed`，coverage `70 files / 247 tests passed`；总行/语句覆盖率 `77.11%`，`ScheduleBoard.vue` 行覆盖 `47.05%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `ScheduleBoard.vue` 的更高收益业务路径，或转向 `DocumentUpload.vue`、`ProductionBoard.vue`、`ScannerBoard.vue` 等低覆盖关键入口；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `77.11%` 不能关闭发布闸门。

## 2026-06-01 6.6 ProductionBoard Work Order List Selection A11y 更新

- 已完成：按覆盖率杠杆转向 `ProductionBoard.vue`，它是生产执行主入口，工单选择直接承接开工、完工、异常和扫码证据链。
- 已完成：扩展 `production-board.test.ts`，覆盖生产工单列表必须以 listbox/option 暴露，并支持键盘选择工单。
- 已完成：`ProductionBoard.vue` 为 `.wo-list` 补 `role="listbox"` / `aria-label`，为 `.wo-card` 补 `role="option"`、`tabindex`、动态 `aria-selected`、动态 `aria-label` 和 Enter/Space 键选择。
- 已验证：目标红灯为缺少 `[role="listbox"]`；修复后 ProductionBoard 测试 `3/3 passed`。
- 已验证：相邻组合 `17/17 passed`，lint 通过，full unit `70 files / 248 tests passed`，coverage `70 files / 248 tests passed`；总行/语句覆盖率 `77.13%`，`ProductionBoard.vue` 行覆盖 `59.28%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `DocumentUpload.vue`、`PurchaseBoard.vue`、`ScannerBoard.vue`、`AuditDecisionReplayPanel.vue` 或 `ScheduleBoard.vue` 的高收益业务路径；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `77.13%` 不能关闭发布闸门。

## 2026-06-01 6.6 DocumentUpload Rejected File Alert A11y 更新

- 已完成：按覆盖率杠杆转向 `DocumentUpload.vue`，它是知识文档、客户工单样例和质量知识治理入口。
- 已完成：扩展 `document-upload.test.ts`，覆盖不支持文件格式被拒绝时必须以 alert 语义播报错误原因。
- 已完成：`DocumentUpload.vue` 为 `.error-msg` 补 `role="alert"` 和 `aria-live="assertive"`。
- 已验证：目标红灯为缺少 `[role="alert"]`；修复后 DocumentUpload 测试 `2/2 passed`。
- 已验证：相邻组合 `12/12 passed`，lint 通过，full unit `70 files / 249 tests passed`，coverage `70 files / 249 tests passed`；总行/语句覆盖率 `77.16%`，`DocumentUpload.vue` 行覆盖 `59.73%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `PurchaseBoard.vue`、`ScannerBoard.vue`、`AuditDecisionReplayPanel.vue`、`ScheduleBoard.vue` 或 `DocumentUpload.vue` 的真实上传失败/成功路径；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `77.16%` 不能关闭发布闸门。

## 2026-06-01 6.6 PurchaseBoard Purchase Order List Selection A11y 更新

- 已完成：按覆盖率杠杆转向 `PurchaseBoard.vue`，采购订单列表是采购协同、缺料加急和供应风险处置的基础入口。
- 已完成：扩展 `purchase-board.test.ts`，覆盖采购订单列表必须以 listbox/option 暴露，并支持键盘选择采购单。
- 已完成：`PurchaseBoard.vue` 为 `.list-items` 补 `role="listbox"` / `aria-label`，为 `.list-item` 补 `role="option"`、`tabindex`、动态 `aria-selected`、动态 `aria-label` 和 Enter/Space 键选择。
- 已验证：目标红灯为缺少 `[role="listbox"]`；修复后 PurchaseBoard 测试 `2/2 passed`。
- 已验证：相邻组合 `8/8 passed`，lint 通过，full unit `70 files / 250 tests passed`，coverage `70 files / 250 tests passed`；总行/语句覆盖率 `77.27%`，`PurchaseBoard.vue` 行覆盖 `69.37%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `ScheduleBoard.vue`、`ScannerBoard.vue`、`AuditDecisionReplayPanel.vue`、`PurchaseBoard.vue` 或 `DocumentUpload.vue` 的更高收益业务路径；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `77.27%` 不能关闭发布闸门。

## 2026-06-01 6.6 ScannerBoard Manual Scan History Replay A11y 更新

- 已完成：按覆盖率杠杆转向 `ScannerBoard.vue`，手动扫码与历史重放是现场执行和证据链复核入口。
- 已完成：扩展 `scanner-board.test.ts`，覆盖手动输入工单生成历史后，历史项必须具备 button 语义并支持键盘重放。
- 已完成：`ScannerBoard.vue` 为 `.history-item` 补 `role="button"`、`tabindex`、动态 `aria-label` 和 Enter/Space 键重扫。
- 已验证：目标红灯为历史项 `role` 缺失；修复后 ScannerBoard 测试 `2/2 passed`。
- 已验证：相邻组合 `14/14 passed`，lint 通过，full unit `70 files / 251 tests passed`，coverage `70 files / 251 tests passed`；总行/语句覆盖率 `77.41%`，`ScannerBoard.vue` 行覆盖 `80.55%`，函数覆盖 `43.75%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `ScheduleBoard.vue`、`AuditDecisionReplayPanel.vue`、`KnowledgeGovernancePanel.vue`、`DocumentUpload.vue` 或 `PurchaseBoard.vue` 的高收益业务路径；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `77.41%` 不能关闭发布闸门。

## 2026-06-01 6.6 KnowledgeGovernancePanel Next Training Merge Action A11y 更新

- 已完成：按覆盖率杠杆转向 `KnowledgeGovernancePanel.vue`，质量知识资产治理承接样本入库、下一轮训练集和灰度前校验。
- 已完成：扩展 `knowledge-governance-panel.test.ts`，覆盖下一轮训练集的“合并现场反馈”按钮必须包含资产标题，并保持 emit feedback id 行为。
- 已完成：`KnowledgeGovernancePanel.vue` 为下一轮训练集合并按钮补 `aria-label="合并现场反馈：<asset.title>"`。
- 已验证：目标红灯为合并按钮 `aria-label` 缺失；修复后 KnowledgeGovernancePanel 测试 `2/2 passed`。
- 已验证：相邻组合 `13/13 passed`，lint 通过，full unit `70 files / 252 tests passed`，coverage `70 files / 252 tests passed`；总行/语句覆盖率 `77.68%`，`KnowledgeGovernancePanel.vue` 行覆盖 `83.40%`，函数覆盖 `17.94%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `ScheduleBoard.vue`、`AuditDecisionReplayPanel.vue`、`DocumentUpload.vue`、`PurchaseBoard.vue` 或 KnowledgeGovernancePanel 的审批/校验/灰度发布路径；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `77.68%` 不能关闭发布闸门。

## 2026-06-01 6.6 ScheduleBoard Task Detail Loading State 更新

- 已完成：继续按覆盖率杠杆处理 `ScheduleBoard.vue`，覆盖甘特任务点击进入工单详情/排产解释的主链路。
- 已完成：扩展 `schedule-board.test.ts`，覆盖 `GanttChart` 发出 `task-click` 后，详情面板在真实工单详情请求 pending 期间必须保持 loading 状态，并仍带上任务级排产解释。
- 已完成：`ScheduleBoard.vue` 在 `handleTaskClick()` 请求 `getWorkOrderById()` 前设置 `detailLoading.value = true`。
- 已验证：目标红灯为详情面板 `loading` 仍是 `false`；修复后 ScheduleBoard 测试 `3/3 passed`。
- 已验证：相邻组合 `25/25 passed`，lint 通过，full unit `70 files / 253 tests passed`，coverage `70 files / 253 tests passed`；总行/语句覆盖率 `77.86%`，`ScheduleBoard.vue` 行覆盖 `50.25%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `AuditDecisionReplayPanel.vue`、`ProductionBoard.vue`、`DocumentUpload.vue`、`PurchaseBoard.vue` 或 `ScheduleBoard.vue` 的后端成功/失败详情分支；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `77.86%` 不能关闭发布闸门。

## 2026-06-01 6.6 AuditDecisionReplayPanel Config Approval List A11y 更新

- 已完成：按覆盖率杠杆回到 `AuditDecisionReplayPanel.vue`，覆盖关键配置审批清单的辅助技术语义。
- 已完成：扩展 `audit-decision-replay-panel.test.ts`，mock pending 配置审批，覆盖审批区域必须暴露为带名称的 review list，审批项必须暴露标题、状态和责任人上下文。
- 已完成：`AuditDecisionReplayPanel.vue` 为 `.approval-lane` 补 `role="list"` / `aria-label`，为 `.approval-row` 补 `role="listitem"` 和动态 `aria-label`。
- 已验证：目标红灯为审批 lane `role` 缺失；修复后 AuditDecisionReplayPanel 测试 `3/3 passed`。
- 已验证：相邻组合 `15/15 passed`，lint 通过，full unit `70 files / 254 tests passed`，coverage `70 files / 254 tests passed`；总行/语句覆盖率 `77.95%`，`AuditDecisionReplayPanel.vue` 行覆盖 `42.47%`。
- 下一步 A 轨：继续按覆盖率杠杆处理 `AuditDecisionReplayPanel.vue` 的质量处置/设备状态业务落库分支，或转向 `ScheduleBoard.vue`、`ProductionBoard.vue`、`DocumentUpload.vue` 的低覆盖业务路径；只有 HIGH/CRITICAL 缺陷才回头精修高覆盖组件。
- 下一步 B 轨：hosted CI PASS、真实 PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍待单独补证；A 轨覆盖率达 `77.95%` 不能关闭发布闸门。
