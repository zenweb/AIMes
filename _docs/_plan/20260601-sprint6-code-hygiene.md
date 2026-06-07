# 2026-06-01 Sprint 6 Code Hygiene Plan

## 6.6 Login Page Stale Error Clear 切片

- 目标：补强登录页错误状态生命周期，避免用户修改凭据后继续保留过期错误和字段 invalid 语义。
- 成功标准：新增组件测试先红灯，修复后目标测试和相邻身份测试通过；文档落到当天五份 `_docs` 文件。
- 红灯：`login-page.test.ts` 复现登录失败后编辑密码，`[role="alert"]` 仍存在。
- 修复：`LoginPage.vue` 增加 `clearError()`，用户名/密码输入事件在已有错误时清空错误。
- 验证：`login-page.test.ts` `9/9 passed`；相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` `11/11 passed`。
- 后续：继续补 6.6 高价值组件/页面测试；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page Validation Focus Recovery 切片

- 目标：补强登录页空白校验失败后的键盘修复路径，让焦点回到第一个凭据字段。
- 成功标准：新增组件测试先红灯，修复后目标测试和相邻身份测试通过，并把记录追加到当天五份 `_docs` 文件。
- 红灯：`login-page.test.ts` 复现空白凭据提交后 `document.activeElement` 仍是 `body`。
- 修复：`LoginPage.vue` 增加 `usernameInput` ref，空白校验失败后 `await nextTick()` 并聚焦用户名输入框。
- 验证：`login-page.test.ts` `10/10 passed`；相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` `11/11 passed`。
- 后续：继续补 6.6 高价值组件/页面测试；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page First Invalid Field Focus 切片

- 目标：把登录页空白校验失败后的焦点从固定用户名，细化为第一个缺失凭据字段。
- 成功标准：新增组件测试先红灯，修复后目标测试和相邻身份测试通过，并追加当天五份 `_docs` 记录。
- 红灯：`login-page.test.ts` 复现用户名有效但密码空白时，焦点仍回到 `#username`。
- 修复：校验失败后根据 `trimmedUsername` 选择焦点；用户名缺失聚焦用户名，否则聚焦密码。
- 验证：`login-page.test.ts` `11/11 passed`；相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` `11/11 passed`。
- 后续：继续补 6.6 高价值组件/页面测试；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page Field-Level Invalid State 切片

- 目标：把登录页空白校验的 invalid 状态从表单级细化到实际缺失字段，避免有效用户名被错误标记。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻身份测试、coverage、full unit、lint 通过，并追加当天五份 `_docs` 记录。
- 红灯：`login-page.test.ts` 复现用户名有效但密码空白时，`#username` 仍带 `aria-invalid="true"`。
- 修复：`LoginPage.vue` 增加字段级 invalid 状态；空白校验只标记缺失字段，登录请求失败仍标记两个凭据字段。
- 验证：`login-page.test.ts` `12/12 passed`；相邻身份测试 `11/11 passed`；coverage `45 files / 219 tests passed`；full unit `45 files / 219 tests passed`；lint 通过。
- 后续：继续补 6.6 高价值组件/页面测试；发布级外部 CI、staging、灰度、安全签字与两周观察证据仍不完整。

## 6.6 MainLayout Mobile Menu A11y 切片

- 目标：为 0 覆盖的全局壳层补首个组件测试，先收紧移动菜单按钮的可访问性开合状态。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻登录页测试、coverage、full unit、lint 通过，并追加当天五份 `_docs` 记录。
- 红灯：`main-layout.test.ts` 修正 `localStorage` 夹具后复现移动菜单按钮 `aria-expanded` 缺失。
- 修复：`MainLayout.vue` 为菜单按钮增加 `aria-expanded` / `aria-controls`，为移动菜单面板增加 `id="mobile-nav-panel"`。
- 验证：MainLayout 测试 `1/1 passed`；登录页相邻测试 `12/12 passed`；coverage `46 files / 220 tests passed`；full unit `46 files / 220 tests passed`；lint 通过。
- 后续：继续补 MainLayout 退出登录、暗色模式持久化、移动导航关闭行为，或转向其他 0 覆盖关键组件。

## 6.6 Coverage-Leverage Routing 规则

- 外审输入：Claude Opus 4.8 指出，LoginPage 连续 4 片后组件覆盖已到 `100%`，但总覆盖率停在 `17.8%`；MainLayout 从 0 覆盖切 1 片后，总行/语句覆盖率提升到 `24.19%`。
- 采纳判断：该反馈和当前 `coverage-summary.json` 一致，说明继续精修已覆盖组件的边际收益低于打开 0 覆盖且用户必经的大组件。
- 选片硬规则：下一片优先选择“当前覆盖率最低 且 用户必经/业务关键”的组件；不得让已 100% 覆盖组件的进一步微调插队，除非发现 HIGH/CRITICAL 缺陷。
- 当前排序证据：`ScheduleBoard.vue` 为 `0.00%` 行覆盖、约 `2771` 行，且 `/scheduling` 是 AI 排产核心入口；优先级高于继续精修 LoginPage 或 MainLayout 小行为。
- 下一切片候选：为 `ScheduleBoard.vue` 添加首个高价值组件测试，优先覆盖页面首屏业务承诺、关键操作入口或状态联动中最稳定且用户必经的路径。

## Release Gate 双轨追踪

- 轨道 A：质量打磨，覆盖率/a11y/组件测试继续按 Coverage-Leverage Routing 推进。
- 轨道 B：发布阻断项，hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口必须单独立项和追踪。
- 约束：轨道 A 的绿色测试不能证明 v1.0.0 发布完成；发布级完成必须拿到轨道 B 的外部环境、人审和时间窗口证据。

## 6.6 ScheduleBoard Optimize Error Alert 切片

- 目标：为 `/scheduling` 核心排产入口打开首个高杠杆组件测试，并补强优化失败反馈的可访问性播报。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻登录/壳层测试、coverage、full unit、lint 通过，并追加当天五份 `_docs` 记录。
- 红灯：`schedule-board.test.ts` 复现优化失败后 `.error-banner` 已显示错误文本，但缺少 `[role="alert"]`。
- 修复：`ScheduleBoard.vue` 为错误横幅增加 `role="alert"` 和 `aria-live="assertive"`。
- 验证：ScheduleBoard 测试 `1/1 passed`；相邻登录/壳层测试 `13/13 passed`；coverage `47 files / 221 tests passed`，总行/语句覆盖率 `36.51%`，`ScheduleBoard.vue` 行覆盖 `46.62%`；full unit `47 files / 221 tests passed`；lint 通过。
- 后续：继续按覆盖率杠杆选择 0 覆盖且用户必经组件，或在 `ScheduleBoard.vue` 内继续补关键采纳/事件队列路径；发布级 B 轨证据仍不完整。

## 6.6 ProductionBoard Scan Miss Alert 切片

- 目标：按 Coverage-Leverage Routing 打开 `/production` 生产报工入口的首个组件测试，并补强扫码未命中错误的可访问性播报。
- 成功标准：新增组件测试先红灯，修复后目标测试通过，并追加当天五份 `_docs` 记录；后续再跑 coverage/full unit/lint 作为更大切片验证。
- 选片依据：`coverage-summary.json` 显示 `ProductionBoard.vue` 为 `0.00%` 行覆盖、约 `2041` 行；`/production` 是计划执行链路的用户必经入口。
- 红灯：`production-board.test.ts` 复现扫码未命中后 `.notification.error` 已显示错误文本，但缺少 `[role="alert"]`。
- 修复：`ProductionBoard.vue` 为错误通知增加 `role="alert"` / `aria-live="assertive"`，为成功通知增加 `role="status"` / `aria-live="polite"`。
- 验证：ProductionBoard 测试 `1/1 passed`；相邻组合 `15/15 passed`；coverage `48 files / 222 tests passed`，总行/语句覆盖率 `39.58%`，`ProductionBoard.vue` 行覆盖 `52.36%`；full unit `48 files / 222 tests passed`；lint 通过。
- 后续：继续补 `ProductionBoard.vue` 开工资质阻断、完工回写、异常上报与 OTD 证据链；发布级 B 轨证据仍不完整。

