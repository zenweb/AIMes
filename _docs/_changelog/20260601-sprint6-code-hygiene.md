# 2026-06-01 Sprint 6 Code Hygiene

## 6.6 Login Page Stale Error Clear 单测补强

- 红灯：扩展 `login-page.test.ts` 后，登录失败再编辑密码时旧错误 alert 仍保留，用户名/密码输入框继续带 `aria-invalid` 和 `aria-describedby`。
- `LoginPage.vue` 现在在用户名或密码输入变化时清理已有错误，避免用户修改凭据后继续看到过期的表单错误状态。
- 该修复只清理输入变化后的 stale error，不改变提交入口 trim、失败清空密码、失败后聚焦密码框、成功跳转或 auth store 调用逻辑。
- 红绿证据：先运行目标测试得到 `1 failed / 8 passed`，失败点为 `[role="alert"]` 仍存在；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`9/9 passed`。
- 相邻验证：`npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/auth-token.test.ts tests/unit/router-auth.test.ts` 通过，`11/11 passed`。

## 6.6 Login Page Validation Focus Recovery 单测补强

- 红灯：扩展 `login-page.test.ts` 后，纯空白凭据提交会显示校验错误，但焦点仍停在 `body`，目标测试期望焦点回到用户名输入框。
- `LoginPage.vue` 现在为用户名输入框维护 `ref`，空白凭据校验失败后等待 DOM 更新并聚焦用户名输入框。
- 该修复只改变前端校验失败路径的焦点管理，不改变 trim 校验、错误文案、登录失败密码清空、失败后密码框聚焦或成功跳转逻辑。
- 红绿证据：先运行目标测试得到 `1 failed / 9 passed`，失败点为 `document.activeElement` 仍是 `body`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`10/10 passed`。
- 相邻验证：`npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/auth-token.test.ts tests/unit/router-auth.test.ts` 通过，`11/11 passed`。

## 6.6 Login Page First Invalid Field Focus 单测补强

- 红灯：扩展 `login-page.test.ts` 后，用户名有效但密码为空白时，校验失败焦点仍固定回用户名输入框，目标测试期望焦点落到密码输入框。
- `LoginPage.vue` 现在在空白校验失败后按第一个缺失字段选择焦点：用户名为空时聚焦用户名，否则聚焦密码。
- 该修复只细化校验失败焦点目标，不改变表单级错误文案、字段错误关联、提交 guard、登录失败清空密码或成功跳转逻辑。
- 红绿证据：先运行目标测试得到 `1 failed / 10 passed`，失败点为 active element 是 `#username` 而不是 `#password`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`11/11 passed`。
- 相邻验证：`npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/auth-token.test.ts tests/unit/router-auth.test.ts` 通过，`11/11 passed`。

## 6.6 Login Page Field-Level Invalid State 单测补强

- 红灯：扩展 `login-page.test.ts` 后，用户名有效但密码为空白时，用户名字段仍带 `aria-invalid="true"`，目标测试期望只有真正缺失的密码字段被标记为 invalid。
- `LoginPage.vue` 现在维护 `usernameFieldInvalid` / `passwordFieldInvalid`，空白校验失败时只标记缺失字段；登录接口失败仍按凭证组合错误同时关联用户名和密码。
- 该修复只细化前端空白校验的字段级可访问性状态，不改变错误文案、提交 trim、登录失败清空密码、失败后聚焦密码或成功跳转逻辑。
- 红绿证据：先运行目标测试得到 `1 failed / 11 passed`，失败点为 `#username` 的 `aria-invalid` 仍是 `true`；修复后 `npm run test:unit -- tests/unit/login-page.test.ts` 通过，`12/12 passed`。
- 相邻验证：`npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/auth-token.test.ts tests/unit/router-auth.test.ts` 通过，`11/11 passed`；`npm run test:unit:coverage` 通过，`45 files / 219 tests passed`，总行/语句覆盖率 `17.8%`，`LoginPage.vue` 行覆盖 `100%`；`npm run test:unit` 通过，`45 files / 219 tests passed`；`npm run lint` 通过。

## 6.6 MainLayout Mobile Menu A11y 单测补强

- 红灯：新增 `main-layout.test.ts` 后，移动菜单按钮缺少 `aria-expanded`，目标测试期望关闭态为 `false`，打开后为 `true`，并通过 `aria-controls` 关联菜单面板。
- `MainLayout.vue` 现在为移动菜单按钮暴露 `aria-expanded` 和 `aria-controls="mobile-nav-panel"`，打开后的移动导航面板带稳定 `id="mobile-nav-panel"`。
- 该修复只补充移动菜单的可访问性状态和受控区域关联，不改变菜单开合、导航分组、退出登录、通知连接或暗色模式逻辑。
- 测试夹具复用 `installMemoryLocalStorage()`，避免 Vitest 环境里的空 `localStorage` 对象导致组件挂载路径误失败。
- 红绿证据：先运行目标测试时夹具失败为 `localStorage.clear is not a function`，修正夹具后得到目标红灯 `aria-expanded` 为 `undefined`；修复后 `npm run test:unit -- tests/unit/main-layout.test.ts` 通过，`1/1 passed`。
- 相邻验证：`npm run test:unit -- tests/unit/login-page.test.ts` 通过，`12/12 passed`；`npm run test:unit:coverage` 通过，`46 files / 220 tests passed`，总行/语句覆盖率 `24.19%`，`MainLayout.vue` 行覆盖 `93.58%`；`npm run test:unit` 通过，`46 files / 220 tests passed`；`npm run lint` 通过。

## 6.6 外审后覆盖率杠杆路由

- Claude Opus 4.8 外审建议：停止继续精修已高覆盖组件，把 6.6 选片规则改为“覆盖率最低 且 用户必经/业务关键”。
- 已核对覆盖率证据：`coverage-summary.json` 当前总行/语句覆盖率 `24.19%`；`LoginPage.vue` `100%`，`MainLayout.vue` `93.58%`，`ScheduleBoard.vue` `0.00%` 且约 `2771` 行。
- 文档已新增双轨追踪：A 轨继续覆盖率/a11y 质量打磨；B 轨单独追 hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口。
- 下一实现切片调整为 `ScheduleBoard.vue` 首个高价值组件测试，避免已覆盖登录页继续插队。

## 6.6 ScheduleBoard Optimize Error Alert 单测补强

- 红灯：新增 `schedule-board.test.ts` 后，优化接口失败会渲染 `.error-banner`，但缺少 `[role="alert"]`，目标测试无法获取 alert。
- `ScheduleBoard.vue` 现在为优化/保存等错误横幅统一补充 `role="alert"` 和 `aria-live="assertive"`，让排产失败反馈可被辅助技术及时播报。
- 该修复只改变错误横幅语义，不改变 `loadData()`、`handleOptimize()`、演示排产 fallback、API 调用、指标计算或甘特图数据转换逻辑。
- 红绿证据：首轮先修正 Vitest hoist 夹具问题；目标红灯为 `Unable to get [role="alert"]`，且 DOM 中已存在 `优化失败: optimizer unavailable`；修复后 `npm run test:unit -- tests/unit/schedule-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`main-layout.test.ts` + `login-page.test.ts` 合计 `13/13 passed`；`npm run test:unit:coverage` 通过，`47 files / 221 tests passed`，总行/语句覆盖率 `36.51%`，`ScheduleBoard.vue` 行覆盖 `46.62%`；`npm run test:unit` 通过，`47 files / 221 tests passed`；`npm run lint` 通过。

## 6.6 ProductionBoard Scan Miss Alert 单测补强

- 选片依据：当前 `coverage-summary.json` 显示 `ProductionBoard.vue` 行覆盖 `0.00%`、约 `2041` 行；`/production` 是计划执行链路的生产报工主入口，优先级高于继续精修已覆盖 LoginPage。
- 红灯：新增 `production-board.test.ts` 后，扫码查不到工单/工序会显示 `.notification.error`，但缺少 `[role="alert"]`，目标测试无法获取 alert。
- `ProductionBoard.vue` 现在为错误通知暴露 `role="alert"` / `aria-live="assertive"`，成功通知暴露 `role="status"` / `aria-live="polite"`，让现场扫码失败能够被辅助技术播报。
- 该修复只改变通知语义，不改变扫码查询顺序、API fallback、本地工单匹配、toast 生命周期、开工/完工/异常回写或 OTD 证据链逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="alert"]`，DOM 中已有 `未找到匹配的工单或工序`；修复后 `npm run test:unit -- tests/unit/production-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`production-board.test.ts` + `schedule-board.test.ts` + `main-layout.test.ts` + `login-page.test.ts` 合计 `15/15 passed`；`npm run test:unit:coverage` 通过，`48 files / 222 tests passed`，总行/语句覆盖率 `39.58%`，`ProductionBoard.vue` 行覆盖 `52.36%`；`npm run test:unit` 通过，`48 files / 222 tests passed`；`npm run lint` 通过。

## 6.6 ProductionBoard Start Block Reason 单测补强

- 选片依据：继续沿 `/production` 用户必经链路补开工前资质阻断；该路径直接影响现场操作员能否理解“确认开工”禁用原因。
- 红灯：扩展 `production-board.test.ts` 后，热处理工序存在未闭环资质阻断时，“确认开工”按钮已禁用，但缺少 `aria-describedby="start-qualification-block-reason"`，无法把禁用状态关联到阻断原因。
- `ProductionBoard.vue` 现在在开工资质状态为 `blocked` 时渲染稳定的 `#start-qualification-block-reason`，并让确认按钮通过 `aria-describedby` 指向该说明。
- 该修复只改变开工对话框的可访问性说明关联，不改变 `buildQualificationCheck()` 判定、阻断禁用条件、开工 API 调用、替班证据写入或 OTD 证据链逻辑。
- 红绿证据：目标红灯为 `aria-describedby` 得到 `undefined`；修复后 `npm run test:unit -- tests/unit/production-board.test.ts` 通过，`2/2 passed`。
- 相邻验证：`production-board.test.ts` + `schedule-board.test.ts` + `main-layout.test.ts` + `login-page.test.ts` 合计 `16/16 passed`；`npm run test:unit` 通过，`48 files / 223 tests passed`；`npm run test:unit:coverage` 通过，`48 files / 223 tests passed`，总行/语句覆盖率 `39.88%`，`ProductionBoard.vue` 行覆盖 `58.74%`；`npm run lint` 通过。