## 6.6 ProductionBoard Start Block Reason 切片

- 目标：继续沿 `/production` 主链路补开工前资质阻断可访问性，让禁用的“确认开工”按钮能直接说明不可开工原因。
- 成功标准：新增组件测试先红灯，修复后目标测试和相邻组合通过，并追加当天五份 `_docs` 记录。
- 红灯：`production-board.test.ts` 复现热处理工序存在资质阻断时，“确认开工”按钮已禁用但 `aria-describedby` 缺失。
- 修复：`ProductionBoard.vue` 阻断态渲染 `#start-qualification-block-reason`，确认按钮在 `blocked` 状态下关联该说明。
- 验证：ProductionBoard 测试 `2/2 passed`；相邻组合 `16/16 passed`；full unit `48 files / 223 tests passed`；coverage `48 files / 223 tests passed`，总行/语句覆盖率 `39.88%`，`ProductionBoard.vue` 行覆盖 `58.74%`；lint 通过。
- 后续：继续补替班放行开工、完工回写、异常上报与 OTD 证据链；发布级 B 轨证据仍不完整。

## B 轨 Hosted CI Root Workflow 切片

- 目标：把 hosted CI 配置证据放回当前 git 仓库根，避免仓库外层 workflow 造成发布闸门假绿灯。
- 成功标准：测试先红灯证明仓库根 workflow 缺失；修复后 H20 架构门和前端 CI coverage 测试通过，并追加当天五份 `_docs` 记录。
- 红灯：H20 架构门失败于 `Repository-root .github/workflows/ci.yml is missing.`；前端 CI coverage 测试失败于仓库根 workflow `ENOENT`。
- 修复：恢复 `.github/workflows/ci.yml` / `.github/workflows/eval.yml` 到当前 git 仓库根，路径按仓库根相对路径书写，保留 backend/frontend/container/security/evaluation 质量门。
- 验证：H20 架构门 `1/1 passed`；前端 CI coverage 测试 `2/2 passed`。
- 后续：当前环境无法查询远端 hosted run（`gh` 未登录，`git ls-remote origin` 返回 project not found）；需在有权限的远端环境触发 hosted CI 并记录 run URL / run id。PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍不完整。

## B 轨 PostgreSQL/Staging Runbook Policy 切片

- 目标：消除 PostgreSQL/staging runbook 对生产自动迁移的误导，保持 Sprint 0 显式迁移 + 启动校验策略一致。
- 成功标准：架构测试先红灯证明旧 runbook 残留；修复后目标测试和相邻 H20 架构门通过，并追加当天五份 `_docs` 记录。
- 红灯：`ReleaseRunbooks_ShouldRequireExplicitProductionMigrationAndAvoidLegacyInitSql` 失败于 `_docs/SOP.md must not reference removed db/init.sql.`。
- 修复：`_docs/SOP.md` 移除目录树里的 `init.sql` 并改写启动性能表；`db/README.md` Docker 段落改为先启动依赖、显式 `dotnet ef database update`、再启动 API。
- 验证：目标架构测试 `1/1 passed`；H20 hosted CI 架构门 + PostgreSQL/staging runbook policy 合并过滤运行 `2/2 passed`。
- 后续：本片只修复文档策略和测试护栏；下一步必须在真实 PostgreSQL/staging 环境实跑并保存迁移输出、健康检查结果和操作证据。hosted CI run URL/run id、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍不完整。

## B 轨 PostgreSQL/Staging Rehearsal Evidence Script 切片

- 目标：把 PostgreSQL/staging 发布闸门推进到可复跑脚本取证，减少人工漏步骤和漏保存输出。
- 成功标准：架构测试先红灯证明脚本缺失；修复后目标测试通过；脚本通过 PowerShell parser；本机至少生成 PASS/FAIL 证据报告。
- 红灯：`StagingRehearsal_ShouldHaveExecutableEvidenceScript` 失败于 `scripts/run-staging-rehearsal.ps1 is required to collect PostgreSQL/staging release evidence.`。
- 修复：新增 `scripts/run-staging-rehearsal.ps1`，执行 Docker 版本检查、依赖启动、显式 EF migration、API 启动、`/live` `/ready`，并写入 `_docs/_reports/staging-rehearsal-*.md`。
- 验证：目标架构测试 `1/1 passed`；与 runbook policy 合并过滤运行 `2/2 passed`；PowerShell parser 输出 `parse ok`；本机报告 `_docs/_reports/staging-rehearsal-20260601-local.md` 生成。
- 当前结果：本机报告为 `Result: FAIL`，失败于 `docker` 命令不存在；因此 staging 闸门仍缺真实 PASS 证据。
- 后续：在具备 Docker/staging 访问权限的环境运行同一脚本，保存 `Result: PASS` 报告、迁移输出和健康检查响应；hosted CI run URL/run id、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍不完整。

## B 轨 Security Self-Assessment High/Critical 切片

- 目标：把安全签字前置自动证据推进到可复跑 PASS，至少清掉 NuGet/npm high/critical 漏洞阻断，并保持人工签字闸门 fail loud。
- 成功标准：安全自评脚本先暴露误判/真实漏洞；修复后脚本 parser、架构门、NuGet audit、npm high 阈值 audit、前端 unit/lint/build 均通过；签字包仍保持 `UNSIGNED`。
- 红灯 1：`Assert-NoVulnerabilityFindings` 宽匹配 `易受攻击的包`，把 NuGet 中文 clean 输出 `没有易受攻击的包` 误判为漏洞。
- 红灯 2：脚本在 Windows PowerShell 下调用 `String.Contains(value, StringComparison)` 抛出 overload 错误。
- 红灯 3：修复脚本后，npm audit 暴露真实前端漏洞：`25 vulnerabilities (3 low, 10 moderate, 11 high, 1 critical)`，直接根包含 `nuxt 3.11.2`。
- 修复：脚本改用 `Test-ContainsIgnoreCase` 和漏洞标题/表格行识别；NuGet 通过 central transitive pinning + `System.IO.Packaging 8.0.1` + `RabbitMQ.Client 7.2.0` 清掉 high；npm 通过 `nuxt 3.21.6` + `js-beautify -> glob ^10.5.0` 清掉 high/critical。
- 验证：安全签字/自评架构门 `2/2 passed`；PowerShell parser `parse ok`；NuGet vulnerable audit 无漏洞；`npm audit --audit-level=high` 退出 `0`；安全自评报告 `Result: PASS`；前端 unit `48 files / 223 tests passed`，lint/build 通过。
- 当前结果：自动安全自评 high/critical 阻断已推进到 PASS；npm 仍有 5 个 moderate（Vitest/Vite/esbuild 链，官方 fix 需要 major），记录为 residual risk，不阻断当前 high 阈值脚本。
- 后续：human signer 仍必须手工验证 Attack Chain A/B/C 并签字；hosted CI run URL/run id、真实 PostgreSQL/staging PASS、首次灰度、2 周无 P0/P1 观察窗口仍不完整。

## B 轨 Gray Observation Evidence Gate 切片

- 目标：把首次灰度和 2 周无 P0/P1 观察窗口从文档待办推进到可复跑证据门，避免 A 轨测试或安全自评 PASS 被误读为 v1.0.0 可发布。
- 成功标准：架构测试先红于缺少证据脚本；补脚本和当前报告后目标测试通过；默认脚本必须在 `NOT_STARTED` 状态下生成 `Result: FAIL` 并退出非 0。
- 红灯：`GrayObservationGate_ShouldHaveEvidencePacketAndFailLoudUntilObservationCompletes` 失败于 `scripts/run-gray-observation.ps1 is required to collect first gray release and two-week observation evidence.`
- 修复：新增 `scripts/run-gray-observation.ps1`，支持 `NOT_STARTED` / `OBSERVING` / `PASS` 三态；`PASS` 要求灰度编号、开始时间、观察开始/结束时间、至少 14 天、P0/P1 incident count 为 0 和证据链接。
- 当前证据：`_docs/_reports/gray-observation-20260601.md` 为 `Status: NOT_STARTED` / `Result: FAIL`，说明首次灰度尚未开始，不能关闭 v1.0.0 release gate。
- 验证：目标架构门 `1/1 passed`；PowerShell parser `gray parser ok`；默认脚本实跑生成 FAIL 报告并抛出 `Gray observation gate failed`。
- 后续：真实灰度启动后生成 `OBSERVING` 报告；观察满 14 天且 P0/P1 为 0 后生成 `PASS` 报告。hosted CI run URL/run id、真实 PostgreSQL/staging PASS、安全签字仍不完整。

## B 轨 Hosted CI Remote Run Evidence Gate 切片

- 目标：把 hosted CI 从“仓库内 workflow 配置存在”推进到“远端 runner run URL/run id 可审计”，避免本地 workflow 文件被误当作 hosted CI 通过证据。
- 成功标准：架构测试先红于缺少证据脚本；补脚本和当前报告后目标测试通过；默认脚本必须在缺少 `RunUrl` / `RunId` 时生成 `Result: FAIL` 并退出非 0。
- 红灯：`HostedCiRunGate_ShouldHaveEvidenceScriptAndFailLoudWithoutRemoteRun` 失败于 `scripts/run-hosted-ci-evidence.ps1 is required to collect hosted CI run URL/run id evidence.`
- 修复：新增 `scripts/run-hosted-ci-evidence.ps1`，检查仓库根 `ci.yml` / `eval.yml`，采集 `git ls-remote` 与 `gh run list` 输出，并把 `RunUrl` / `RunId` 作为 PASS 必填证据。
- 当前证据：`_docs/_reports/hosted-ci-20260601.md` 为 `Status: MISSING_REMOTE_RUN` / `Result: FAIL`，说明 hosted CI 远端 run 尚未补证。
- 验证：目标架构门 `1/1 passed`；PowerShell parser `hosted ci parser ok`；默认脚本实跑生成 FAIL 报告并抛出 `Hosted CI evidence gate failed`。
- 后续：在有远端权限的 CI 平台触发 hosted run，记录 run URL/run id/job 摘要并回填报告。真实 PostgreSQL/staging PASS、灰度 PASS 观察报告、安全签字仍不完整。

## B 轨 Attack Chain Manual Verification Gate 切片

- 目标：把安全签字前的 Attack Chain A/B/C 手工验证从签字包备注推进到可复跑证据门，避免自动安全自评 PASS 被误读为安全签字完成。
- 成功标准：架构测试先红于缺少证据脚本；补脚本和当前报告后目标测试通过；默认脚本必须在缺少 verifier、verified timestamp 和 A/B/C evidence 时生成 `Result: FAIL` 并退出非 0。
- 红灯：`AttackChainManualVerification_ShouldHaveEvidenceScriptAndFailLoudUntilVerified` 失败于 `scripts/run-attack-chain-verification.ps1 is required to collect manual Attack Chain A/B/C verification evidence.`
- 修复：新增 `scripts/run-attack-chain-verification.ps1`，要求 Attack Chain A/B/C 全部 `PASS`，且提供 verifier、verified timestamp 和三条 evidence。
- 当前证据：`_docs/_reports/attack-chain-verification-20260601.md` 为 `Status: PENDING_MANUAL_VERIFICATION` / `Result: FAIL`，说明安全签字仍缺人工验证证据。
- 验证：目标架构门 `1/1 passed`；PowerShell parser `attack-chain parser ok`；默认脚本实跑生成 FAIL 报告并抛出 `Attack-chain manual verification gate failed`。
- 后续：human verifier 完成 A/B/C 手工验证并附证据后，重新运行脚本生成 PASS 报告；之后 human signer 才能决定是否把 security signoff 从 `UNSIGNED` 更新为 signed。hosted CI PASS、真实 PostgreSQL/staging PASS、灰度 PASS 观察报告仍不完整。

## 6.6 AdminBoard Tabs A11y 切片

- 目标：按 Coverage-Leverage Routing 打开 `/admin` 系统管理入口的首个组件测试，并补强分区切换的可访问性语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、scoped lint、full unit、coverage 和全量 lint 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `AdminBoard.vue` 为 `0.00%` 行覆盖、约 `2510` 行，是当前最大 0 覆盖组件；`/admin` 承载用户、角色、配置、通知和 Agent 治理。
- 红灯：`admin-board.test.ts` 复现分区切换缺少 `[role="tablist"]`，DOM 中只有普通 `.tabs` 和六个 button。
- 修复：`AdminBoard.vue` 为分区容器增加 `role="tablist"` / `aria-label`，为六个分区按钮增加 `role="tab"` 和动态 `aria-selected`。
- 验证：AdminBoard 测试 `1/1 passed`；相邻组合 `17/17 passed`；scoped lint 通过；full unit `49 files / 224 tests passed`；coverage `49 files / 224 tests passed`，总行/语句覆盖率 `44.31%`，`AdminBoard.vue` 行覆盖 `84.70%`；最终全量 `npm run lint` 通过。
- 调试记录：全量 `npm run lint` 首次执行在工具层超时；分段 lint 均通过后，重跑 full lint 通过，判断为偶发工具/进程状态问题。
- 后续：继续按覆盖率杠杆转向 `ReportBoard.vue`、`AuditDecisionReplayPanel.vue`、`PurchaseBoard.vue` 等 0 覆盖关键入口；发布级 B 轨证据仍不完整。

## 6.6 ReportBoard KPI Tabs A11y 切片

- 目标：按 Coverage-Leverage Routing 打开 `/report` 报表中心入口的首个组件测试，并补强 OTD KPI 钻取维度的可访问性选中状态。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、scoped lint、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `ReportBoard.vue` 为 `0.00%` 行覆盖、约 `2354` 行，是当前最大 0 覆盖组件；`/report` 是 POC/经营复盘、OTD 证据链和导出入口。
- 红灯：`report-board.test.ts` 复现 OTD KPI 维度 tab 缺少 `aria-selected`，首个 tab 的属性值为 `undefined`。
- 修复：`ReportBoard.vue` 为 OTD KPI 维度 tab 增加动态 `aria-selected`。
- 验证：ReportBoard 测试 `1/1 passed`；相邻组合 `18/18 passed`；scoped lint 通过；full lint 通过；full unit `50 files / 225 tests passed`；coverage 单独复跑 `50 files / 225 tests passed`，总行/语句覆盖率 `48.19%`，`ReportBoard.vue` 行覆盖 `78.98%`。
- 调试记录：并行启动 full unit 与 coverage 时，coverage 进程中的 `auth.store.test.ts` 曾失败 2 个测试；单独复跑 full unit 和 coverage 均通过，判断为并发 Vitest 进程干扰。
- 后续：继续按覆盖率杠杆转向 `AuditDecisionReplayPanel.vue`、`PurchaseBoard.vue`、`DashboardBoard.vue` 等 0 覆盖关键入口；发布级 B 轨证据仍不完整。