## B 轨 Hosted CI Root Workflow 复位

- 问题：当前 `git rev-parse --show-toplevel` 为 `C:\AIWorks\AIMes\v1`，但前序 H20 证据把权威 CI 收敛到仓库外层 `C:\AIWorks\AIMes\.github\workflows\ci.yml`；对 `origin https://git.code.tencent.com/zenweb/AIMes.git` 来说，外层 workflow 不是可随仓库发布的 hosted CI 证据。
- 红灯：调整 H20 架构门和 `frontend-ci-coverage.test.ts` 读取仓库根 `.github/workflows/ci.yml` 后，架构门失败于 `Repository-root .github/workflows/ci.yml is missing.`，前端测试失败于 `ENOENT ... v1\.github\workflows\ci.yml`。
- 修复：恢复仓库根 `.github/workflows/ci.yml`，路径去掉旧 `v1/` 前缀，包含 backend Architecture/Unit/Integration/coverage threshold、frontend lint/unit/coverage/build、container docker build、NuGet/npm audit；恢复仓库根 `.github/workflows/eval.yml`，覆盖 Unit、Evaluation tests、`eval.ps1` 和 evaluation gate。
- 红绿证据：修复后 `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter FullyQualifiedName~H20GitHubActions_ShouldUseSingleRootCiWorkflowWithRequiredQualityGates --no-restore` 通过，`1/1 passed`；`npm run test:unit -- tests/unit/frontend-ci-coverage.test.ts` 通过，`2/2 passed`。
- 发布判断：本片只修复 hosted CI 的仓库内配置证据；仍需要远端 hosted runner 实跑并保存 run URL / run id，不能据此关闭 B 轨 hosted CI 闸门。
- 远端证据核对：`gh repo view` / `gh run list` 当前失败于未登录 GitHub CLI；`git ls-remote --heads origin` 返回 `remote error: Git:Project not found.`。因此本机当前无法触发或查询 hosted runner run，必须由具备远端权限的环境补 run URL / run id。

## B 轨 PostgreSQL/Staging Runbook Policy 复位

- 问题：`_docs/SOP.md` 目录树仍列出已删除的 `db/init.sql`，性能表仍写 `API (含 EF 迁移)`；`db/README.md` Docker 段落仍暗示 API 启动时自动 `MigrateAsync` 建表，和 Production 显式迁移策略冲突。
- 红灯：新增/运行 `ReleaseRunbooks_ShouldRequireExplicitProductionMigrationAndAvoidLegacyInitSql` 时，失败于 `_docs/SOP.md must not reference removed db/init.sql.`。
- 修复：`_docs/SOP.md` 目录树改为只列 `seed.sql`，并注明 schema 由 EF Core Migrations 唯一管理；性能表改为 `API (已完成 schema 校验)`；`db/README.md` Docker 顺序改为先启动依赖、显式 `dotnet ef database update`、再启动 API。
- 红绿证据：修复后 `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter FullyQualifiedName~ReleaseRunbooks_ShouldRequireExplicitProductionMigrationAndAvoidLegacyInitSql --no-restore` 通过，`1/1 passed`。
- 相邻验证：H20 hosted CI 架构门 + PostgreSQL/staging runbook policy 合并过滤运行通过，`2/2 passed`。
- 发布判断：本片只修复 runbook 策略一致性；仍缺真实 PostgreSQL/staging 环境执行记录，不能据此关闭 staging 发布闸门。

## B 轨 PostgreSQL/Staging Rehearsal Evidence Script

- 红灯：新增 `StagingRehearsal_ShouldHaveExecutableEvidenceScript` 后失败于缺少 `scripts/run-staging-rehearsal.ps1`，说明 PostgreSQL/staging 闸门没有可复跑证据采集入口。
- 修复：新增 `scripts/run-staging-rehearsal.ps1`，按 runbook 顺序执行 `docker compose up -d postgresql redis rabbitmq qdrant`、显式 `dotnet ef database update`、`docker compose up -d api`，并轮询 `/live` 和 `/ready`。
- 证据输出：脚本将命令输出、脱敏连接串、`ASPNETCORE_ENVIRONMENT`、健康检查结果写入 `_docs/_reports/staging-rehearsal-*.md`；失败步骤也会记录输出和 exit code。
- 红绿证据：脚本缺失时目标架构测试 `1 failed`；补脚本并修正 PowerShell markdown 围栏语法后，目标架构测试 `1/1 passed`，与 runbook policy 合并过滤运行 `2/2 passed`。
- 本机实跑证据：`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260601-local.md` 已执行，报告结果为 `FAIL`，失败点为 `docker` 命令不存在。
- 发布判断：本片把 staging 演练变成可复跑证据脚本，但当前机器没有 Docker，仍未取得真实 PostgreSQL/staging PASS 记录；staging 发布闸门仍未关闭。

## B 轨 Security Self-Assessment High/Critical Audit

- 红灯：`scripts/run-security-self-assessment.ps1` 的 NuGet 漏洞解析先把中文干净输出 `没有易受攻击的包` 误判为失败；修正后又暴露 Windows PowerShell 不支持 `String.Contains(value, StringComparison)`。
- 修复：`Assert-NoVulnerabilityFindings` 改为逐行识别漏洞摘要/表格行，并用 `Test-ContainsIgnoreCase` 兼容 Windows PowerShell；架构门新增中文 clean 输出和兼容性护栏。
- NuGet 修复：启用 `CentralPackageTransitivePinningEnabled`，移除 `NU1903` 全局压制，显式 pin `System.IO.Packaging 8.0.1`，并把 `RabbitMQ.Client` 提升到 `7.2.0` 以满足 transitive pinning 后的 MassTransit 约束。
- npm 修复：`nuxt` 从 `3.11.2` 升到 `3.21.6`，移除旧 `nuxi` / `nitropack` overrides；为 `js-beautify` 的 `glob` 子依赖收窄 override 到 `^10.5.0`，清掉 npm high/critical 阻断。
- 验证：安全签字/自评架构门 `2/2 passed`；PowerShell parser 通过；`dotnet restore src/backend/AIMes.slnx` 通过；`dotnet list src/backend/AIMes.slnx package --vulnerable --include-transitive` 无漏洞；`npm audit --audit-level=high --registry=https://registry.npmjs.org/` 退出 `0`。
- 自评报告：`_docs/_reports/security-self-assessment-20260601-local.md` 生成 `Result: PASS`；Unit security `50/50 passed`，Integration security `18/18 passed`，Architecture security gates `9/9 passed`，NuGet/npm audit exit code 均为 `0`。
- 前端升级回归验证：`npm run test:unit` 通过 `48 files / 223 tests passed`；`npm run lint` 通过；`npm run build` 通过。build 仍有 chunk size warning 和上游 `@vue/shared` trailing slash export deprecation warning。
- 发布判断：本片只关闭自动 high/critical 安全自评阻断；`_docs/_review/20260601-security-signoff.md` 仍为 `Status: UNSIGNED`，Attack Chain A/B/C 仍需人工验证和签字。