## 6.6 DashboardBoard Command Journey A11y 切片

- 目标：按 Coverage-Leverage Routing 打开 `/dashboard` 生产运营控制塔入口的首个组件测试，并补强 AI MES 指挥中心五步主线的顺序导航语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `DashboardBoard.vue` 为 `0.00%` 行覆盖、约 `1367` 行；`/dashboard` 是用户进入生产运营控制塔、风险识别和调度主线的入口。
- 红灯：`dashboard-board.test.ts` 复现 AI MES 指挥中心主线缺少 `[aria-label="AI MES 指挥中心主线"]`，DOM 中只有普通 `.command-grid` 和链接卡片。
- 修复：`DashboardBoard.vue` 将主线步骤容器改为 `ol[aria-label="AI MES 指挥中心主线"]`，每个步骤用 `li` 包裹原 `router-link`，并补 `ol/li` 样式约束。
- 验证：DashboardBoard 测试 `1/1 passed`；相邻组合 `3/3 passed`；full lint 通过；full unit `51 files / 226 tests passed`；coverage `51 files / 226 tests passed`，总行/语句覆盖率 `50.07%`，`DashboardBoard.vue` 行覆盖 `95.34%`。
- 后续：继续按覆盖率杠杆转向 `AuditDecisionReplayPanel.vue`、`PurchaseBoard.vue`、`QualityBoard.vue` 等 0 覆盖关键入口；发布级 B 轨证据仍不完整。

## 6.6 PurchaseBoard Create Dialog A11y 切片

- 目标：按 Coverage-Leverage Routing 打开 `/purchase` 采购协同入口的首个组件测试，并补强新建采购单 modal 的可访问性语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `PurchaseBoard.vue` 为 `0.00%` 行覆盖、约 `1562` 行；`/purchase` 是缺料采购加急、供应风险升级和 OTD 证据闭环入口。
- 红灯：`purchase-board.test.ts` 复现点击“+ 新建”后新建表单已打开，但缺少 `[role="dialog"]`。
- 修复：`PurchaseBoard.vue` 为新建采购订单弹窗增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="create-purchase-order-title"`，并给标题设置稳定 id。
- 验证：PurchaseBoard 测试 `1/1 passed`；相邻组合 `3/3 passed`；full lint 通过；full unit `52 files / 227 tests passed`；coverage `52 files / 227 tests passed`，总行/语句覆盖率 `53.60%`，`PurchaseBoard.vue` 行覆盖 `66.04%`。
- 后续：继续按覆盖率杠杆转向 `AuditDecisionReplayPanel.vue`、`QualityBoard.vue`、`QualityCapaTaskPanel.vue` 等 0 覆盖关键入口，或继续补 `PurchaseBoard.vue` 收货弹窗 dialog 语义；发布级 B 轨证据仍不完整。

## 6.6 AuditDecisionReplayPanel Replay Selection A11y 切片

- 目标：按 Coverage-Leverage Routing 打开 AI 决策审计回放组件的首个测试，并补强回放按钮当前选择的可访问性语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `AuditDecisionReplayPanel.vue` 为 `0.00%` 行覆盖、约 `1648` 行；该组件支撑审计回放、安全签字证据复核和 AI 决策可追溯视图，优先级高于继续精修已高覆盖组件。
- 红灯：`audit-decision-replay-panel.test.ts` 复现默认回放按钮缺少 `aria-pressed`，首个按钮属性值为 `undefined`。
- 修复：`AuditDecisionReplayPanel.vue` 为“回放决策链”按钮增加动态 `aria-pressed`，选中项为 `true`，非选中项为 `false`。
- 验证：AuditDecisionReplayPanel 测试 `1/1 passed`；相邻组合 `3/3 passed`；full lint 通过；full unit `53 files / 228 tests passed`；coverage `53 files / 228 tests passed`，总行/语句覆盖率 `54.83%`，`AuditDecisionReplayPanel.vue` 行覆盖 `35.86%`。
- 后续：继续按覆盖率杠杆转向 `QualityBoard.vue`、`QualityCapaTaskPanel.vue`、`MonitoringBoard.vue`、`KnowledgeGovernancePanel.vue` 等 0 覆盖关键入口；发布级 B 轨证据仍不完整，必须单独追 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 QualityBoard Root Cause Dialog A11y 切片

- 目标：按 Coverage-Leverage Routing 打开 `/quality` 质量闭环入口的首个组件测试，并补强根因分析浮动面板的可访问性语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `QualityBoard.vue` 为 `0.00%` 行覆盖、约 `1319` 行；`/quality` 是质量处置、CAPA、MRB、审计定位和 OTD 证据闭环入口。
- 红灯：`quality-board.test.ts` 复现点击“根因分析”后 `.analysis-panel` 已渲染，但缺少 `[role="dialog"]`。
- 修复：`QualityBoard.vue` 为根因分析面板增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="root-cause-analysis-title"`，并给标题设置稳定 id。
- 验证：QualityBoard 测试 `1/1 passed`；相邻组合 `3/3 passed`；full lint 通过；full unit `54 files / 229 tests passed`；coverage `54 files / 229 tests passed`，总行/语句覆盖率 `59.76%`，`QualityBoard.vue` 行覆盖 `80.98%`。
- 后续：继续按覆盖率杠杆转向 `MonitoringBoard.vue`、`KnowledgeGovernancePanel.vue`、`SkillMatrixPanel.vue`、`DocumentUpload.vue`、`RiskActionQueuePanel.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整。

## 6.6 MonitoringBoard Equipment Drawer A11y 切片

- 目标：按 Coverage-Leverage Routing 打开 `/monitoring` 实时监控入口的首个组件测试，并补强设备卡片和详情抽屉的键盘/辅助技术语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `MonitoringBoard.vue` 为 `0.00%` 行覆盖、约 `1048` 行；`/monitoring` 是现场态势、设备监控和 Hypercare 观察入口。
- 红灯：`monitoring-board.test.ts` 复现首个设备卡片缺少 `role="button"`，属性值为 `undefined`。
- 修复：`MonitoringBoard.vue` 为设备卡片增加 button 角色、键盘焦点、设备详情 aria-label、Enter/Space 键入口，并为设备详情抽屉增加 labelled dialog 语义。
- 验证：MonitoringBoard 测试 `1/1 passed`；相邻组合 `3/3 passed`；full lint 通过；full unit `55 files / 230 tests passed`；coverage `55 files / 230 tests passed`，总行/语句覆盖率 `62.59%`，`MonitoringBoard.vue` 行覆盖 `90.54%`。
- 后续：继续按覆盖率杠杆转向 `KnowledgeGovernancePanel.vue`、`SkillMatrixPanel.vue`、`DocumentUpload.vue`、`RiskActionQueuePanel.vue`、`BomBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整。

## 6.6 KnowledgeGovernancePanel Review Button A11y 切片