## B 轨 Gray Observation Evidence Gate

- 红灯：新增 `GrayObservationGate_ShouldHaveEvidencePacketAndFailLoudUntilObservationCompletes` 后失败于缺少 `scripts/run-gray-observation.ps1`，说明首次灰度和 2 周无 P0/P1 观察窗口没有可复跑证据入口。
- 修复：新增 `scripts/run-gray-observation.ps1`，支持 `NOT_STARTED` / `OBSERVING` / `PASS`，要求 PASS 必须有灰度编号、开始时间、至少 14 天观察窗口、P0/P1 均为 0 和证据链接。
- 当前证据：新增 `_docs/_reports/gray-observation-20260601.md`，状态为 `Status: NOT_STARTED`，结果为 `Result: FAIL`，明确 `This report cannot close the v1.0.0 release gate.`
- 红绿证据：脚本缺失时架构门红灯；补脚本和报告后目标架构门 `1/1 passed`；PowerShell parser 通过。
- 本机实跑证据：默认执行 `scripts/run-gray-observation.ps1 -ReportPath _docs/_reports/gray-observation-20260601.md` 生成 FAIL 报告并抛错，证明当前首次灰度尚未开始。
- 发布判断：本片只让灰度/观察闸门 fail loud；仍需要真实首次灰度启动、连续 14 天无 P0/P1 的观察证据，才能关闭该发布闸门。

## B 轨 Hosted CI Remote Run Evidence Gate

- 红灯：新增 `HostedCiRunGate_ShouldHaveEvidenceScriptAndFailLoudWithoutRemoteRun` 后失败于缺少 `scripts/run-hosted-ci-evidence.ps1`，说明 hosted CI 只有仓库内配置门，没有远端 runner run URL/run id 证据门。
- 修复：新增 `scripts/run-hosted-ci-evidence.ps1`，检查仓库根 `.github/workflows/ci.yml` / `eval.yml`，采集 `git ls-remote` 和 `gh run list` 输出，并要求 `RunUrl` 与 `RunId` 才能 PASS。
- 当前证据：新增 `_docs/_reports/hosted-ci-20260601.md`，状态为 `Status: MISSING_REMOTE_RUN`，结果为 `Result: FAIL`，明确 `This report cannot close the hosted CI release gate.`
- 红绿证据：脚本缺失时架构门红灯；补脚本和报告后目标架构门 `1/1 passed`；PowerShell parser 通过。
- 本机实跑证据：默认执行 `scripts/run-hosted-ci-evidence.ps1 -ReportPath _docs/_reports/hosted-ci-20260601.md` 生成 FAIL 报告并抛错，证明当前缺远端 run URL/run id。
- 发布判断：本片只让 hosted CI 远端 run 缺口 fail loud；仍需在有远端权限的 CI 平台触发 run，并回填 `RunUrl` / `RunId` 才能关闭该闸门。

## B 轨 Attack Chain Manual Verification Evidence Gate

- 红灯：新增 `AttackChainManualVerification_ShouldHaveEvidenceScriptAndFailLoudUntilVerified` 后失败于缺少 `scripts/run-attack-chain-verification.ps1`，说明安全签字包只有 `UNSIGNED` 占位，没有可复跑的 Attack Chain A/B/C 手工验证证据门。
- 修复：新增 `scripts/run-attack-chain-verification.ps1`，要求 verifier、verified timestamp、Attack Chain A/B/C 全部 `PASS` 且分别附 evidence；否则生成 `PENDING_MANUAL_VERIFICATION` / `Result: FAIL` 报告并退出非 0。
- 当前证据：新增 `_docs/_reports/attack-chain-verification-20260601.md`，状态为 `Status: PENDING_MANUAL_VERIFICATION`，结果为 `Result: FAIL`，明确 `This report cannot close the security signoff release gate.`
- 红绿证据：脚本缺失时架构门红灯；补脚本和报告后目标架构门 `1/1 passed`；PowerShell parser 通过。
- 本机实跑证据：默认执行 `scripts/run-attack-chain-verification.ps1 -ReportPath _docs/_reports/attack-chain-verification-20260601.md` 生成 FAIL 报告并抛错，证明当前缺人工 Attack Chain A/B/C 验证人、时间戳和证据链接。
- 发布判断：本片只让安全签字的人工验证缺口 fail loud；`_docs/_review/20260601-security-signoff.md` 仍保持 `Status: UNSIGNED`，不能据此关闭安全签字闸门。

## 6.6 AdminBoard Tabs A11y 单测补强

- 选片依据：按 Coverage-Leverage Routing 继续转向低覆盖且用户必经的管理入口；`coverage-summary.json` 显示 `AdminBoard.vue` 为 `0.00%` 行覆盖、约 `2510` 行，是当前最大 0 覆盖组件，且承载用户、角色、配置、通知和 Agent 治理入口。
- 红灯：新增 `admin-board.test.ts` 后，系统管理分区切换只有普通 `.tabs` 和 button，目标测试无法获取 `[role="tablist"]`。
- 修复：`AdminBoard.vue` 为分区容器增加 `role="tablist"` / `aria-label`，并为六个分区按钮增加 `role="tab"` 和随当前 `tab` 变化的 `aria-selected`。
- 该修复只改变分区切换的可访问性语义，不改变用户列表、配置保存、通知开关、Agent 治理数据加载或 LLM 状态加载逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="tablist"]`，DOM 中已有六个 `.tab` 按钮；修复后 `npm run test:unit -- tests/unit/admin-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`admin-board.test.ts` + `production-board.test.ts` + `schedule-board.test.ts` + `main-layout.test.ts` + `login-page.test.ts` 合计 `17/17 passed`；scoped lint `npx eslint src/components/admin/AdminBoard.vue tests/unit/admin-board.test.ts --max-warnings 0` 通过；`npm run test:unit` 通过，`49 files / 224 tests passed`；`npm run test:unit:coverage` 通过，`49 files / 224 tests passed`，总行/语句覆盖率 `44.31%`，`AdminBoard.vue` 行覆盖 `84.70%`。
- 追补验证：本轮首次 `npm run lint` 全量执行曾在工具层超时；随后按 `tests/unit`、`vitest.config.ts`、`src/api|composables|router|stores|types`、`src/utils`、`src/components` 分段定位均通过，最终重跑 `npm run lint` 通过。

## 6.6 ReportBoard KPI Tabs A11y 单测补强

- 选片依据：`coverage-summary.json` 显示 `ReportBoard.vue` 为当前最大 0 覆盖组件，约 `2354` 行；`/report` 是 POC/经营复盘、OTD 证据链和导出入口。
- 红灯：新增 `report-board.test.ts` 后，OTD KPI 钻取维度已有 `role="tablist"` / `role="tab"`，但当前维度按钮缺少 `aria-selected`，目标断言得到 `undefined`。
- 修复：`ReportBoard.vue` 为 OTD KPI 维度 tab 增加随 `activeOtdKpiDimension` 变化的 `aria-selected`。
- 该修复只改变 KPI 钻取维度切换的可访问性语义，不改变维度筛选、钻取卡片、承诺包生成、CSV/Excel/PDF 导出或 OTD 计算逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'true'`；修复后 `npm run test:unit -- tests/unit/report-board.test.ts` 通过，`1/1 passed`，并通过 RouterLink stub 清掉测试警告。
- 相邻验证：`report-board.test.ts` + `admin-board.test.ts` + `production-board.test.ts` + `schedule-board.test.ts` + `main-layout.test.ts` + `login-page.test.ts` 合计 `18/18 passed`；scoped lint `npx eslint src/components/report/ReportBoard.vue tests/unit/report-board.test.ts --max-warnings 0` 通过；`npm run lint` 通过；`npm run test:unit` 通过，`50 files / 225 tests passed`；`npm run test:unit:coverage` 单独复跑通过，`50 files / 225 tests passed`，总行/语句覆盖率 `48.19%`，`ReportBoard.vue` 行覆盖 `78.98%`。
- 调试记录：曾并行启动 full unit 与 coverage，coverage 进程中 `auth.store.test.ts` 出现 2 个失败；单独复跑 full unit 与 coverage 均通过，判断为并发进程干扰，不归因于 ReportBoard 切片。

## 6.6 DashboardBoard Command Journey A11y 单测补强

- 选片依据：`coverage-summary.json` 显示 `DashboardBoard.vue` 为 `0.00%` 行覆盖、约 `1367` 行；`/dashboard` 是生产运营控制塔与主线入口，优先级高于继续精修已覆盖组件。
- 红灯：新增 `dashboard-board.test.ts` 后，AI MES 指挥中心五步主线仍是普通 `.command-grid` 容器，目标测试无法获取 `[aria-label="AI MES 指挥中心主线"]`。
- 修复：`DashboardBoard.vue` 将主线步骤容器改为 `ol[aria-label="AI MES 指挥中心主线"]`，每个步骤用 `li` 包裹 `router-link`，并补齐 `ol/li` 样式以保持原有卡片布局。
- 该修复只改变指挥中心主线步骤的结构语义和布局约束，不改变路由、KPI、SignalR、Demo 证据写入或 Dashboard 数据加载逻辑。
- 红绿证据：目标红灯为缺少 `[aria-label="AI MES 指挥中心主线"]`；修复后 `npm run test:unit -- tests/unit/dashboard-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`dashboard-board.test.ts` + `main-layout.test.ts` + `report-board.test.ts` 合计 `3/3 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`51 files / 226 tests passed`；`npm run test:unit:coverage` 通过，`51 files / 226 tests passed`，总行/语句覆盖率 `50.07%`，`DashboardBoard.vue` 行覆盖 `95.34%`。
- 备注：`DashboardBoard.vue` 在本轮前已有较大未提交差异；本片只声明 `ol/li` 主线语义、新单测和对应样式约束为本轮变更。

## 6.6 PurchaseBoard Create Dialog A11y 单测补强

- 选片依据：按 Coverage-Leverage Routing 转向 `PurchaseBoard.vue`；`coverage-summary.json` 显示它本轮前为 `0.00%` 行覆盖、约 `1562` 行，且 `/purchase` 是缺料采购协同和供应风险闭环主入口。
- 红灯：新增 `purchase-board.test.ts` 后，点击“+ 新建”可以打开新建采购单表单，但目标测试无法获取 `[role="dialog"]`。
- 修复：`PurchaseBoard.vue` 为新建采购订单弹窗补充 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="create-purchase-order-title"`，并给标题设置稳定 id。
- 该修复只改变新建采购单弹窗的可访问性语义，不改变采购列表加载、缺料加急、供应风险、外协到货或新建提交流程。
- 红绿证据：目标红灯为缺少 `[role="dialog"]`；修复后 `npm run test:unit -- tests/unit/purchase-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`purchase-board.test.ts` + `dashboard-board.test.ts` + `report-board.test.ts` 合计 `3/3 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`52 files / 227 tests passed`；`npm run test:unit:coverage` 通过，`52 files / 227 tests passed`，总行/语句覆盖率 `53.60%`，`PurchaseBoard.vue` 行覆盖 `66.04%`。
- 备注：`PurchaseBoard.vue` 在本轮前已有较大未提交差异；本片只声明新建弹窗 dialog 语义、新单测和对应标题关联为本轮变更。

## 6.6 AuditDecisionReplayPanel Replay Selection A11y 单测补强

- 选片依据：采纳 Claude Opus 4.8 外援建议后的 Coverage-Leverage Routing，优先处理低覆盖且用户关键组件；`AuditDecisionReplayPanel.vue` 本轮前为 `0.00%` 行覆盖、约 `1648` 行，并直接支撑 AI 决策审计、证据链回放和 B 轨安全/审计可视化。
- 红灯：新增 `audit-decision-replay-panel.test.ts` 后，默认回放按钮存在且详情已显示，但 `.replay-btn` 缺少 `aria-pressed`，目标断言得到 `undefined`。
- 修复：`AuditDecisionReplayPanel.vue` 为每个“回放决策链”按钮增加动态 `aria-pressed="selectedId === item.id"`，让当前选中的回放动作可被辅助技术识别。
- 该修复只改变回放按钮的选中语义，不改变审计日志读取、backend-first 同步、证据映射、默认排序、路由链接或详情渲染逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'true'`；修复后 `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1/1 passed`。
- 相邻验证：`audit-decision-replay-panel.test.ts` + `purchase-board.test.ts` + `dashboard-board.test.ts` 合计 `3/3 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`53 files / 228 tests passed`；`npm run test:unit:coverage` 通过，`53 files / 228 tests passed`，总行/语句覆盖率提升到 `54.83%`，`AuditDecisionReplayPanel.vue` 行覆盖 `35.86%`。
- 发布判断：本片属于 A 轨质量打磨；hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口仍必须作为 B 轨单独补证。

## 6.6 QualityBoard Root Cause Dialog A11y 单测补强

- 选片依据：Coverage-Leverage Routing 当前最大 0 覆盖关键组件为 `QualityBoard.vue`，约 `1319` 行；`/quality` 是质量处置、CAPA、MRB 和审计定位的发布底线入口，优先级高于继续精修已覆盖组件。
- 红灯：新增 `quality-board.test.ts` 后，点击“根因分析”会显示 `.analysis-panel`，但目标测试无法获取 `[role="dialog"]`。
- 修复：`QualityBoard.vue` 为根因分析浮动面板增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="root-cause-analysis-title"`，并给标题设置稳定 id。
- 该修复只改变根因分析面板的可访问性语义，不改变质量统计、检验列表、根因分析 API/fallback、SPC、返工事件、MRB、CAPA 或 OTD 证据链逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="dialog"]`，DOM 中已有 `.analysis-panel`；修复后 `npm run test:unit -- tests/unit/quality-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`quality-board.test.ts` + `audit-decision-replay-panel.test.ts` + `purchase-board.test.ts` 合计 `3/3 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`54 files / 229 tests passed`；`npm run test:unit:coverage` 通过，`54 files / 229 tests passed`，总行/语句覆盖率提升到 `59.76%`，`QualityBoard.vue` 行覆盖 `80.98%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 ScheduleBoard Task Detail Loading State 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，回到 `ScheduleBoard.vue`；它是排产核心入口，任务点击打开工单详情和“为什么这样排”的解释，是计划员从甘特任务进入决策原因的主链路。
- 红灯：扩展 `schedule-board.test.ts` 后，`GanttChart` 发出 `task-click` 且 `getWorkOrderById` 仍在 pending 时，详情面板已经打开并带上任务解释，但 `loading` 仍为 `false`；目标红灯为 `expected 'false' to be 'true'`。
- 修复：`ScheduleBoard.vue` 在 `handleTaskClick()` 调用 `openDemoTaskExplanation(task)` 后、请求后端工单详情前设置 `detailLoading.value = true`。
- 该修复只改变任务详情请求期间的加载态，不改变甘特图映射、演示解释生成、后端工单覆盖、请求失败 fallback、拖拽重排或优化逻辑。
- 范围说明：`ScheduleBoard.vue` scoped diff 中混有本轮前已有调度台 hero、backend-first 读取、错误处理等脏改；本片实际生产改动只有 `detailLoading.value = true`，测试增量在 `schedule-board.test.ts`。
- 红绿证据：目标红灯为 `expected 'false' to be 'true'`；修复后 `npm run test:unit -- tests/unit/schedule-board.test.ts` 通过，`3/3 passed`。
- 相邻验证：`schedule-board.test.ts` + `gantt-mapper.test.ts` + `schedule-feedback-sync.test.ts` + `engineering-change-sync.test.ts` + `assistant-engineering-constraint-package-sync.test.ts` 合计 `25/25 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 253 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 253 tests passed`，总行/语句覆盖率 `77.86%`，`ScheduleBoard.vue` 行覆盖 `50.25%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 AuditDecisionReplayPanel Config Approval List A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，回到 `AuditDecisionReplayPanel.vue`；它仍是低覆盖审计/安全关键组件，且配置审批回放直接影响 Agent 策略变更、安全签字和合规复核。
- 红灯：扩展 `audit-decision-replay-panel.test.ts` 后，后端返回 pending 配置审批时 `.approval-lane` 已显示审批行和待审批计数，但缺少 `role="list"`，目标断言得到 `undefined`。
- 修复：`AuditDecisionReplayPanel.vue` 为审批 lane 增加 `role="list"` / `aria-label="关键配置变更审批"`；为每个 `.approval-row` 增加 `role="listitem"` 和包含标题、状态、责任人的动态 `aria-label`。
- 该修复只改变关键配置审批清单的可访问性语义，不改变审批数据读取、待审批计数、配置审批回放映射、默认选中优先级或业务落库回放逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'list'`；修复后 `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`3/3 passed`。
- 相邻验证：`audit-decision-replay-panel.test.ts` + `audit-log-board.test.ts` + `assistant-action-audit.test.ts` + `agent-config-approval-sync.test.ts` + `admin-board.test.ts` 合计 `15/15 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 254 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 254 tests passed`，总行/语句覆盖率 `77.95%`，`AuditDecisionReplayPanel.vue` 行覆盖 `42.47%`。
- 发布判断：本片属于 A 轨质量打磨和审计可访问性补强；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 InventoryBoard List Selection A11y 单测补强