- 目标：按 Coverage-Leverage Routing 打开知识治理组件的首个单测，并补强待复核文档按钮的文档级可访问名称。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `KnowledgeGovernancePanel.vue` 为 `0.00%` 行覆盖、约 `896` 行；知识治理支撑 RAG 来源、引用追踪、质量知识资产和合规口径。
- 红灯：`knowledge-governance-panel.test.ts` 复现文档复核按钮缺少 `aria-label`，属性值为 `undefined`。
- 修复：`KnowledgeGovernancePanel.vue` 为文档复核按钮增加动态 `aria-label`，把文档标题纳入可访问名称。
- 验证：KnowledgeGovernancePanel 测试 `1/1 passed`；相邻组合 `3/3 passed`；full lint 通过；full unit `56 files / 231 tests passed`；coverage `56 files / 231 tests passed`，总行/语句覆盖率 `63.88%`，`KnowledgeGovernancePanel.vue` 行覆盖 `68.78%`。
- 后续：继续按覆盖率杠杆转向 `SkillMatrixPanel.vue`、`DocumentUpload.vue`、`RiskActionQueuePanel.vue`、`BomBoard.vue`、`EquipmentBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整。

## 6.6 SkillMatrixPanel Qualification Block Alert A11y 切片

- 目标：按 Coverage-Leverage Routing 打开人员技能矩阵组件的首个单测，并补强资质阻断/无替班候选场景的即时告警语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `SkillMatrixPanel.vue` 为 `0.00%` 行覆盖、约 `853` 行；人员技能、资质有效期和替班阻断直接影响生产开工放行和审计证据链。
- 红灯：`skill-matrix-panel.test.ts` 复现无有效替班候选时 `.qualification-review` 缺少 `role="alert"`；补语义后进一步复现首屏告警正文没有明确 `无有效替班候选`。
- 修复：`SkillMatrixPanel.vue` 为停工复核区域补 `role="alert"`、`aria-labelledby` 和标题 id；新增 `reviewAlertMessage`，在无候选阻断初始状态下直接展示阻断原因。
- 验证：SkillMatrixPanel 测试 `1/1 passed`；相邻组合 `4/4 passed`；full lint 通过；full unit `57 files / 232 tests passed`；coverage `57 files / 232 tests passed`，总行/语句覆盖率 `64.54%`，`SkillMatrixPanel.vue` 行覆盖 `84.57%`。
- 后续：继续按覆盖率杠杆转向 `DocumentUpload.vue`、`RiskActionQueuePanel.vue`、`BomBoard.vue`、`EquipmentBoard.vue`、`KittingClosurePanel.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 DocumentUpload Drop Zone A11y 切片

- 目标：按 Coverage-Leverage Routing 打开知识文档上传组件的首个单测，并补强拖拽/点击上传入口的键盘可访问性。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `DocumentUpload.vue` 为 `0.00%` 行覆盖、约 `817` 行；知识源上传是 RAG 来源、质量知识再训练和合规口径确认的入口。
- 红灯：`document-upload.test.ts` 复现 `.drop-zone` 缺少 `role="button"`，且没有键盘触发隐藏 file input 的入口。
- 修复：`DocumentUpload.vue` 为 `.drop-zone` 增加 button 语义、tab 焦点、可访问名称和 `openFilePicker()`，覆盖点击、Enter、Space 三种触发。
- 验证：DocumentUpload 测试 `1/1 passed`；相邻组合 `4/4 passed`；full lint 通过；full unit `58 files / 233 tests passed`；coverage `58 files / 233 tests passed`，总行/语句覆盖率 `65.52%`，`DocumentUpload.vue` 行覆盖 `57.92%`。
- 后续：继续按覆盖率杠杆转向 `RiskActionQueuePanel.vue`、`BomBoard.vue`、`EquipmentBoard.vue`、`KittingClosurePanel.vue`、`AnomalyBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 RiskActionQueuePanel Card Action A11y 切片

- 目标：按 Coverage-Leverage Routing 打开风险处置队列组件的首个单测，并补强风险卡片动作按钮的上下文可访问名称。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `RiskActionQueuePanel.vue` 为 `0.00%` 行覆盖、约 `802` 行；该组件连接跨模块风险处置、SLA 晨会、OTD 证据和审计回放。
- 红灯：`risk-action-queue-panel.test.ts` 复现首张风险卡的“升级”按钮缺少风险标题级 `aria-label`，属性值为 `undefined`。
- 修复：`RiskActionQueuePanel.vue` 为卡片“转派/升级/关闭”按钮增加动态 `aria-label`，保留原短按钮视觉文案。
- 验证：RiskActionQueuePanel 测试 `1/1 passed`；相邻组合 `12/12 passed`；full lint 通过；full unit `59 files / 234 tests passed`；coverage `59 files / 234 tests passed`，总行/语句覆盖率 `67.71%`，`RiskActionQueuePanel.vue` 行覆盖 `80.04%`。
- 后续：继续按覆盖率杠杆转向 `BomBoard.vue`、`EquipmentBoard.vue`、`KittingClosurePanel.vue`、`AnomalyBoard.vue`、`RiskBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 BomBoard List Selection A11y 切片

- 目标：按 Coverage-Leverage Routing 打开 BOM 管理入口的首个单测，并补强 BOM 列表选择的键盘和辅助技术语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `BomBoard.vue` 为 `0.00%` 行覆盖、约 `668` 行；BOM、替代料和齐套检查是排产、采购、库存和 OTD 证据链的共享输入。
- 红灯：`bom-board.test.ts` 复现 BOM 列表缺少 `[role="listbox"]`，列表项缺少 option 语义和键盘选择入口。
- 修复：`BomBoard.vue` 为 `.list-items` 增加 `role="listbox"` / `aria-label`；为 `.list-item` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 选择。
- 验证：BomBoard 测试 `1/1 passed`；相邻组合 `3/3 passed`；full lint 通过；full unit `60 files / 235 tests passed`；coverage `60 files / 235 tests passed`，总行/语句覆盖率 `68.72%`，`BomBoard.vue` 行覆盖 `72.95%`。
- 后续：继续按覆盖率杠杆转向 `EquipmentBoard.vue`、`KittingClosurePanel.vue`、`AnomalyBoard.vue`、`RiskBoard.vue`、`RoutingBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 EquipmentBoard Type Filter Regression 切片

- 目标：按 Coverage-Leverage Routing 打开设备管理入口的首个单测，并修复设备类型筛选反向显示的真实回归。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `EquipmentBoard.vue` 为 `0.00%` 行覆盖、约 `662` 行；`/equipment` 是设备状态、维护记录、健康监控和排产设备约束入口。
- 红灯：`equipment-board.test.ts` 复现选择 `CNC` 类型后列表显示 `ASM-001 装配线`，说明当前筛选排除了所选类型。
- 修复：`EquipmentBoard.vue` 的 `filteredEquipment` 类型条件改为 `equipmentType === typeFilter`。
- 验证：EquipmentBoard 测试 `1/1 passed`；相邻组合 `11/11 passed`；full lint 通过；full unit `61 files / 236 tests passed`；coverage `61 files / 236 tests passed`，总行/语句覆盖率 `69.85%`，`EquipmentBoard.vue` 行覆盖 `79.00%`。
- 后续：继续按覆盖率杠杆转向 `KittingClosurePanel.vue`、`AnomalyBoard.vue`、`RiskBoard.vue`、`RoutingBoard.vue`、`InventoryBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 KittingClosurePanel Shortage Action A11y 切片