- 选片依据：Coverage-Leverage Routing 转向 `InventoryBoard.vue`；`/inventory` 是库存、缺料、齐套、采购协同和 OTD 证据链的关键入口，本轮前仍是低覆盖关键组件。
- 红灯：新增 `inventory-board.test.ts` 后，物料列表只有可点击 `.list-item`，缺少 `[role="listbox"]` / `[role="option"]`，目标测试无法按可访问列表获取物料。
- 修复：`InventoryBoard.vue` 为物料列表增加 `role="listbox"` / `aria-label="物料库存列表"`，为每条物料增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 选择物料。
- 该修复只改变物料列表选择的可访问性语义和键盘入口，不改变库存看板加载、交易记录读取、入库/出库/调拨/盘点弹窗、齐套闭环或 OTD 证据链逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="listbox"]`，DOM 中已有物料列表；修复后 `npm run test:unit -- tests/unit/inventory-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`inventory-board.test.ts` + `kitting-closure-panel.test.ts` + `shortage-risk-sync.test.ts` + `bom-board.test.ts` + `purchase-board.test.ts` 合计 `13/13 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`66 files / 241 tests passed`；`npm run test:unit:coverage` 通过，`66 files / 241 tests passed`，总行/语句覆盖率 `74.34%`，`InventoryBoard.vue` 行覆盖 `85.32%`。
- 备注：`InventoryBoard.vue` 当前 diff 还包含 `confirmDialog()` 错误处理从 `any` 收窄为 `unknown` 并复用 `errorMessage()`；该项属于现有工作树中的类型卫生改动，未扩大本片测试声明。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 ScannerBoard Camera Placeholder A11y 单测补强

- 选片依据：Coverage-Leverage Routing 转向 `ScannerBoard.vue`；`/scanner` 是现场条码扫描、工单到站、设备点检和物料齐套证据写入的用户必经入口，本轮前行覆盖为 `0.00%`。
- 红灯：新增 `scanner-board.test.ts` 后，摄像头占位区 `.scanner-placeholder` 是可点击 `div`，但缺少 `role="button"`、`tabindex` 和可访问名称，目标断言得到 `undefined`。
- 修复：`ScannerBoard.vue` 为摄像头占位区增加 `role="button"`、`tabindex="0"`、`aria-label="开启摄像头扫描"`，并支持 Enter/Space 开启摄像头扫描。
- 该修复只改变摄像头占位区的可访问性语义和键盘入口，不改变 `Html5Qrcode` 启动、手动输入查询、demo fallback、扫码历史、上下文跳转或证据链写入逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'button'`；修复后 `npm run test:unit -- tests/unit/scanner-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`scanner-board.test.ts` + `barcode-scan-evidence-sync.test.ts` + `production-board.test.ts` 合计 `10/10 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`67 files / 242 tests passed`；`npm run test:unit:coverage` 通过，`67 files / 242 tests passed`，总行/语句覆盖率 `74.82%`，`ScannerBoard.vue` 行覆盖 `63.08%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 EmployeeBoard Card Keyboard A11y 单测补强

- 选片依据：Coverage-Leverage Routing 转向 `EmployeeBoard.vue`；`/employee` 是人员管理、资质复核、替班放行和生产开工阻断解释的关键入口，本轮前行覆盖为 `0.00%`。
- 红灯：新增 `employee-board.test.ts` 后，员工卡片 `.emp-card` 是可点击 `div`，但缺少 `role="button"`、`tabindex` 和员工上下文可访问名称，目标断言得到 `undefined`。
- 修复：`EmployeeBoard.vue` 为员工卡片增加 `role="button"`、`tabindex="0"`、动态 `aria-label="查看员工详情：<工号> <姓名>"`，并支持 Enter/Space 打开员工详情。
- 该修复只改变员工卡片的可访问性语义和键盘入口，不改变员工列表加载、过滤、分页、新增/编辑/离职、导出或 SkillMatrixPanel 资质逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'button'`；修复后 `npm run test:unit -- tests/unit/employee-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`employee-board.test.ts` + `skill-matrix-panel.test.ts` + `labor-assignment-sync.test.ts` 合计 `8/8 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`68 files / 243 tests passed`；`npm run test:unit:coverage` 通过，`68 files / 243 tests passed`，总行/语句覆盖率 `76.15%`，`EmployeeBoard.vue` 行覆盖 `76.58%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 MonitoringBoard Equipment Drawer A11y 单测补强

- 选片依据：Coverage-Leverage Routing 当前最大 0 覆盖关键组件为 `MonitoringBoard.vue`，约 `1048` 行；`/monitoring` 是生产实时监控、现场态势和 Hypercare 观察入口，和 B 轨灰度/观察可见性直接相关。
- 红灯：新增 `monitoring-board.test.ts` 后，设备卡片已渲染但 `.equip-card` 缺少 `role="button"`，目标断言得到 `undefined`。
- 修复：`MonitoringBoard.vue` 为设备卡片增加 `role="button"`、`tabindex="0"`、设备详情 `aria-label`，并支持 Enter/Space 打开详情；设备详情抽屉增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="equipment-detail-title"`。
- 该修复只改变设备卡片和详情抽屉的可访问性语义与键盘入口，不改变 SignalR、demo 数据、现场态势证据同步、Hypercare 读取或设备指标渲染逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'button'`；修复后 `npm run test:unit -- tests/unit/monitoring-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`monitoring-board.test.ts` + `quality-board.test.ts` + `audit-decision-replay-panel.test.ts` 合计 `3/3 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`55 files / 230 tests passed`；`npm run test:unit:coverage` 通过，`55 files / 230 tests passed`，总行/语句覆盖率提升到 `62.59%`，`MonitoringBoard.vue` 行覆盖 `90.54%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 KnowledgeGovernancePanel Review Button A11y 单测补强

- 选片依据：Coverage-Leverage Routing 当前最大 0 覆盖关键组件为 `KnowledgeGovernancePanel.vue`，约 `896` 行；知识治理支撑 RAG 来源、引用追踪、质量知识复用和合规口径确认。
- 红灯：新增 `knowledge-governance-panel.test.ts` 后，过期/待索引文档的“复核并重建索引”按钮可触发 `document-reviewed`，但按钮缺少文档级 `aria-label`，目标断言得到 `undefined`。
- 修复：`KnowledgeGovernancePanel.vue` 为文档复核按钮增加动态 `aria-label="复核并重建索引：${item.title}"`，让同名复核动作带上具体文档上下文。
- 该修复只改变文档复核按钮的可访问性名称，不改变文档卡片、引用链、质量资产、再训练候选、实验候选或 emit 事件逻辑。
- 红绿证据：目标红灯为 `expected undefined to be '复核并重建索引：CNC-01 主轴维护手册'`；修复后 `npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts` 通过，`1/1 passed`。
- 相邻验证：`knowledge-governance-panel.test.ts` + `monitoring-board.test.ts` + `quality-board.test.ts` 合计 `3/3 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`56 files / 231 tests passed`；`npm run test:unit:coverage` 通过，`56 files / 231 tests passed`，总行/语句覆盖率提升到 `63.88%`，`KnowledgeGovernancePanel.vue` 行覆盖 `68.78%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 SkillMatrixPanel Qualification Block Alert A11y 单测补强

- 选片依据：Coverage-Leverage Routing 当前最大 0 覆盖关键组件为 `SkillMatrixPanel.vue`，约 `853` 行；人员技能/资质有效期直接影响生产开工放行、替班闭环和 OTD 证据解释。
- 红灯：新增 `skill-matrix-panel.test.ts` 后，无有效替班候选时 `.qualification-review` 已渲染，但缺少 `role="alert"` 和标题关联；补语义后继续暴露初始告警正文未明确“无有效替班候选”。
- 修复：`SkillMatrixPanel.vue` 为停工复核区域增加 `role="alert"`、`aria-labelledby="qualification-review-title"` 和稳定标题 id；新增 `reviewAlertMessage`，在无替班候选且尚未生成阻断记录时直接播报 `无有效替班候选：<阻断原因>`。
- 该修复只改变停工复核告警的可访问性语义和首屏阻断文案，不改变人员筛选、候选评分、替班写入、阻断复核、补证放行或 OTD 证据同步逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'alert'`；补语义后目标测试失败于缺少 `无有效替班候选` 文案；补 `reviewAlertMessage` 后 `npm run test:unit -- tests/unit/skill-matrix-panel.test.ts` 通过，`1/1 passed`。
- 相邻验证：`skill-matrix-panel.test.ts` + `knowledge-governance-panel.test.ts` + `monitoring-board.test.ts` + `quality-board.test.ts` 合计 `4/4 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`57 files / 232 tests passed`；`npm run test:unit:coverage` 通过，`57 files / 232 tests passed`，总行/语句覆盖率提升到 `64.54%`，`SkillMatrixPanel.vue` 行覆盖 `84.57%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 DocumentUpload Drop Zone A11y 单测补强

- 选片依据：Coverage-Leverage Routing 当前最大 0 覆盖关键组件为 `DocumentUpload.vue`，约 `817` 行；知识源上传是 RAG 治理、合规口径确认和质量知识资产进入系统的入口。
- 红灯：新增 `document-upload.test.ts` 后，拖拽上传区已存在但缺少 `role="button"`、键盘焦点和文件选择键盘入口，目标断言得到 `undefined`。
- 修复：`DocumentUpload.vue` 为 `.drop-zone` 增加 `role="button"`、`tabindex="0"`、`aria-label="选择或拖拽上传知识文档"`，并新增 `openFilePicker()` 让点击、Enter、Space 都能触发隐藏 file input。
- 该修复只改变上传入口的可访问性语义和键盘触发方式，不改变文件类型/大小校验、上传队列、知识治理文档生成、客户工单导入或质量知识训练事件逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'button'`；修复后 `npm run test:unit -- tests/unit/document-upload.test.ts` 通过，`1/1 passed`。
- 相邻验证：`document-upload.test.ts` + `knowledge-governance-panel.test.ts` + `skill-matrix-panel.test.ts` + `monitoring-board.test.ts` 合计 `4/4 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`58 files / 233 tests passed`；`npm run test:unit:coverage` 通过，`58 files / 233 tests passed`，总行/语句覆盖率提升到 `65.52%`，`DocumentUpload.vue` 行覆盖 `57.92%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 RiskActionQueuePanel Card Action A11y 单测补强

- 选片依据：Coverage-Leverage Routing 当前最大 0 覆盖关键组件为 `RiskActionQueuePanel.vue`，约 `802` 行；风险处置队列连接排产保护、采购承诺、设备窗口、SLA 晨会和审计回放。
- 红灯：新增 `risk-action-queue-panel.test.ts` 后，风险卡片中多个同名“转派/升级/关闭”按钮没有风险标题上下文，首个“升级”按钮 `aria-label` 为 `undefined`。
- 修复：`RiskActionQueuePanel.vue` 为卡片动作按钮增加动态 `aria-label`：`转派风险：${item.title}`、`升级风险：${item.title}`、`关闭风险：${item.title}`。
- 该修复只改变风险卡片动作按钮的可访问性名称，不改变风险队列加载、SLA 复核生成、转派/升级/关闭状态机、实时监控反写或 OTD 证据同步逻辑。
- 红绿证据：目标红灯为 `expected undefined to be '升级风险：WO-2026-0042 CNC 停机延期'`；修复后 `npm run test:unit -- tests/unit/risk-action-queue-panel.test.ts` 通过，`1/1 passed`。
- 相邻验证：`risk-action-queue-panel.test.ts` + `risk-action-sync.test.ts` + `risk-sla-review-sync.test.ts` + `document-upload.test.ts` 合计 `12/12 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`59 files / 234 tests passed`；`npm run test:unit:coverage` 通过，`59 files / 234 tests passed`，总行/语句覆盖率提升到 `67.71%`，`RiskActionQueuePanel.vue` 行覆盖 `80.04%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 BomBoard List Selection A11y 单测补强

- 选片依据：继续采纳 Claude Opus 4.8 的 Coverage-Leverage Routing；`BomBoard.vue` 本轮前仍为 `0.00%` 行覆盖，且 BOM/替代料/齐套检查直接影响排产、采购协同和 OTD 证据。
- 红灯：新增 `bom-board.test.ts` 后，BOM 列表只有可点击 `div.list-item`，缺少 `[role="listbox"]` / `[role="option"]`，目标测试无法获取 BOM 列表语义。
- 修复：`BomBoard.vue` 为 `.list-items` 增加 `role="listbox"` 和 `aria-label="BOM 列表"`；为每个 `.list-item` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 选择 BOM。
- 该修复只改变 BOM 列表选择的可访问性语义和键盘入口，不改变 BOM 列表加载、详情读取、爆炸展开、替代料审批、ECN 影响分析、齐套包或 OTD 证据写入逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="listbox"]`，DOM 中已有两条 `.list-item`；修复后 `npm run test:unit -- tests/unit/bom-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`bom-board.test.ts` + `risk-action-queue-panel.test.ts` + `document-upload.test.ts` 合计 `3/3 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`60 files / 235 tests passed`；`npm run test:unit:coverage` 通过，`60 files / 235 tests passed`，总行/语句覆盖率提升到 `68.72%`，`BomBoard.vue` 行覆盖 `72.95%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 EquipmentBoard Type Filter Regression 单测补强

- 选片依据：Coverage-Leverage Routing 当前最大 0 覆盖关键组件为 `EquipmentBoard.vue`，约 `662` 行；`/equipment` 是设备状态、维护、健康风险和排产设备约束的主入口。
- 红灯：新增 `equipment-board.test.ts` 后，选择类型筛选 `CNC` 时列表只剩 `Assembly` 设备；目标断言期望保留 `CNC-001 加工中心`，实际得到 `ASM-001 装配线`。
- 修复：`EquipmentBoard.vue` 的 `filteredEquipment` 从 `equipmentType !== typeFilter` 改为 `equipmentType === typeFilter`，让类型筛选保留所选类型。
- 该修复只改变设备类型筛选条件，不改变状态筛选、分页加载、设备详情、健康监控、维护记录、故障诊断或审计定位逻辑。
- 红绿证据：目标红灯为 `expected 'ASM-001 装配线...' to contain 'CNC-001 加工中心'`；修复后 `npm run test:unit -- tests/unit/equipment-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`equipment-board.test.ts` + `equipment-risk-sync.test.ts` + `monitoring-board.test.ts` 合计 `11/11 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`61 files / 236 tests passed`；`npm run test:unit:coverage` 通过，`61 files / 236 tests passed`，总行/语句覆盖率提升到 `69.85%`，`EquipmentBoard.vue` 行覆盖 `79.00%`。
- 发布判断：本片属于 A 轨质量打磨和真实筛选回归修复；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 KittingClosurePanel Shortage Action A11y 单测补强

- 选片依据：Coverage-Leverage Routing 当前最大 0 覆盖关键组件为 `KittingClosurePanel.vue`，约 `624` 行；工单齐套闭环直接影响缺料排产事件、库存复核和 OTD 证据链。
- 红灯：新增 `kitting-closure-panel.test.ts` 后，三张工单卡片的同名“生成缺料排产事件”按钮缺少工单/物料上下文，首个按钮 `aria-label` 为 `undefined`。
- 修复：`KittingClosurePanel.vue` 增加 `firstShortageItem()` 和 `shortageActionLabel()`，按钮动态暴露 `生成缺料排产事件：<工单> / <物料> 缺 <数量><单位>`；已齐套工单暴露“已齐套”上下文。
- 该修复只改变齐套按钮的可访问性名称，并复用同一缺料查找逻辑；不改变缺料事件写入、OTD 证据链写入、BOM 齐套包读取或异常分流批次隔离逻辑。
- 红绿证据：目标红灯为 `expected undefined to be '生成缺料排产事件：WO-RUSH-9001 / M-AL-6061 缺 19件'`；修复后 `npm run test:unit -- tests/unit/kitting-closure-panel.test.ts` 通过，`1/1 passed`。
- 相邻验证：`kitting-closure-panel.test.ts` + `shortage-risk-sync.test.ts` + `bom-board.test.ts` 合计 `11/11 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`62 files / 237 tests passed`；`npm run test:unit:coverage` 通过，`62 files / 237 tests passed`，总行/语句覆盖率提升到 `71.91%`，`KittingClosurePanel.vue` 行覆盖 `92.95%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 AnomalyBoard List Selection A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，`AnomalyBoard.vue` 是剩余 0 覆盖大组件之一，且 `/anomaly` 是生产异常分流、风险队列和 OTD 复盘的现场入口。
- 红灯：新增 `anomaly-board.test.ts` 后，异常卡片列表没有 `[role="option"]`，目标测试无法获取异常记录选项，证明卡片只支持鼠标点击和视觉状态。
- 修复：`AnomalyBoard.vue` 为异常列表增加 `role="listbox"` / `aria-label="异常记录列表"`，为每张异常卡增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 打开详情。
- 该修复只改变异常卡片列表的可访问性语义和键盘入口，不改变异常列表加载、backend-first 事件合并、异常详情读取、AI 分析或事件分流写入逻辑。
- 红绿证据：目标红灯为 `expected [] to have a length of 1`，即缺少 `[role="option"]`；修复后 `npm run test:unit -- tests/unit/anomaly-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`anomaly-board.test.ts` + `production-anomaly-sync.test.ts` + `anomaly-dispatch-sync.test.ts` + `risk-action-queue-panel.test.ts` 合计 `12/12 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`63 files / 238 tests passed`；`npm run test:unit:coverage` 通过，`63 files / 238 tests passed`，当前总行/语句覆盖率 `71.84%`，`AnomalyBoard.vue` 行覆盖 `70.91%`。
- 覆盖率说明：本片把 `AnomalyBoard.vue` 从 0 覆盖打开到 `70.91%`；总覆盖率相对上一片记录的 `71.91%` 略低，按当前 coverage 输出如实记录，判断为统计基数/当前 worktree 状态变化，不把 A 轨局部覆盖提升夸大成全局增长。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 RiskBoard Load Failure Alert 单测补强