- 目标：按 Coverage-Leverage Routing 打开库存齐套闭环组件的首个单测，并补强缺料排产事件按钮的工单/物料上下文。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `KittingClosurePanel.vue` 为 `0.00%` 行覆盖、约 `624` 行；该组件连接 BOM、库存、排产窗口、短缺事件和 OTD 证据链。
- 红灯：`kitting-closure-panel.test.ts` 复现首张工单的“生成缺料排产事件”按钮 `aria-label` 为 `undefined`，无法区分按钮作用对象。
- 修复：`KittingClosurePanel.vue` 新增 `firstShortageItem()` 和 `shortageActionLabel()`，为按钮补动态 `aria-label`，并让事件发布复用同一首个缺料判断。
- 验证：KittingClosurePanel 测试 `1/1 passed`；相邻组合 `11/11 passed`；full lint 通过；full unit `62 files / 237 tests passed`；coverage `62 files / 237 tests passed`，总行/语句覆盖率 `71.91%`，`KittingClosurePanel.vue` 行覆盖 `92.95%`。
- 后续：继续按覆盖率杠杆转向 `AnomalyBoard.vue`、`RiskBoard.vue`、`RoutingBoard.vue`、`InventoryBoard.vue`、`ScannerBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 AnomalyBoard List Selection A11y 切片

- 目标：按 Coverage-Leverage Routing 打开异常管理入口的首个单测，并补强异常卡片列表的键盘和辅助技术语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `AnomalyBoard.vue` 为剩余 0 覆盖大组件之一；`/anomaly` 是现场异常处置、事件分流、风险队列和 OTD 复盘的关键入口。
- 红灯：`anomaly-board.test.ts` 复现异常卡片缺少 `[role="option"]`，列表无法被测试按可访问选项获取。
- 修复：`AnomalyBoard.vue` 为 `.anomaly-list` 增加 `role="listbox"` / `aria-label`；为 `.anomaly-card` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 选择。
- 验证：AnomalyBoard 测试 `1/1 passed`；相邻组合 `12/12 passed`；full lint 通过；full unit `63 files / 238 tests passed`；coverage `63 files / 238 tests passed`，当前总行/语句覆盖率 `71.84%`，`AnomalyBoard.vue` 行覆盖 `70.91%`。
- 后续：继续按覆盖率杠杆转向 `RiskBoard.vue`、`RoutingBoard.vue`、`InventoryBoard.vue`、`ScannerBoard.vue`、`EmployeeBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 RiskBoard Load Failure Alert 切片

- 目标：按 Coverage-Leverage Routing 打开风险看板入口的首个单测，并补强风险 API 加载失败降级状态的可访问性播报。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `RiskBoard.vue` 为剩余低覆盖关键组件之一；`/risk` 是风险队列、延期风险、设备故障、物料齐套和瓶颈预警的发布风险入口。
- 红灯：`risk-board.test.ts` 复现风险 API 失败后 `.error-banner` 已显示 `加载失败...（已加载演示数据）`，但缺少 `[role="alert"]`。
- 修复：`RiskBoard.vue` 为 `.error-banner` 增加 `role="alert"` / `aria-live="assertive"`。
- 验证：RiskBoard 测试 `1/1 passed`；相邻组合 `12/12 passed`；full lint 通过；full unit `64 files / 239 tests passed`；coverage `64 files / 239 tests passed`，总行/语句覆盖率 `73.75%`，`RiskBoard.vue` 行覆盖 `99.80%`。
- 后续：继续按覆盖率杠杆转向 `RoutingBoard.vue`、`InventoryBoard.vue`、`ScannerBoard.vue`、`EmployeeBoard.vue`、`BarcodePrintBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 RoutingBoard List Selection A11y 切片

- 目标：按 Coverage-Leverage Routing 打开工艺路线管理入口的首个单测，并补强路线列表选择的键盘和辅助技术语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `RoutingBoard.vue` 为剩余 0 覆盖关键组件之一；`/routing` 是工艺路线、工序能力、质量门和排产约束的发布关键入口。
- 红灯：`routing-board.test.ts` 复现路线列表缺少 `[role="listbox"]`，DOM 中只有普通 `.list-items` 和 `.list-item`。
- 修复：`RoutingBoard.vue` 为 `.list-items` 增加 `role="listbox"` / `aria-label`；为 `.list-item` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 选择。
- 验证：RoutingBoard 测试 `1/1 passed`；相邻组合 `8/8 passed`；full lint 通过；full unit `65 files / 240 tests passed`；coverage `65 files / 240 tests passed`，总行/语句覆盖率 `74.47%`，`RoutingBoard.vue` 行覆盖 `85.26%`。
- 后续：继续按覆盖率杠杆转向 `InventoryBoard.vue`、`ScannerBoard.vue`、`EmployeeBoard.vue`、`BarcodePrintBoard.vue`、`AuditLogBoard.vue` 等仍为 0 覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 InventoryBoard List Selection A11y 切片

- 目标：按 Coverage-Leverage Routing 打开库存管理入口的首个单测，并补强物料列表选择的键盘和辅助技术语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `InventoryBoard.vue` 本轮前为低覆盖关键组件；`/inventory` 是库存、缺料、齐套、采购协同和 OTD 证据链的发布关键入口。
- 红灯：`inventory-board.test.ts` 复现物料列表缺少 `[role="listbox"]`，DOM 中只有普通 `.list-items` 和 `.list-item`。
- 修复：`InventoryBoard.vue` 为 `.list-items` 增加 `role="listbox"` / `aria-label`；为 `.list-item` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 选择。
- 验证：InventoryBoard 测试 `1/1 passed`；相邻组合 `13/13 passed`；full lint 通过；full unit `66 files / 241 tests passed`；coverage `66 files / 241 tests passed`，总行/语句覆盖率 `74.34%`，`InventoryBoard.vue` 行覆盖 `85.32%`。
- 后续：继续按覆盖率杠杆转向 `ScannerBoard.vue`、`EmployeeBoard.vue`、`BarcodePrintBoard.vue`、`AuditLogBoard.vue` 等仍为低覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 ScannerBoard Camera Placeholder A11y 切片

- 目标：按 Coverage-Leverage Routing 打开现场扫码入口的首个单测，并补强摄像头占位区的键盘和辅助技术语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `ScannerBoard.vue` 本轮前为 `0.00%` 行覆盖；`/scanner` 是现场扫码、工单到站、设备点检、物料齐套和证据链写入的发布关键入口。
- 红灯：`scanner-board.test.ts` 复现摄像头占位区缺少 `role="button"`，属性值为 `undefined`。
- 修复：`ScannerBoard.vue` 为 `.scanner-placeholder` 增加 `role="button"`、`tabindex="0"`、`aria-label="开启摄像头扫描"`，并支持 Enter/Space 开启摄像头。
- 验证：ScannerBoard 测试 `1/1 passed`；相邻组合 `10/10 passed`；full lint 通过；full unit `67 files / 242 tests passed`；coverage `67 files / 242 tests passed`，总行/语句覆盖率 `74.82%`，`ScannerBoard.vue` 行覆盖 `63.08%`。
- 后续：继续按覆盖率杠杆转向 `EmployeeBoard.vue`、`BarcodePrintBoard.vue`、`AuditLogBoard.vue` 等仍为低覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 EmployeeBoard Card Keyboard A11y 切片

- 目标：按 Coverage-Leverage Routing 打开人员管理入口的首个单测，并补强员工卡片的键盘和辅助技术语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `EmployeeBoard.vue` 本轮前为 `0.00%` 行覆盖；`/employee` 是人员资质、替班放行和生产开工阻断解释的发布关键入口。
- 红灯：`employee-board.test.ts` 复现员工卡片缺少 `role="button"`，属性值为 `undefined`。
- 修复：`EmployeeBoard.vue` 为 `.emp-card` 增加 `role="button"`、`tabindex="0"`、员工级 `aria-label`，并支持 Enter/Space 打开详情。
- 验证：EmployeeBoard 测试 `1/1 passed`；相邻组合 `8/8 passed`；full lint 通过；full unit `68 files / 243 tests passed`；coverage `68 files / 243 tests passed`，总行/语句覆盖率 `76.15%`，`EmployeeBoard.vue` 行覆盖 `76.58%`。
- 后续：继续按覆盖率杠杆转向 `BarcodePrintBoard.vue`、`AuditLogBoard.vue` 等仍为低覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 BarcodePrintBoard Label Selection A11y 切片

- 目标：按 Coverage-Leverage Routing 打开条码打印入口的首个单测，并补强标签卡片选择的键盘和辅助技术语义。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `BarcodePrintBoard.vue` 本轮前为 `0.00%` 行覆盖；条码/QR 打印是扫码验证、工单/设备/物料追溯标签的发布关键入口。
- 红灯：`barcode-print-board.test.ts` 复现标签卡片缺少 `role="checkbox"`，属性值为 `undefined`。
- 修复：`BarcodePrintBoard.vue` 为 `.label-card` 增加 `role="checkbox"`、`tabindex="0"`、动态 `aria-checked`、动态 `aria-label`，并支持 Enter/Space 选择。
- 验证：BarcodePrintBoard 测试 `1/1 passed`；相邻组合 `9/9 passed`；full lint 通过；full unit `69 files / 244 tests passed`；coverage `69 files / 244 tests passed`，总行/语句覆盖率 `75.73%`，`BarcodePrintBoard.vue` 行覆盖 `81.43%`。
- 后续：继续按覆盖率杠杆转向 `AuditLogBoard.vue` 等仍为低覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 AuditLogBoard Detail Action A11y 切片

- 目标：按 Coverage-Leverage Routing 打开审计日志入口的首个单测，并补强表格详情动作的审计记录上下文。
- 成功标准：新增组件测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `AuditLogBoard.vue` 本轮前为 `0.00%` 行覆盖；审计日志是安全签字、合规回放、Agent 决策证据和发布验收的关键入口。
- 红灯：`audit-log-board.test.ts` 复现第二条审计日志的“详情”按钮缺少上下文 `aria-label`，属性值为 `undefined`。
- 修复：`AuditLogBoard.vue` 为详情按钮增加 `detailActionLabel(log)`，动态暴露用户、动作标签、资源和资源 ID。
- 验证：AuditLogBoard 测试 `1/1 passed`；相邻组合 `8/8 passed`；full lint 通过；full unit `70 files / 245 tests passed`；coverage `70 files / 245 tests passed`，总行/语句覆盖率 `76.96%`，`AuditLogBoard.vue` 行覆盖 `91.62%`。
- 后续：继续按覆盖率杠杆转向仍低覆盖且用户关键的入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 AuditDecisionReplayPanel Replay Button A11y 切片

- 目标：按 Coverage-Leverage Routing 在最低覆盖审计回放组件上补强回放按钮的决策链上下文。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`coverage-summary.json` 显示 `AuditDecisionReplayPanel.vue` 当前为最低覆盖组件，行覆盖 `35.86%`；审计回放是安全签字、合规复核、Agent 决策解释和业务落库证据的关键入口。
- 红灯：`audit-decision-replay-panel.test.ts` 复现第二个“回放决策链”按钮缺少具体标题 `aria-label`，属性值为 `undefined`。
- 修复：`AuditDecisionReplayPanel.vue` 为 `.replay-btn` 增加动态 `aria-label="回放决策链：${item.title}"`。
- 验证：AuditDecisionReplayPanel 测试 `1/1 passed`；相邻组合 `8/8 passed`；full lint 通过；full unit `70 files / 245 tests passed`；coverage `70 files / 245 tests passed`，总行/语句覆盖率 `76.96%`，`AuditDecisionReplayPanel.vue` 行覆盖 `36.17%`。
- 后续：继续按覆盖率杠杆处理 `AuditDecisionReplayPanel.vue` 的真实 backend-first 映射分支，或转向 `ScheduleBoard.vue`、`DocumentUpload.vue`、`ProductionBoard.vue` 等低覆盖关键入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 AuditDecisionReplayPanel Backend Business Write Replay 切片

- 目标：按 Coverage-Leverage Routing 覆盖后端 Agent 业务落库审计回放，并补强回放详情业务页链接的业务对象上下文。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`AuditDecisionReplayPanel.vue` 仍是最低覆盖大组件；后端业务落库回放连接 Agent 决策、业务表真实写入、AuditLog 和业务页核对，是发布审计关键链路。
- 红灯：`audit-decision-replay-panel.test.ts` 复现采购收货落库回放的 `trace-link` 缺少 `aria-label`，属性值为 `undefined`。
- 修复：`AuditDecisionReplayPanel.vue` 为 `RouterLink.trace-link` 增加动态 `aria-label="打开${selectedItem.routeLabel}：${selectedItem.object}"`。
- 验证：AuditDecisionReplayPanel 测试 `2/2 passed`；相邻组合 `9/9 passed`；full lint 通过；full unit `70 files / 246 tests passed`；coverage `70 files / 246 tests passed`，总行/语句覆盖率 `77.08%`，`AuditDecisionReplayPanel.vue` 行覆盖 `39.73%`。
- 后续：继续覆盖质量处置/设备状态业务落库分支，或转向 `ScheduleBoard.vue`、`DocumentUpload.vue`、`ProductionBoard.vue` 等低覆盖关键入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 ScheduleBoard Optimization Warning Status A11y 切片

- 目标：按 Coverage-Leverage Routing 转向排产核心入口，补强优化成功预警的状态播报语义。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleBoard.vue` 是排产核心入口，当前行覆盖仍偏低；优化 warnings 连接瓶颈窗口、冲突和后端降级状态，是计划员必读的决策反馈。
- 红灯：`schedule-board.test.ts` 复现优化成功返回 warnings 后 `.warnings-bar` 缺少 `role="status"`，属性值为 `undefined`。
- 修复：`ScheduleBoard.vue` 为 `.warnings-bar` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="排产预警"`。
- 验证：ScheduleBoard 测试 `2/2 passed`；相邻组合 `14/14 passed`；full lint 通过；full unit `70 files / 247 tests passed`；coverage `70 files / 247 tests passed`，总行/语句覆盖率 `77.11%`，`ScheduleBoard.vue` 行覆盖 `47.05%`。
- 后续：继续按覆盖率杠杆处理 `ScheduleBoard.vue` 的业务高收益路径，或转向 `DocumentUpload.vue`、`ProductionBoard.vue` 等低覆盖关键入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 ProductionBoard Work Order List Selection A11y 切片

- 目标：按 Coverage-Leverage Routing 转向生产执行主入口，补强生产工单列表的键盘选择和辅助技术语义。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`ProductionBoard.vue` 行覆盖仍偏低，且生产工单选择是开工、完工、异常上报、扫码上下文和 OTD 证据链的主入口动作。
- 红灯：`production-board.test.ts` 复现工单列表缺少 `[role="listbox"]`，DOM 中只有普通 `.wo-list` 和 `.wo-card`。
- 修复：`ProductionBoard.vue` 为 `.wo-list` 增加 `role="listbox"` / `aria-label`；为 `.wo-card` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`、动态 `aria-label`，并支持 Enter/Space 选择。
- 验证：ProductionBoard 测试 `3/3 passed`；相邻组合 `17/17 passed`；full lint 通过；full unit `70 files / 248 tests passed`；coverage `70 files / 248 tests passed`，总行/语句覆盖率 `77.13%`，`ProductionBoard.vue` 行覆盖 `59.28%`。
- 后续：继续按覆盖率杠杆处理 `DocumentUpload.vue`、`PurchaseBoard.vue`、`ScannerBoard.vue` 或 `ScheduleBoard.vue` 的业务高收益路径；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 DocumentUpload Rejected File Alert A11y 切片