- 选片依据：Coverage-Leverage Routing 转向仍低覆盖且用户关键的 `RiskBoard.vue`；`/risk` 是发布风险、延期风险、设备/物料/瓶颈预警的集中入口。
- 红灯：新增 `risk-board.test.ts` 后，风险看板 API 失败会渲染 `.error-banner` 和演示数据 fallback，但目标测试无法获取 `[role="alert"]`。
- 修复：`RiskBoard.vue` 为错误横幅补充 `role="alert"` 和 `aria-live="assertive"`，让“加载失败 + 已加载演示数据”的降级状态被辅助技术即时播报。
- 该修复只改变风险看板加载失败横幅的可访问性语义，不改变 `getRiskDashboard()`、离线演示错误识别、demo 风险数据、风险分类统计或 `RiskActionQueuePanel` 渲染逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="alert"]`，DOM 中已有 `加载失败: risk api unavailable（已加载演示数据）`；修复后 `npm run test:unit -- tests/unit/risk-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`risk-board.test.ts` + `risk-action-queue-panel.test.ts` + `risk-action-sync.test.ts` + `risk-sla-review-sync.test.ts` 合计 `12/12 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`64 files / 239 tests passed`；`npm run test:unit:coverage` 通过，`64 files / 239 tests passed`，总行/语句覆盖率 `73.75%`，`RiskBoard.vue` 行覆盖 `99.80%`。
- 备注：`RiskBoard.vue` 在本轮前已有 offline-demo/error-message 错误处理改动；本片只声明错误横幅 alert/live 语义和新增单测为本轮变更。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 RoutingBoard List Selection A11y 单测补强

- 选片依据：Coverage-Leverage Routing 转向 `RoutingBoard.vue`；`/routing` 是工艺路线、工序能力、质量门和排产约束的关键入口。
- 红灯：新增 `routing-board.test.ts` 后，路线列表已有两条 `.list-item`，但缺少 `[role="listbox"]`，目标测试无法按可访问列表获取路线。
- 修复：`RoutingBoard.vue` 为路线列表增加 `role="listbox"` / `aria-label="工艺路线列表"`，为每条路线增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 选择路线。
- 该修复只改变路线列表选择的可访问性语义和键盘入口，不改变路线列表加载、详情读取、能力校验、分流确认或 backend-first 能力校验记录读取逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="listbox"]`，DOM 中已有路线列表；修复后 `npm run test:unit -- tests/unit/routing-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`routing-board.test.ts` + `engineering-change-sync.test.ts` + `bom-board.test.ts` + `schedule-board.test.ts` 合计 `8/8 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`65 files / 240 tests passed`；`npm run test:unit:coverage` 通过，`65 files / 240 tests passed`，总行/语句覆盖率 `74.47%`，`RoutingBoard.vue` 行覆盖 `85.26%`。
- 备注：`RoutingBoard.vue` 在本轮前已有 backend-first 能力校验读取和类型收窄改动；本片只声明列表语义/键盘入口和新增单测为本轮变更。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 BarcodePrintBoard Label Selection A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，`BarcodePrintBoard.vue` 本轮前为 `0.00%` 行覆盖；条码/QR 打印是扫码验证、工单/设备/物料追溯标签入口。
- 红灯：新增 `barcode-print-board.test.ts` 后，标签卡片已有可点击选择行为，但 `.label-card` 缺少 checkbox 角色，目标断言得到 `undefined`。
- 修复：`BarcodePrintBoard.vue` 为标签卡片补 `role="checkbox"`、`tabindex="0"`、动态 `aria-checked`、动态 `aria-label`，并支持 Enter/Space 切换选择。
- 该修复只改变标签选择卡片的可访问性语义和键盘入口，不改变库存标签加载、QR canvas 生成、打印窗口、已选数量或证据状态逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'checkbox'`；修复后 `npm run test:unit -- tests/unit/barcode-print-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`barcode-print-board.test.ts` + `barcode-scan-evidence-sync.test.ts` + `scanner-board.test.ts` 合计 `9/9 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`69 files / 244 tests passed`；`npm run test:unit:coverage` 通过，`69 files / 244 tests passed`，总行/语句覆盖率 `75.73%`，`BarcodePrintBoard.vue` 行覆盖 `81.43%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 AuditLogBoard Detail Action A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，`AuditLogBoard.vue` 当前为 `0.00%` 行覆盖；`/audit-logs` 是安全、合规、Agent 决策回放和发布签字证据的关键入口。
- 红灯：新增 `audit-log-board.test.ts` 后，审计表格每行都有同名“详情”按钮，但按钮缺少审计记录上下文，目标断言得到 `undefined`。
- 修复：`AuditLogBoard.vue` 为详情按钮补动态 `aria-label`，格式为 `查看审计日志详情：<用户> <动作标签> <资源> <资源ID>`。
- 该修复只改变详情按钮的可访问性名称，不改变审计日志加载、操作筛选、分页、详情弹窗、JSON 格式化或 fallback demo 日志逻辑。
- 红绿证据：目标红灯为 `expected undefined to be '查看审计日志详情：operator1 更新 Production wo-001'`；修复后 `npm run test:unit -- tests/unit/audit-log-board.test.ts` 通过，`1/1 passed`。
- 相邻验证：`audit-log-board.test.ts` + `audit-decision-replay-panel.test.ts` + `assistant-action-audit.test.ts` 合计 `8/8 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 245 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 245 tests passed`，总行/语句覆盖率 `76.96%`，`AuditLogBoard.vue` 行覆盖 `91.62%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 AuditDecisionReplayPanel Replay Button A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，`AuditDecisionReplayPanel.vue` 当前是最低覆盖组件，行覆盖 `35.86%`；它承载 AI 决策、业务落库动作、配置审批和证据链回放。
- 红灯：扩展 `audit-decision-replay-panel.test.ts` 后，多个同名“回放决策链”按钮只有 `aria-pressed`，缺少具体决策链名称，目标断言得到 `undefined`。
- 修复：`AuditDecisionReplayPanel.vue` 为 `.replay-btn` 补动态 `aria-label="回放决策链：<标题>"`，保留既有 `aria-pressed` 和点击选择逻辑。
- 该修复只改变回放按钮的可访问性名称，不改变 replay item 映射、默认选中优先级、指标统计、审批读取或证据链回放内容。
- 红绿证据：目标红灯为 `expected undefined to be '回放决策链：M-AL-6061 收货后释放冻结工序'`；修复后 `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`1/1 passed`。
- 相邻验证：`audit-decision-replay-panel.test.ts` + `audit-log-board.test.ts` + `assistant-action-audit.test.ts` 合计 `8/8 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 245 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 245 tests passed`，总行/语句覆盖率 `76.96%`，`AuditDecisionReplayPanel.vue` 行覆盖 `36.17%`。
- 覆盖率说明：本片是低风险可访问性微切片，只小幅打开最低覆盖大组件；`AuditDecisionReplayPanel.vue` 仍有大量映射分支和 backend-first 数据组合待后续切片覆盖。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 AuditDecisionReplayPanel Backend Business Write Replay 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，`AuditDecisionReplayPanel.vue` 仍是最低覆盖大组件；上片已证明只做按钮命名收益有限，本片转向真实 backend-first 业务落库审计回放分支。
- 红灯：扩展 `audit-decision-replay-panel.test.ts` 后，后端 `AgentExecutePurchaseAction` 审计能生成采购收货落库回放，但“打开采购协同”链接缺少业务对象可访问名称，目标断言得到 `undefined`。
- 修复：`AuditDecisionReplayPanel.vue` 为 `.trace-link` 补动态 `aria-label="打开<routeLabel>：<object>"`，让回放详情里的业务页跳转明确指向采购单/质检/设备等业务对象。
- 该修复只改变回放详情业务对象链接的可访问性名称，不改变后端审计读取、业务落库映射、默认选中优先级或路由 query。
- 红绿证据：目标红灯为 `expected undefined to be '打开采购协同：PO-RUSH-20260519'`；修复后 `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts` 通过，`2/2 passed`。
- 相邻验证：`audit-decision-replay-panel.test.ts` + `audit-log-board.test.ts` + `assistant-action-audit.test.ts` 合计 `9/9 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 246 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 246 tests passed`，总行/语句覆盖率 `77.08%`，`AuditDecisionReplayPanel.vue` 行覆盖 `39.73%`。
- 发布判断：本片属于 A 轨质量打磨和真实审计回放契约补强；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 ScheduleBoard Optimization Warning Status A11y 单测补强