- 目标：按 Coverage-Leverage Routing 转向知识文档入口，补强文件拒绝错误的即时播报语义。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`DocumentUpload.vue` 行覆盖仍偏低；上传入口连接知识库、客户工单样例和质量知识治理，是发布验收与证据准备的关键入口。
- 红灯：`document-upload.test.ts` 复现选择 `virus.exe` 后 `.error-msg` 已显示，但缺少 `[role="alert"]`。
- 修复：`DocumentUpload.vue` 为 `.error-msg` 增加 `role="alert"` 和 `aria-live="assertive"`。
- 验证：DocumentUpload 测试 `2/2 passed`；相邻组合 `12/12 passed`；full lint 通过；full unit `70 files / 249 tests passed`；coverage `70 files / 249 tests passed`，总行/语句覆盖率 `77.16%`，`DocumentUpload.vue` 行覆盖 `59.73%`。
- 后续：继续按覆盖率杠杆处理 `PurchaseBoard.vue`、`ScannerBoard.vue`、`AuditDecisionReplayPanel.vue` 或 `DocumentUpload.vue` 的真实上传链路；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 PurchaseBoard Purchase Order List Selection A11y 切片

- 目标：按 Coverage-Leverage Routing 转向采购协同入口，补强采购订单列表的键盘选择和辅助技术语义。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`PurchaseBoard.vue` 行覆盖仍偏低，且采购订单选择是缺料加急、供应风险、替代供应商、外协到货和物料明细核对的主入口动作。
- 红灯：`purchase-board.test.ts` 复现采购订单列表缺少 `[role="listbox"]`，DOM 中只有普通 `.list-items` 和 `.list-item`。
- 修复：`PurchaseBoard.vue` 为 `.list-items` 增加 `role="listbox"` / `aria-label`；为 `.list-item` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`、动态 `aria-label`，并支持 Enter/Space 选择。
- 验证：PurchaseBoard 测试 `2/2 passed`；相邻组合 `8/8 passed`；full lint 通过；full unit `70 files / 250 tests passed`；coverage `70 files / 250 tests passed`，总行/语句覆盖率 `77.27%`，`PurchaseBoard.vue` 行覆盖 `69.37%`。
- 后续：继续按覆盖率杠杆处理 `ScheduleBoard.vue`、`ScannerBoard.vue`、`AuditDecisionReplayPanel.vue` 或 `PurchaseBoard.vue` 的业务高收益路径；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 ScannerBoard Manual Scan History Replay A11y 切片

- 目标：按 Coverage-Leverage Routing 转向现场扫码入口，补强手动扫码历史重放的键盘和辅助技术语义。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`ScannerBoard.vue` 行覆盖和函数覆盖仍偏低，且手动扫码历史重放连接现场纠错、工单到站复核和扫码证据链回看。
- 红灯：`scanner-board.test.ts` 复现手动输入 `WO-RUSH-9001` 生成历史后 `.history-item` 缺少 `role="button"`，属性值为 `undefined`。
- 修复：`ScannerBoard.vue` 为 `.history-item` 增加 `role="button"`、`tabindex="0"`、动态 `aria-label`，并支持 Enter/Space 重扫历史编码。
- 验证：ScannerBoard 测试 `2/2 passed`；相邻组合 `14/14 passed`；full lint 通过；full unit `70 files / 251 tests passed`；coverage `70 files / 251 tests passed`，总行/语句覆盖率 `77.41%`，`ScannerBoard.vue` 行覆盖 `80.55%`，函数覆盖 `43.75%`。
- 后续：继续按覆盖率杠杆处理 `ScheduleBoard.vue`、`AuditDecisionReplayPanel.vue`、`KnowledgeGovernancePanel.vue` 或 `DocumentUpload.vue` 的业务高收益路径；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 KnowledgeGovernancePanel Next Training Merge Action A11y 切片

- 目标：按 Coverage-Leverage Routing 转向质量知识资产治理入口，补强下一轮训练集合并动作的业务对象上下文。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`KnowledgeGovernancePanel.vue` 行覆盖和函数覆盖仍偏低，且下一轮训练集合并是质量知识从现场反馈进入灰度前治理链路的入口动作。
- 红灯：`knowledge-governance-panel.test.ts` 复现“合并现场反馈”按钮缺少资产标题 `aria-label`，属性值为 `undefined`。
- 修复：`KnowledgeGovernancePanel.vue` 为下一轮训练集的合并按钮增加动态 `aria-label="合并现场反馈：${asset.title}"`。
- 验证：KnowledgeGovernancePanel 测试 `2/2 passed`；相邻组合 `13/13 passed`；full lint 通过；full unit `70 files / 252 tests passed`；coverage `70 files / 252 tests passed`，总行/语句覆盖率 `77.68%`，`KnowledgeGovernancePanel.vue` 行覆盖 `83.40%`，函数覆盖 `17.94%`。
- 后续：继续按覆盖率杠杆处理 `ScheduleBoard.vue`、`AuditDecisionReplayPanel.vue`、`DocumentUpload.vue` 或质量知识治理的审批/校验/灰度发布路径；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 ScheduleBoard Task Detail Loading State 切片

- 目标：按 Coverage-Leverage Routing 覆盖排产任务点击进入详情的主链路，补齐真实工单详情请求期间的加载态。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`ScheduleBoard.vue` 是排产核心入口，任务详情和排产解释是计划员从甘特图理解 Agent 决策的必经路径；候选时行覆盖 `47.05%`，仍明显低于已高覆盖组件。
- 红灯：`schedule-board.test.ts` 复现 `GanttChart` 发出 `task-click` 且 `getWorkOrderById` pending 时，详情面板 `loading` 属性仍为 `false`。
- 修复：`ScheduleBoard.vue` 在 `handleTaskClick()` 中打开本地任务解释后立即设置 `detailLoading.value = true`，再发起真实工单详情请求。
- 验证：ScheduleBoard 测试 `3/3 passed`；相邻组合 `25/25 passed`；full lint 通过；full unit `70 files / 253 tests passed`；coverage `70 files / 253 tests passed`，总行/语句覆盖率 `77.86%`，`ScheduleBoard.vue` 行覆盖 `50.25%`。
- 后续：继续按覆盖率杠杆处理 `AuditDecisionReplayPanel.vue`、`ProductionBoard.vue`、`DocumentUpload.vue` 或 `ScheduleBoard.vue` 的后端成功/失败详情分支；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。

## 6.6 AuditDecisionReplayPanel Config Approval List A11y 切片

- 目标：按 Coverage-Leverage Routing 补强审计回放面板中的关键配置变更审批清单，让安全/合规复核人员能按列表理解待审批项。
- 成功标准：测试先红灯，修复后目标测试、相邻组合、full lint、full unit 和 coverage 通过，并追加当天五份 `_docs` 记录。
- 选片依据：`AuditDecisionReplayPanel.vue` 仍是低覆盖审计关键组件，行覆盖 `39.73%`；配置审批影响 Agent 推荐阈值、质量灰度门禁和发布签字口径。
- 红灯：`audit-decision-replay-panel.test.ts` 复现 pending 配置审批出现后 `.approval-lane` 缺少 `role="list"`，属性值为 `undefined`。
- 修复：`AuditDecisionReplayPanel.vue` 为审批区域增加 list 语义和名称，为审批行增加 listitem 语义和包含标题/状态/责任人的动态 label。
- 验证：AuditDecisionReplayPanel 测试 `3/3 passed`；相邻组合 `15/15 passed`；full lint 通过；full unit `70 files / 254 tests passed`；coverage `70 files / 254 tests passed`，总行/语句覆盖率 `77.95%`，`AuditDecisionReplayPanel.vue` 行覆盖 `42.47%`。
- 后续：继续覆盖质量处置/设备状态业务落库分支，或转向 `ScheduleBoard.vue`、`ProductionBoard.vue`、`DocumentUpload.vue` 等低覆盖关键入口；发布级 B 轨证据仍不完整，不能用 A 轨覆盖率提升替代 hosted CI、staging、Attack Chain、安全签字、灰度和观察窗口。