- 选片依据：采纳 Coverage-Leverage Routing，转向 `ScheduleBoard.vue`；它是排产核心入口，行覆盖仍低于同类已打开组件，且优化预警直接影响计划员判断瓶颈、冲突和降级状态。
- 红灯：扩展 `schedule-board.test.ts` 后，优化成功返回 `warnings` 时 `.warnings-bar` 已显示预警文本，但缺少状态区域语义，`role` 断言得到 `undefined`。
- 修复：`ScheduleBoard.vue` 为 `.warnings-bar` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="排产预警"`。
- 该修复只改变排产预警条的可访问性播报语义，不改变优化请求、排产计划替换、指标刷新、甘特图映射、错误 alert 或后端不可用 fallback 逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'status'`；修复后 `npm run test:unit -- tests/unit/schedule-board.test.ts` 通过，`2/2 passed`。
- 相邻验证：`schedule-board.test.ts` + `schedule-feedback-sync.test.ts` + `gantt-mapper.test.ts` 合计 `14/14 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 247 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 247 tests passed`，总行/语句覆盖率 `77.11%`，`ScheduleBoard.vue` 行覆盖 `47.05%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 ProductionBoard Work Order List Selection A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，转向 `ProductionBoard.vue`；它是生产执行主入口，行覆盖低于多数已打开业务入口，且工单选择是开工、完工、异常上报和扫码证据链的入口动作。
- 红灯：扩展 `production-board.test.ts` 后，工单列表已有两张 `.wo-card`，但缺少 `[role="listbox"]`，目标测试无法按可访问列表获取工单选项。
- 修复：`ProductionBoard.vue` 为 `.wo-list` 增加 `role="listbox"` / `aria-label="生产工单列表"`；为 `.wo-card` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`、动态 `aria-label`，并支持 Enter/Space 选择工单。
- 该修复只改变生产工单列表选择的可访问性语义和键盘入口，不改变工单加载、扫码查询、工序 fallback、资质阻断、开工/完工/异常状态机或 OTD 证据链写入逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="listbox"]`；修复后 `npm run test:unit -- tests/unit/production-board.test.ts` 通过，`3/3 passed`。
- 相邻验证：`production-board.test.ts` + `production-anomaly-sync.test.ts` + `barcode-scan-evidence-sync.test.ts` + `schedule-board.test.ts` 合计 `17/17 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 248 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 248 tests passed`，总行/语句覆盖率 `77.13%`，`ProductionBoard.vue` 行覆盖 `59.28%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 DocumentUpload Rejected File Alert A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，转向 `DocumentUpload.vue`；它是知识文档、客户工单样例和质量知识治理入口，当前行覆盖仍低于多数已打开组件。
- 红灯：扩展 `document-upload.test.ts` 后，选择不支持的 `virus.exe` 会显示 `.error-msg`，但缺少 `[role="alert"]`，目标测试无法按可访问错误消息获取。
- 修复：`DocumentUpload.vue` 为 `.error-msg` 增加 `role="alert"` 和 `aria-live="assertive"`。
- 该修复只改变文件拒绝错误的可访问性播报语义，不改变文件类型/大小校验、队列去重、上传流程、知识治理刷新或客户工单样例生成逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="alert"]`；修复后 `npm run test:unit -- tests/unit/document-upload.test.ts` 通过，`2/2 passed`。
- 相邻验证：`document-upload.test.ts` + `knowledge-governance-panel.test.ts` + `knowledge-governance-sync.test.ts` + `quality-knowledge-sample-sync.test.ts` 合计 `12/12 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 249 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 249 tests passed`，总行/语句覆盖率 `77.16%`，`DocumentUpload.vue` 行覆盖 `59.73%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 PurchaseBoard Purchase Order List Selection A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，转向 `PurchaseBoard.vue`；它是采购订单、供应延期、替代供应商、缺料加急和外协承诺到货的关键入口。
- 红灯：扩展 `purchase-board.test.ts` 后，采购订单列表已有两条 `.list-item`，但缺少 `[role="listbox"]`，目标测试无法按可访问列表获取采购单选项。
- 修复：`PurchaseBoard.vue` 为 `.list-items` 增加 `role="listbox"` / `aria-label="采购订单列表"`；为 `.list-item` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`、动态 `aria-label`，并支持 Enter/Space 选择采购单。
- 该修复只改变采购订单列表选择的可访问性语义和键盘入口，不改变采购单加载、详情读取、创建、提交、确认、收货、取消或供应风险/外协联动逻辑。
- 红绿证据：目标红灯为 `Unable to get [role="listbox"]`；修复后 `npm run test:unit -- tests/unit/purchase-board.test.ts` 通过，`2/2 passed`。
- 相邻验证：`purchase-board.test.ts` + `bom-board.test.ts` + `inventory-board.test.ts` + `production-board.test.ts` + `anomaly-board.test.ts` 合计 `8/8 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 250 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 250 tests passed`，总行/语句覆盖率 `77.27%`，`PurchaseBoard.vue` 行覆盖 `69.37%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 ScannerBoard Manual Scan History Replay A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，转向 `ScannerBoard.vue`；它是现场扫码、工单到站、设备点检和物料齐套证据入口，且函数覆盖仅 `7.69%`。
- 红灯：扩展 `scanner-board.test.ts` 后，手动输入 `WO-RUSH-9001` 可生成扫描历史，但 `.history-item` 缺少 `role="button"`，目标断言得到 `undefined`。
- 修复：`ScannerBoard.vue` 为历史项增加 `role="button"`、`tabindex="0"`、动态 `aria-label="重新扫描<类型> <编码> <名称>"`，并支持 Enter/Space 触发 `handleScan(item.code)`。
- 该修复只改变扫描历史重放入口的可访问性语义和键盘入口，不改变扫码识别、API/demo fallback、历史写入、证据确认或上下文跳转逻辑。
- 红绿证据：目标红灯为 `expected undefined to be 'button'`；修复后 `npm run test:unit -- tests/unit/scanner-board.test.ts` 通过，`2/2 passed`。
- 相邻验证：`scanner-board.test.ts` + `barcode-scan-evidence-sync.test.ts` + `barcode-print-board.test.ts` + `production-board.test.ts` + `inventory-board.test.ts` 合计 `14/14 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 251 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 251 tests passed`，总行/语句覆盖率 `77.41%`，`ScannerBoard.vue` 行覆盖 `80.55%`，函数覆盖 `43.75%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。

## 6.6 KnowledgeGovernancePanel Next Training Merge Action A11y 单测补强

- 选片依据：继续执行 Coverage-Leverage Routing，转向 `KnowledgeGovernancePanel.vue`；它是质量知识资产、训练集、灰度发布前校验和 AI 推荐治理入口，函数覆盖仍低。
- 红灯：扩展 `knowledge-governance-panel.test.ts` 后，`下一轮训练集` 的“合并现场反馈”按钮可触发 emit，但缺少包含资产标题的 `aria-label`，目标断言得到 `undefined`。
- 修复：`KnowledgeGovernancePanel.vue` 为下一轮训练集的合并按钮增加 `aria-label="合并现场反馈：<asset.title>"`。
- 该修复只改变下一轮训练集合并动作的可访问名称，不改变训练集版本查找、emit payload、审批/校验/灰度发布状态机或质量知识资产排序逻辑。
- 红绿证据：目标红灯为 `expected undefined to be '合并现场反馈：R3 下一轮训练集：现场复核反馈'`；修复后 `npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts` 通过，`2/2 passed`。
- 相邻验证：`knowledge-governance-panel.test.ts` + `knowledge-governance-sync.test.ts` + `quality-knowledge-sample-sync.test.ts` + `document-upload.test.ts` 合计 `13/13 passed`；`npm run lint` 通过；`npm run test:unit` 通过，`70 files / 252 tests passed`；`npm run test:unit:coverage` 通过，`70 files / 252 tests passed`，总行/语句覆盖率 `77.68%`，`KnowledgeGovernancePanel.vue` 行覆盖 `83.40%`，函数覆盖 `17.94%`。
- 发布判断：本片属于 A 轨质量打磨；B 轨仍缺 hosted CI 真实远端 run、PostgreSQL/staging PASS、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察窗口。
