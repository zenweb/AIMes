# 2026-06-01 Sprint 6 Code Hygiene Issue

## 登录页编辑凭据后旧错误仍滞留

- 问题：`LoginPage.vue` 登录失败后，用户开始修改密码时旧错误 alert 仍显示，凭据输入框也继续标记为 invalid。
- 风险：用户已经开始修正输入，但页面仍播报或展示旧错误，键盘/屏幕阅读器用户会误以为当前新输入仍处于同一错误状态。
- 处理：用户名和密码输入变化时调用 `clearError()`，仅在已有错误时清空错误状态。
- 测试：扩展 `login-page.test.ts`，覆盖登录失败后编辑密码会移除 alert，并清掉两个凭据字段的错误关联属性。
- 验证：目标测试红绿通过，身份相邻测试通过。
- 剩余风险：当前仍为表单级错误清理；未来字段级错误需要更细粒度清理规则。

## 登录页空白校验失败后焦点丢失

- 问题：`LoginPage.vue` 纯空白凭据提交后会显示错误，但焦点留在 `body`，键盘用户不能直接从第一个凭据字段修正输入。
- 风险：错误虽然通过 alert 和字段关联暴露，但焦点位置不帮助用户进入修复路径，表单可访问性仍不完整。
- 处理：为用户名输入框增加模板 ref，空白校验失败后等待 DOM 更新并聚焦用户名输入框。
- 测试：扩展 `login-page.test.ts`，把组件挂载到 `document.body`，断言空白提交后 `document.activeElement` 为用户名输入框。
- 验证：目标测试红绿通过，身份相邻测试通过。
- 剩余风险：如果后续拆成字段级错误，需要按实际缺失字段调整焦点目标。

## 登录页密码缺失时焦点回到错误字段之前

- 问题：用户名已有效但密码为空白时，校验失败后焦点仍回用户名，用户需要再移动到真正缺失的密码字段。
- 风险：焦点目标与第一个无效字段不一致，降低键盘修复效率，也让字段错误关联的实际操作路径不够直接。
- 处理：空白校验失败后优先检查用户名；用户名有效但密码缺失时聚焦密码输入框。
- 测试：扩展 `login-page.test.ts`，覆盖用户名 `admin`、密码空白提交后焦点落到 `#password`。
- 验证：目标测试红绿通过，身份相邻测试通过。
- 剩余风险：当前仍使用表单级错误文案，字段级文案拆分后需同步调整描述关联。

## 登录页密码缺失时用户名字段也被标记 invalid

- 问题：用户名已填写且有效、密码为空白时，校验失败后用户名字段仍被标记为 invalid，并关联同一个错误提示。
- 风险：屏幕阅读器和键盘用户会收到“用户名也错误”的信号，和实际需要修复的字段不一致。
- 处理：拆出 `usernameFieldInvalid` / `passwordFieldInvalid`，空白校验失败时只标记缺失字段；登录失败保留凭证组合错误的双字段关联。
- 测试：扩展 `login-page.test.ts`，覆盖用户名 `admin`、密码空白提交后用户名无 invalid 状态，密码关联 `login-error`。
- 验证：目标测试红绿通过，身份相邻测试、coverage、full unit、lint 均通过。
- 剩余风险：当前空白校验仍共用统一错误文案；未来如引入字段级文案，需要同步拆分 `aria-describedby` 目标。

## 主布局移动菜单缺少展开状态语义

- 问题：`MainLayout.vue` 的移动菜单按钮会切换菜单面板，但按钮没有 `aria-expanded`，也没有通过 `aria-controls` 指向受控面板。
- 风险：屏幕阅读器用户无法判断菜单当前是否展开，也无法感知按钮控制的导航区域。
- 处理：按钮增加 `:aria-expanded="String(menuOpen)"` 和 `aria-controls="mobile-nav-panel"`；移动菜单面板增加稳定 id。
- 测试：新增 `main-layout.test.ts`，覆盖关闭态、打开态和受控面板 id 的真实 DOM 断言。
- 验证：目标测试红绿通过，登录页相邻测试、coverage、full unit、lint 均通过。
- 剩余风险：壳层其他行为仍需后续覆盖，包括退出登录、暗色模式持久化和移动导航点击后关闭菜单。

## 6.6 选片容易被已覆盖组件吸走

- 问题：LoginPage 已达到 `100%` 行覆盖后仍连续出现可继续精修的小切片，而大量用户必经组件仍为 `0.00%` 覆盖。
- 风险：局部 a11y 继续变细，但整体发布就绪度提升很慢；同时容易让测试绿灯掩盖 hosted CI、staging、灰度、安全签字和观察窗口等发布闸门仍缺证据。
- 处理：采纳 Claude Opus 4.8 外审建议，用覆盖率增量作为 6.6 选片路由信号；下一片转向 `ScheduleBoard.vue`。
- 测试：选片本身不需要测试，但下一片必须继续遵守 TDD，先写 `ScheduleBoard` 组件测试红灯再实现或调整夹具。
- 验证：当前 `coverage-summary.json` 支持该判断：总行/语句覆盖率 `24.19%`，`ScheduleBoard.vue` `0.00%`，`LoginPage.vue` `100%`。
- 剩余风险：发布阻断项不是前端测试能消除的，必须单独追踪轨道 B。

## 排产优化失败横幅缺少 alert 语义

- 问题：`ScheduleBoard.vue` 优化失败后会显示 `.error-banner`，但没有 `role="alert"` / live region 语义。
- 风险：`/scheduling` 是核心排产入口，优化失败属于需要立即处理的状态；仅视觉显示会降低屏幕阅读器用户感知失败和重试入口的能力。
- 处理：为 `.error-banner` 增加 `role="alert"` 和 `aria-live="assertive"`。
- 测试：新增 `schedule-board.test.ts`，mock 初始排产加载成功、优化接口失败，点击工具栏优化后断言 alert 横幅包含 `优化失败` 和后端错误信息。
- 验证：目标测试红绿通过，登录/壳层相邻测试、coverage、full unit、lint 均通过。
- 剩余风险：`ScheduleBoard` 仍有大量关键行为需要继续按覆盖率杠杆补测，当前只覆盖优化失败播报路径。

## 生产报工扫码未命中通知缺少 alert 语义

- 问题：`ProductionBoard.vue` 扫码或输入工单号未命中时会显示 `.notification.error`，但没有 `role="alert"` / live region 语义。
- 风险：`/production` 是生产报工主入口，扫码失败需要现场操作员立即修正；仅视觉 toast 会让屏幕阅读器用户漏掉失败原因。
- 处理：错误通知增加 `role="alert"` 和 `aria-live="assertive"`；成功通知增加 `role="status"` 和 `aria-live="polite"`。
- 测试：新增 `production-board.test.ts`，mock 工单列表为空、扫码接口未命中，点击查询后断言错误通知以 alert 暴露并包含 `未找到匹配的工单或工序`。
- 验证：目标测试红绿通过；相邻组合、coverage、full unit、lint 均通过，总行/语句覆盖率提升到 `39.58%`，`ProductionBoard.vue` 行覆盖 `52.36%`。
- 剩余风险：当前只覆盖扫码未命中播报路径；`ProductionBoard` 的开工资质阻断、完工回写、异常上报和 OTD 证据链仍需继续补测。

## 生产报工开工阻断禁用按钮缺少原因关联

- 问题：`ProductionBoard.vue` 开工前资质阻断会禁用“确认开工”按钮，但按钮没有通过 `aria-describedby` 关联到阻断原因。
- 风险：现场操作员能看到阻断卡片，但屏幕阅读器用户在按钮处只能听到不可用状态，无法直接获知“热处理资质临期且无有效替班候选”等原因。
- 处理：阻断态渲染稳定 `#start-qualification-block-reason`，确认按钮在 `blocked` 状态下通过 `aria-describedby` 指向该说明。
- 测试：扩展 `production-board.test.ts`，mock 热处理工单和资质阻断，打开开工对话框后断言确认按钮禁用且关联阻断原因。
- 验证：目标测试红绿通过，ProductionBoard 测试、相邻组合、full unit、coverage 和 lint 均通过；总行/语句覆盖率提升到 `39.88%`，`ProductionBoard.vue` 行覆盖 `58.74%`。
- 剩余风险：仍需覆盖替班放行开工、完工回写、异常上报和 OTD 证据链真实路径。

## Hosted CI 配置证据落在仓库外层

- 问题：当前 git 仓库根是 `v1`，但前序 H20 证据把 CI 收敛到仓库外层 `.github/workflows`；仓库根 `.github/workflows/ci.yml` / `eval.yml` 处于删除态。
- 风险：推送 `origin` 时 hosted runner 可能看不到仓库外层 workflow，形成“本地有 CI 文件、远端无 CI 触发”的假绿灯。
- 处理：H20 架构门和前端 CI coverage 测试改为读取仓库根 workflow；恢复仓库根 `ci.yml` / `eval.yml`，并修正所有路径为当前仓库根相对路径。
- 测试：H20 架构门先红于仓库根 CI 缺失；`frontend-ci-coverage.test.ts` 先红于仓库根 workflow `ENOENT`。
- 验证：修复后 H20 架构门和前端 CI coverage 测试均通过。
- 剩余风险：远端 hosted runner 尚未实跑；当前环境未登录 GitHub CLI 且 `origin` 查询返回 project not found，必须在有远端权限的环境保存 run URL / run id 后才能关闭 hosted CI 发布闸门。

## PostgreSQL/Staging Runbook 暗示生产自动迁移

- 问题：`_docs/SOP.md` 仍把已删除的 `db/init.sql` 列为建库建表文件，性能表写 `API (含 EF 迁移)`；`db/README.md` Docker 段落仍写 API 启动自动 `MigrateAsync` 建表。
- 风险：操作者可能在 Production/staging 直接启动 API 并期待自动建表，绕过已定的显式迁移、pending migration 启动校验和 DBA 可审计流程。
- 处理：SOP 目录树只保留 `seed.sql` 并注明 schema 由 EF Core Migrations 唯一管理；性能表改为 schema 校验；Docker runbook 改为先依赖、再 `dotnet ef database update`、最后 API。
- 测试：`ReleaseRunbooks_ShouldRequireExplicitProductionMigrationAndAvoidLegacyInitSql` 断言 runbook 不得暗示自动迁移，且必须保留显式迁移和 pending migration 策略 token。
- 验证：目标架构测试红绿通过；与 H20 hosted CI 架构门合并过滤运行 `2/2 passed`。
- 剩余风险：文档一致不等于 staging 已实跑；仍需真实 PostgreSQL/staging 执行证据后才能关闭发布闸门。

## PostgreSQL/Staging 缺少可复跑演练取证脚本

- 问题：runbook 已说明 staging/Production 显式迁移流程，但没有单一脚本能收集“依赖启动、迁移、API 启动、健康检查”的完整证据。
- 风险：每次人工执行命令容易漏步骤或漏保存输出；发布审计时只能看到零散命令，而不是可复核的 staging rehearsal 报告。
- 处理：新增 `scripts/run-staging-rehearsal.ps1`，统一执行依赖启动、`dotnet ef database update`、API 启动、`/live` `/ready` 健康检查，并写入 `_docs/_reports`。
- 测试：新增 `StagingRehearsal_ShouldHaveExecutableEvidenceScript`，要求脚本保留关键命令、环境变量和报告路径 token。
- 验证：目标架构测试先红后绿；PowerShell parser 检查通过；本机执行生成 `_docs/_reports/staging-rehearsal-20260601-local.md`。
- 剩余风险：本机无 `docker` 命令，报告结果为 `FAIL`；还没有真实 PostgreSQL/staging `PASS` 报告，发布闸门仍未关闭。

## 安全自评脚本误判 NuGet 中文 clean 输出

- 问题：`Assert-NoVulnerabilityFindings` 直接匹配 `易受攻击的包`，会把 `没有易受攻击的包` 误判为漏洞；随后还暴露 Windows PowerShell 不支持 `String.Contains(value, StringComparison)`。
- 风险：安全自评报告可能在 NuGet 已干净时仍失败，导致团队把注意力放到假阻断上；或者在不同 PowerShell 版本下脚本不可复跑。
- 处理：新增 `Test-ContainsIgnoreCase` helper，按漏洞摘要和表格行识别真实 vulnerable package 输出，同时允许中文 clean 结果。
- 测试：`SecuritySelfAssessment_ShouldFailLoudOnVulnerablePackageOutput` 增加中文 clean token 与 Windows PowerShell 兼容性护栏。
- 验证：目标架构门先红后绿；PowerShell parser 通过；完整 `run-security-self-assessment.ps1` 后续能通过 NuGet 步骤。
- 剩余风险：脚本仍只覆盖自动化证据，不替代人工 Attack Chain A/B/C 验证。

## NuGet / npm high-critical 漏洞阻断安全签字

- 问题：NuGet audit 曾报告 `ClosedXML -> System.IO.Packaging 6.0.0` high；npm audit 报告 `nuxt 3.11.2` 相关 `11 high / 1 critical`，以及 `glob 10.4.5` high。
- 风险：存在 high/critical dependency advisory 时不能进入安全签字；如果仅把 audit 失败归因于 registry 或脚本误判，会掩盖真实发布风险。
- 处理：NuGet 启用 central transitive pinning，pin `System.IO.Packaging 8.0.1`，并把 `RabbitMQ.Client` 升到 `7.2.0`；前端升级 `nuxt 3.21.6`，移除旧 `nuxi` / `nitropack` override，并对 `js-beautify -> glob` 使用 `^10.5.0` override。
- 测试：NuGet vulnerable audit、npm high 阈值 audit、安全自评脚本、前端 unit/lint/build。
- 验证：`dotnet list ... --vulnerable --include-transitive` 无漏洞；`npm audit --audit-level=high` 退出 `0`；`_docs/_reports/security-self-assessment-20260601-local.md` 为 `Result: PASS`；前端 unit `48 files / 223 tests passed`，lint/build 通过。
- 剩余风险：npm audit 仍有 5 个 moderate，修复路径需要 Vite/Vitest major；build 仍有 chunk size warning 和上游 `@vue/shared` deprecation warning。安全签字文档仍为 `UNSIGNED`，需人工验证 Attack Chain A/B/C 后再签。

## 首次灰度与 2 周观察缺少可复跑证据门

- 问题：文档反复记录首次灰度未开始、2 周无 P0/P1 观察窗口不可压缩，但没有单一脚本/报告能证明当前状态或后续 PASS 状态。
- 风险：hosted CI、安全自评或前端测试变绿后，v1.0.0 可能被误标为完成，掩盖灰度和墙钟观察这两个真正的发布闸门。
- 处理：新增 `scripts/run-gray-observation.ps1` 和 `_docs/_reports/gray-observation-20260601.md`，当前以 `NOT_STARTED` / `Result: FAIL` 明确失败。
- 测试：新增 `GrayObservationGate_ShouldHaveEvidencePacketAndFailLoudUntilObservationCompletes`，要求脚本和报告保留 `NOT_STARTED`、`OBSERVING`、`PASS`、`P0/P1`、`14`、`Result: FAIL` 等发布门 token。
- 验证：目标架构门先红后绿；PowerShell parser 通过；默认脚本实跑生成 FAIL 报告并抛错。
- 剩余风险：该脚本不能替代真实灰度和 14 天时间流逝；必须在真实灰度开始后持续更新报告，直到观察窗口完成且 P0/P1 incident count 为 0。

## Hosted CI 缺少远端 run URL/run id 证据门

- 问题：仓库根 `.github/workflows/ci.yml` / `eval.yml` 已恢复，但仍没有单一脚本/报告证明远端 hosted runner 已实际执行。
- 风险：本地 workflow 文件存在可能被误读为 hosted CI 通过；但发布闸门要求远端 run URL/run id/job 摘要，而不是本地配置。
- 处理：新增 `scripts/run-hosted-ci-evidence.ps1` 和 `_docs/_reports/hosted-ci-20260601.md`，当前以 `MISSING_REMOTE_RUN` / `Result: FAIL` 明确失败。
- 测试：新增 `HostedCiRunGate_ShouldHaveEvidenceScriptAndFailLoudWithoutRemoteRun`，要求脚本/报告保留 `RunUrl`、`RunId`、`gh run`、`git ls-remote`、workflow 路径和 `Result: FAIL` 等 token。
- 验证：目标架构门先红后绿；PowerShell parser 通过；默认脚本实跑生成 FAIL 报告并抛错。
- 剩余风险：当前机器没有可用远端权限或 hosted run 证据；必须在 CI 平台实际触发 run 后回填 `RunUrl` / `RunId`。

## Attack Chain A/B/C 缺少手工验证证据门

- 问题：安全签字包明确 `Status: UNSIGNED`，但缺少单一脚本/报告约束 Attack Chain A/B/C 必须由人工验证并附证据后才能进入签字。
- 风险：自动安全自评 `Result: PASS` 可能被误读为安全签字已完成，掩盖 A/B/C 手工攻击链验证仍缺 verifier、时间戳和 evidence 的事实。
- 处理：新增 `scripts/run-attack-chain-verification.ps1` 和 `_docs/_reports/attack-chain-verification-20260601.md`，当前以 `PENDING_MANUAL_VERIFICATION` / `Result: FAIL` 明确失败。
- 测试：新增 `AttackChainManualVerification_ShouldHaveEvidenceScriptAndFailLoudUntilVerified`，要求脚本/报告保留 Attack Chain A/B/C、Verifier、VerifiedAt、Evidence、`Result: FAIL` 和不能关闭安全签字门的 token。
- 验证：目标架构门先红后绿；PowerShell parser 通过；默认脚本实跑生成 FAIL 报告并抛错。
- 剩余风险：脚本只能校验字段和证据链接存在，不能替代 human verifier 的真实攻击链验证；安全签字仍保持 `UNSIGNED`。

## AdminBoard 分区切换缺少可访问性 tab 语义

- 问题：`AdminBoard.vue` 的“用户管理 / 角色权限 / 系统配置 / 通知配置 / Agent 治理 / LLM 设置”分区切换只有普通按钮和视觉 active 样式，没有 `tablist`、`tab` 和当前选中状态。
- 风险：屏幕阅读器用户进入系统管理页时无法获知这是互斥分区切换，也无法直接识别当前所在管理面；管理员执行用户、角色或配置操作时上下文不清。
- 处理：分区容器补 `role="tablist"` / `aria-label`，六个按钮补 `role="tab"` 和动态 `aria-selected`。
- 测试：新增 `admin-board.test.ts`，挂载 AdminBoard 后断言六个分区以 tab 语义暴露，并在切到“系统配置”后更新 `aria-selected`。
- 验证：目标测试先红后绿；相邻组合、scoped lint、full unit、coverage、最终全量 `npm run lint` 均通过；总行/语句覆盖率提升到 `44.31%`，`AdminBoard.vue` 行覆盖 `84.70%`。
- 剩余风险：AdminBoard 还存在大量函数路径未覆盖，当前只覆盖首屏分区语义。

## ReportBoard KPI 维度 tabs 缺少选中状态语义

- 问题：`ReportBoard.vue` 的 OTD KPI 钻取维度已有 tab 结构，但维度按钮没有 `aria-selected`，当前“客户/产线/产品族/时间窗口”选择只靠视觉 active 样式。
- 风险：屏幕阅读器用户无法确认当前 KPI 钻取维度，经营复盘时容易误读客户、产线、产品族或时间窗口口径。
- 处理：为 OTD KPI 维度 tab 增加动态 `aria-selected`。
- 测试：新增 `report-board.test.ts`，挂载 ReportBoard 后断言默认“客户”选中，并在切到“产线”后更新 `aria-selected`。
- 验证：目标测试先红后绿；相邻组合、scoped lint、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `48.19%`，`ReportBoard.vue` 行覆盖 `78.98%`。
- 剩余风险：ReportBoard 还存在导出、承诺包生成、POC 签署等函数路径未充分覆盖；当前只覆盖 KPI 维度切换语义。并行跑 full unit 与 coverage 曾触发 auth store 测试干扰，后续验证应避免同时启动两个 Vitest 全量进程。

## DashboardBoard 指挥中心主线缺少有序列表语义

- 问题：`DashboardBoard.vue` 的 AI MES 指挥中心五步主线是顺序旅程，但 DOM 中只是普通 `.command-grid` 容器和链接卡片。
- 风险：屏幕阅读器用户无法获得“风险识别 -> Agent 重排 -> 采购协同 -> 生产执行 -> OTD 复盘”是有顺序的主线流程，首页控制塔的关键导航语义不足。
- 处理：将 `.command-grid` 改为 `ol[aria-label="AI MES 指挥中心主线"]`，每个步骤使用 `li` 包裹原 `router-link`，并补样式保持卡片宽度和响应式布局。
- 测试：新增 `dashboard-board.test.ts`，挂载 DashboardBoard 后断言主线容器是 `OL`，包含 5 个 `li`，并按顺序暴露五个步骤标题。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `50.07%`，`DashboardBoard.vue` 行覆盖 `95.34%`。
- 剩余风险：DashboardBoard 仍需覆盖 Demo 彩排写入、短缺风险同步、POC Hypercare 和 SignalR 更新等函数路径；当前只覆盖主线结构语义。

## PurchaseBoard 新建采购单弹窗缺少 dialog 语义

- 问题：`PurchaseBoard.vue` 的新建采购订单表单以 modal 形式出现，但没有 `role="dialog"`、`aria-modal` 和标题关联。
- 风险：屏幕阅读器用户点击“+ 新建”后无法获知当前进入了模态对话框，也无法直接获得“新建采购订单”标题上下文。
- 处理：为新建采购单弹窗补 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="create-purchase-order-title"`，并给标题设置稳定 id。
- 测试：新增 `purchase-board.test.ts`，挂载 PurchaseBoard 后点击“+ 新建”，断言新建表单以 labelled modal dialog 暴露。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `53.60%`，`PurchaseBoard.vue` 行覆盖 `66.04%`。
- 剩余风险：PurchaseBoard 的收货弹窗仍需同类 dialog 语义补强；缺料加急、供应风险和收货闭环函数路径仍需要继续覆盖。

## AuditDecisionReplayPanel 回放按钮缺少当前选中语义

- 问题：`AuditDecisionReplayPanel.vue` 的“回放决策链”按钮可以切换详情，但按钮本身没有 `aria-pressed` 或等价当前状态语义。
- 风险：审计人员使用屏幕阅读器复核 AI 决策链时，只能听到多个同名按钮，无法直接确认当前详情对应哪条回放动作，容易误读证据链上下文。
- 处理：为每个 `.replay-btn` 增加动态 `aria-pressed="selectedId === item.id"`，让默认和点击后的当前回放动作都可被辅助技术识别。
- 测试：新增 `audit-decision-replay-panel.test.ts`，mock 审计 API 与所有 backend-first 读取为空，挂载组件后断言默认第一条回放按钮为 pressed，点击第二条后选中状态和详情标题同步切换。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `54.83%`，`AuditDecisionReplayPanel.vue` 行覆盖 `35.86%`。
- 剩余风险：当前只覆盖 base replay items 的选中语义；动态审计日志映射、质量灰度、OTD 证据链、知识治理和 backend business write 解析路径仍需要后续覆盖。

## QualityBoard 根因分析浮动面板缺少 dialog 语义

- 问题：`QualityBoard.vue` 的根因分析浮动面板显示为覆盖式面板，但没有 `role="dialog"`、`aria-modal` 和标题关联。
- 风险：质量工程师使用屏幕阅读器查看根因分析时，无法获知当前进入了独立分析面板，也无法直接获得对应检验批次标题上下文。
- 处理：为 `.analysis-panel` 增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="root-cause-analysis-title"`，并给标题设置稳定 id。
- 测试：新增 `quality-board.test.ts`，mock 质量 API 返回一条不合格检验批次，点击“根因分析”后断言根因分析面板以 labelled modal dialog 暴露。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `59.76%`，`QualityBoard.vue` 行覆盖 `80.98%`。
- 剩余风险：当前只覆盖根因分析面板语义；关闭后的焦点恢复、键盘关闭、返工/MRB/CAPA 业务路径仍需要后续覆盖。

## MonitoringBoard 设备卡片和详情抽屉缺少键盘/dialog 语义

- 问题：`MonitoringBoard.vue` 的设备卡片是可点击 `div`，没有 button 角色、tab 焦点或键盘打开方式；设备详情抽屉没有 dialog 角色和标题关联。
- 风险：键盘用户无法进入设备详情，屏幕阅读器用户也无法确认当前抽屉是设备详情上下文；这会削弱灰度观察期间监控入口的可操作性。
- 处理：为 `.equip-card` 增加 `role="button"`、`tabindex="0"`、设备详情 `aria-label`、Enter/Space 键入口；为 `.drawer-panel` 增加 `role="dialog"`、`aria-modal` 和 `aria-labelledby`。
- 测试：新增 `monitoring-board.test.ts`，用 offline demo 数据挂载 MonitoringBoard，断言首个设备卡可键盘访问，并通过 Enter 打开 labelled equipment detail dialog。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `62.59%`，`MonitoringBoard.vue` 行覆盖 `90.54%`。
- 剩余风险：当前只覆盖设备详情键盘入口；SignalR 连接生命周期、现场态势同步/升级、Hypercare 观察卡片仍需要后续覆盖。

## KnowledgeGovernancePanel 文档复核按钮缺少文档级可访问名称

- 问题：`KnowledgeGovernancePanel.vue` 中过期/待索引文档的复核按钮均显示为“复核并重建索引”，没有在可访问名称中包含文档标题。
- 风险：知识治理人员使用屏幕阅读器处理多个待复核文档时，无法直接判断当前按钮对应哪份知识源，可能误触发错误文档的复核/重建索引。
- 处理：为文档复核按钮增加动态 `aria-label="复核并重建索引：${item.title}"`。
- 测试：新增 `knowledge-governance-panel.test.ts`，挂载一条即将过期的 CNC 主轴维护手册，断言按钮可访问名称包含文档标题，并确认点击仍 emit 原始文档对象。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `63.88%`，`KnowledgeGovernancePanel.vue` 行覆盖 `68.78%`。
- 剩余风险：当前只覆盖文档复核按钮；质量资产治理区的再训练、灰度发布、回滚等同名按钮仍需要补资产/版本级上下文。

## SkillMatrixPanel 停工复核阻断缺少 alert 语义和明确首屏原因

- 问题：`SkillMatrixPanel.vue` 在资质临期且无有效替班候选时会显示停工复核区域，但该区域没有 `role="alert"`、没有标题关联，且初始正文只说明“生成停工复核后”流程，没有直接说出“无有效替班候选”。
- 风险：键盘/屏幕阅读器用户可能无法即时感知生产开工被阻断的原因；人员资质放行属于生产安全和审计关键路径，不能只靠视觉颜色或候选排序区域传递阻断状态。
- 处理：为 `.qualification-review` 增加 `role="alert"`、`aria-labelledby="qualification-review-title"` 和稳定标题 id；新增 `reviewAlertMessage`，在无候选且未生成阻断记录时直接显示 `无有效替班候选：<阻断原因>`。
- 测试：新增 `skill-matrix-panel.test.ts`，构造一名热处理资质临期员工且不给有效替班候选，断言停工复核 alert 语义、标题关联和首屏阻断原因。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `64.54%`，`SkillMatrixPanel.vue` 行覆盖 `84.57%`。
- 剩余风险：当前只覆盖无候选阻断首屏；确认复核、补证改派、候选评分排序和 OTD 写入分支仍需要后续测试。

## DocumentUpload 拖拽上传区缺少键盘可访问入口

- 问题：`DocumentUpload.vue` 的上传区提示“点击选择文件”，但 `.drop-zone` 没有 button 角色、tab 焦点、可访问名称或键盘触发逻辑。
- 风险：键盘用户无法进入知识文档上传入口；RAG 来源、质量知识和合规资料无法通过等价输入方式进入治理流程，影响首屏可用性和审计可达性。
- 处理：为 `.drop-zone` 增加 `role="button"`、`tabindex="0"`、`aria-label="选择或拖拽上传知识文档"`，并通过 `openFilePicker()` 支持点击、Enter、Space 触发文件选择。
- 测试：新增 `document-upload.test.ts`，mock 外部读取和知识治理子组件，断言上传区语义、键盘焦点、可访问名称和 Enter 触发 file input click。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `65.52%`，`DocumentUpload.vue` 行覆盖 `57.92%`。
- 剩余风险：当前只覆盖上传入口；文件格式/大小校验、重复文件、上传错误、队列清空和真实 uploadDocument 结果仍需要后续覆盖。

## RiskActionQueuePanel 卡片动作按钮缺少风险上下文

- 问题：`RiskActionQueuePanel.vue` 每张风险卡的“转派/升级/关闭”按钮只暴露同名短文案，没有包含风险标题。
- 风险：屏幕阅读器用户在风险队列里会听到多组同名按钮，无法判断当前操作对应哪条工单延期、物料缺口或设备健康风险，可能误升级或误关闭错误风险。
- 处理：为卡片动作按钮增加动态 `aria-label`，分别暴露 `转派风险：<标题>`、`升级风险：<标题>`、`关闭风险：<标题>`。
- 测试：新增 `risk-action-queue-panel.test.ts`，断言首张风险卡升级按钮包含风险标题，并确认点击后状态变为“已升级”且写入 `appendRiskActionTrace`。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `67.71%`，`RiskActionQueuePanel.vue` 行覆盖 `80.04%`。
- 剩余风险：当前只覆盖 base 队列的升级路径；SLA 晨会包生成/关闭、动态监控升级反写、异常分流和助手执行包映射仍需要后续覆盖。

## BomBoard BOM 列表缺少键盘选择和选中状态语义

- 问题：`BomBoard.vue` 的 BOM 列表项是可点击 `div`，没有 listbox/option 语义、tab 焦点、键盘选择入口或 `aria-selected` 当前状态。
- 风险：键盘用户无法选择 BOM 查看详情；屏幕阅读器用户也无法确认当前详情对应哪条 BOM，容易影响替代料审批、ECN 影响分析和齐套检查的操作上下文。
- 处理：为列表容器增加 `role="listbox"` 和 `aria-label="BOM 列表"`；为每条 BOM 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 触发 `selectBom(b)`。
- 测试：新增 `bom-board.test.ts`，断言列表语义、第二条 BOM 可聚焦且默认未选中；按 Enter 后调用 `getBomById('bom-2')`，详情标题更新并将第二条标记为选中。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `68.72%`，`BomBoard.vue` 行覆盖 `72.95%`。
- 剩余风险：当前只覆盖 BOM 选择入口；爆炸展开、替代料审批、ECN 批准/驳回、BOM 齐套包发布和 OTD 证据写入仍需要后续覆盖。

## EquipmentBoard 类型筛选逻辑反向

- 问题：`EquipmentBoard.vue` 的类型筛选使用 `equipmentType !== typeFilter`，选择 `CNC` 时会排除 CNC 设备，只显示其他类型。
- 风险：设备管理人员按类型定位设备时看到错误结果，可能误判某类设备不存在或遗漏维护/健康风险；这会影响设备状态排查、排产设备约束和灰度观察期间的问题定位。
- 处理：把 `filteredEquipment` 的类型过滤条件改为 `equipmentType === typeFilter`。
- 测试：新增 `equipment-board.test.ts`，构造 CNC 和 Assembly 两台设备，选择 `CNC` 后断言列表只显示 `CNC-001 加工中心`。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `69.85%`，`EquipmentBoard.vue` 行覆盖 `79.00%`。
- 剩余风险：当前只覆盖类型筛选；状态筛选、类型+状态组合、健康/维护/诊断 tab 和审计定位 fallback 仍需要后续覆盖。

## KittingClosurePanel 缺料排产事件按钮缺少工单上下文

- 问题：`KittingClosurePanel.vue` 每张工单卡片都有同名“生成缺料排产事件”按钮，按钮可访问名称没有包含工单号、缺料物料或缺口数量。
- 风险：库存/计划人员使用屏幕阅读器处理多个缺料工单时，无法判断当前按钮会把哪张工单和哪项缺料写入排产事件，可能误触发错误的齐套复核。
- 处理：新增 `firstShortageItem()` 和 `shortageActionLabel()`，为按钮生成 `生成缺料排产事件：<工单> / <物料> 缺 <数量><单位>` 的动态 `aria-label`；已齐套工单标明已齐套。
- 测试：新增 `kitting-closure-panel.test.ts`，断言首张工单按钮 label 包含 `WO-RUSH-9001 / M-AL-6061 缺 19件`，并确认点击仍写入短缺事件和 OTD 证据链。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率提升到 `71.91%`，`KittingClosurePanel.vue` 行覆盖 `92.95%`。
- 剩余风险：当前只覆盖首个缺料按钮；异常分流批次隔离、BOM 齐套包展示和 warning/ready 状态的按钮语义仍需后续覆盖。

## AnomalyBoard 异常卡片缺少键盘选择和选中状态语义

- 问题：`AnomalyBoard.vue` 的异常卡片是可点击 `div`，没有 listbox/option 语义、tab 焦点、键盘选择入口或 `aria-selected` 当前状态。
- 风险：键盘用户无法打开异常详情；屏幕阅读器用户也无法确认当前详情对应哪条异常，容易影响现场异常分流、风险队列联动和 OTD 复盘上下文。
- 处理：为异常列表增加 `role="listbox"` 和 `aria-label="异常记录列表"`；为每张异常卡增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 触发 `selectAnomaly(a)`。
- 测试：新增 `anomaly-board.test.ts`，断言异常卡可聚焦且默认未选中；按 Enter 后调用 `getAnomalyById('a-1')`，详情标题更新并将该卡标记为选中。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；当前总行/语句覆盖率 `71.84%`，`AnomalyBoard.vue` 行覆盖 `70.91%`。
- 剩余风险：当前只覆盖异常详情选择入口；AI 分析、事件分流、分页、详情面板 dialog 语义和 backend-first 动态事件合并仍需要后续覆盖。

## RiskBoard 加载失败 fallback 缺少 alert 语义

- 问题：`RiskBoard.vue` 风险看板 API 失败后会显示错误横幅并加载演示数据，但错误横幅没有 `role="alert"` / live region 语义。
- 风险：用户可能看到一屏风险数据却不知道它来自演示 fallback，而不是实时风险 API；屏幕阅读器用户尤其容易漏掉加载失败状态。
- 处理：为 `.error-banner` 增加 `role="alert"` 和 `aria-live="assertive"`。
- 测试：新增 `risk-board.test.ts`，mock `getRiskDashboard()` 抛错，断言 alert 包含 `加载失败: risk api unavailable` 和 `已加载演示数据`，并确认 demo 工单 `WO-2026-0042` 已渲染。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `73.75%`，`RiskBoard.vue` 行覆盖 `99.80%`。
- 剩余风险：当前只覆盖普通 API 失败 fallback；真实 API 成功、空风险列表、离线演示错误静默 fallback 和风险分区边界等级仍可后续补测。

## RoutingBoard 工艺路线列表缺少键盘选择和选中状态语义

- 问题：`RoutingBoard.vue` 的路线列表项是可点击 `div`，没有 listbox/option 语义、tab 焦点、键盘选择入口或 `aria-selected` 当前状态。
- 风险：工艺工程师或计划人员无法用键盘选择路线查看详情；屏幕阅读器用户也无法确认当前详情对应哪条工艺路线，影响工艺路线排产约束和能力校验上下文。
- 处理：为路线列表增加 `role="listbox"` 和 `aria-label="工艺路线列表"`；为每条路线增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 触发 `selectRoute(r)`。
- 测试：新增 `routing-board.test.ts`，断言路线列表语义、第二条路线可聚焦且默认未选中；按 Enter 后调用 `getRouteById('route-b')`，详情标题更新并将第二条标记为选中。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `74.47%`，`RoutingBoard.vue` 行覆盖 `85.26%`。
- 剩余风险：当前只覆盖路线选择入口；能力校验运行、分流确认、草稿路线约束、分页和 backend-first 能力校验记录合并仍需要后续覆盖。

## InventoryBoard 物料列表缺少键盘选择和选中状态语义

- 问题：`InventoryBoard.vue` 的物料列表项是可点击 `div`，没有 listbox/option 语义、tab 焦点、键盘选择入口或 `aria-selected` 当前状态。
- 风险：库存/计划人员无法用键盘选择物料查看详情；屏幕阅读器用户也无法确认当前详情和交易记录对应哪条物料，影响库存、缺料、齐套和采购协同上下文。
- 处理：为物料列表增加 `role="listbox"` 和 `aria-label="物料库存列表"`；为每条物料增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`，并支持 Enter/Space 触发 `selectItem(item)`。
- 测试：新增 `inventory-board.test.ts`，断言物料列表语义、第二条物料可聚焦且默认未选中；按 Enter 后调用 `getStockTransactions('MAT-B02')`，详情标题更新并将第二条标记为选中。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `74.34%`，`InventoryBoard.vue` 行覆盖 `85.32%`。
- 剩余风险：当前只覆盖物料选择入口；入库/出库/调拨/盘点 dialog、交易记录加载失败、导出和齐套闭环页面级集成仍需要后续覆盖。

## ScannerBoard 摄像头占位区缺少键盘可访问入口

- 问题：`ScannerBoard.vue` 的摄像头占位区提示“点击开启摄像头扫描”，但 `.scanner-placeholder` 没有 button 角色、tab 焦点、可访问名称或键盘触发逻辑。
- 风险：键盘用户无法进入现场扫码入口；扫码到站、设备点检和物料齐套证据无法通过等价输入方式开启，影响现场执行链路可达性。
- 处理：为 `.scanner-placeholder` 增加 `role="button"`、`tabindex="0"`、`aria-label="开启摄像头扫描"`，并支持 Enter/Space 触发 `scannerActive = true`。
- 测试：新增 `scanner-board.test.ts`，mock 摄像头库和外部依赖，断言占位区语义、键盘焦点、可访问名称和 Enter 触发 `Html5Qrcode.start()`。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `74.82%`，`ScannerBoard.vue` 行覆盖 `63.08%`。
- 剩余风险：当前只覆盖摄像头入口；手动输入失败、上下文跳转、证据链确认、扫码历史重放和真实摄像头权限/识别仍需要后续覆盖。

## EmployeeBoard 员工卡片缺少键盘可访问详情入口

- 问题：`EmployeeBoard.vue` 的员工卡片是可点击 `div`，没有 button 角色、tab 焦点、员工级可访问名称或键盘触发逻辑。
- 风险：键盘用户无法进入员工详情；屏幕阅读器用户也无法直接确认当前卡片对应哪个工号和姓名，影响人员资质、替班放行和开工阻断解释链路。
- 处理：为 `.emp-card` 增加 `role="button"`、`tabindex="0"`、动态员工级 `aria-label`，并支持 Enter/Space 触发 `openEdit(e)`。
- 测试：新增 `employee-board.test.ts`，mock 员工 API 返回两名员工，断言首张卡片语义、焦点入口、可访问名称，并通过 Enter 打开员工详情。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `76.15%`，`EmployeeBoard.vue` 行覆盖 `76.58%`。
- 剩余风险：当前只覆盖员工详情入口；新增、编辑保存、离职、过滤组合、分页、导出和 SkillMatrixPanel 页面级集成仍需要后续覆盖。

## BarcodePrintBoard 标签卡片缺少键盘选择和选中状态语义

- 问题：`BarcodePrintBoard.vue` 的标签卡片是可点击 `div`，内部 checkbox 只表达视觉状态，外层卡片没有 checkbox 角色、tab 焦点、可访问名称或键盘切换逻辑。
- 风险：键盘用户无法选择工单/设备/物料追溯标签；屏幕阅读器用户也无法获知标签卡片当前是否选中，影响现场扫码前置标签打印可达性。
- 处理：为 `.label-card` 增加 `role="checkbox"`、`tabindex="0"`、动态 `aria-checked` 和 `aria-label="选择打印标签：<编码> <名称>"`，并支持 Enter/Space 触发 `toggleSelect(item.id)`。
- 测试：新增 `barcode-print-board.test.ts`，mock 库存标签数据和 QRCode，断言首张标签卡语义、焦点入口、可访问名称、默认未选中，并通过 Enter 切换选中状态。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `75.73%`，`BarcodePrintBoard.vue` 行覆盖 `81.43%`。
- 剩余风险：当前只覆盖标签选择；打印窗口、QR 生成失败、证据状态、筛选和真实 canvas/浏览器打印路径仍需要后续覆盖。

## AuditLogBoard 详情按钮缺少审计记录上下文

- 问题：`AuditLogBoard.vue` 的每行审计日志都有同名“详情”按钮，按钮可访问名称没有包含用户、动作、资源或资源 ID。
- 风险：安全/合规复核人员使用屏幕阅读器浏览审计表格时，无法判断当前详情按钮对应哪条审计记录，可能打开错误的证据链详情。
- 处理：为详情按钮增加动态 `aria-label="查看审计日志详情：<用户> <动作标签> <资源> <资源ID>"`。
- 测试：新增 `audit-log-board.test.ts`，mock 两条审计日志和详情接口，断言第二条日志详情按钮包含 `operator1 更新 Production wo-001`，并确认点击打开 `audit-2` 的详情 JSON。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `76.96%`，`AuditLogBoard.vue` 行覆盖 `91.62%`。
- 剩余风险：当前只覆盖成功加载后的详情按钮；筛选 watch、分页、API 失败 fallback、详情失败和详情弹窗 dialog 语义仍需要后续覆盖。

## AuditDecisionReplayPanel 回放按钮缺少决策链上下文

- 问题：`AuditDecisionReplayPanel.vue` 中多个回放卡片按钮都叫“回放决策链”，只有 `aria-pressed` 选中状态，没有暴露当前按钮对应的决策标题。
- 风险：安全/合规复核人员使用屏幕阅读器检查 AI 建议、业务落库动作或证据链回放时，无法判断哪个按钮会打开哪条决策链，容易误读回放上下文。
- 处理：为 `.replay-btn` 增加动态 `aria-label="回放决策链：<标题>"`。
- 测试：扩展 `audit-decision-replay-panel.test.ts`，断言第二个回放按钮包含 `M-AL-6061 收货后释放冻结工序`，并确认点击后详情仍切换到对应回放链。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `76.96%`，`AuditDecisionReplayPanel.vue` 行覆盖 `36.17%`。
- 剩余风险：当前只覆盖 base 回放卡片按钮；大量 backend-first 映射分支、配置审批、质量灰度、知识治理和 OTD 证据回放仍需要后续覆盖。

## AuditDecisionReplayPanel 业务落库回放链接缺少业务对象上下文

- 问题：后端 Agent 业务落库审计生成的回放详情有“打开采购协同”等业务页链接，但链接可访问名称没有包含具体采购单、质检单或设备对象。
- 风险：安全/合规复核人员从审计回放跳转业务页时，辅助技术无法说明即将打开哪条业务对象，可能导致错误核对业务落库证据。
- 处理：为 `.trace-link` 增加动态 `aria-label="打开<routeLabel>：<object>"`。
- 测试：扩展 `audit-decision-replay-panel.test.ts`，mock `AgentExecutePurchaseAction` 审计详情中的 `businessWrite.purchase-order`，断言默认回放为采购收货落库，步骤包含 `po-1 / M-AL-6061 / 收货 64`，链接 label 为 `打开采购协同：PO-RUSH-20260519`。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `77.08%`，`AuditDecisionReplayPanel.vue` 行覆盖 `39.73%`。
- 剩余风险：当前只覆盖采购收货业务落库；质量处置、设备状态、真实路由 query 定位和后端异常降级仍需要后续覆盖。

## ScheduleBoard 优化预警缺少状态区域语义

- 问题：`ScheduleBoard.vue` 优化成功后会把后端 `warnings` 渲染到 `.warnings-bar`，但预警条没有 status/live region 语义或可访问名称。
- 风险：计划员触发优化后，屏幕阅读器用户可能不会感知瓶颈窗口冲突等预警更新；这会削弱排产优化结果的可审阅性，尤其是在预警不是错误 alert、但仍需要决策关注时。
- 处理：为 `.warnings-bar` 增加 `role="status"`、`aria-live="polite"` 和 `aria-label="排产预警"`。
- 测试：扩展 `schedule-board.test.ts`，mock `optimizeSchedule()` 返回 `warnings: ['CNC-01 瓶颈窗口冲突']`，断言点击优化后预警条暴露 polite status 语义并包含预警文本。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `77.11%`，`ScheduleBoard.vue` 行覆盖 `47.05%`。
- 剩余风险：当前只覆盖优化成功 warnings；排产后端失败 fallback warnings、多 warning 排列、批量优化和风险联动预警仍需要后续覆盖。

## ProductionBoard 生产工单列表缺少键盘选择和选中状态语义

- 问题：`ProductionBoard.vue` 的生产工单卡片是可点击 `div`，没有 listbox/option 语义、tab 焦点、键盘选择入口或 `aria-selected` 当前状态。
- 风险：现场生产人员无法用键盘选择工单进入详情；屏幕阅读器用户也无法确认当前详情、工序列表和开工/完工动作对应哪张工单，影响生产执行和 OTD 证据链上下文。
- 处理：为 `.wo-list` 增加 `role="listbox"` 和 `aria-label="生产工单列表"`；为每张 `.wo-card` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`、动态 `aria-label`，并支持 Enter/Space 触发 `selectWorkOrder(wo)`。
- 测试：扩展 `production-board.test.ts`，mock 两张工单，断言第二张工单可聚焦且默认未选中；按 Enter 后详情切换到 `WO-002` 并将该卡标记为选中。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `77.13%`，`ProductionBoard.vue` 行覆盖 `59.28%`。
- 剩余风险：当前只覆盖工单选择入口；工序动作按钮动态命名、扫码完工、异常上报、质量门和真实浏览器扫码链路仍需要后续覆盖。

## DocumentUpload 拒绝文件错误缺少 alert 语义

- 问题：`DocumentUpload.vue` 拒绝不支持格式或超大文件时会显示 `.error-msg`，但错误消息没有 alert/live region 语义。
- 风险：知识库管理员选择错误文件后，屏幕阅读器用户可能不会即时获知文件未进入上传队列及其原因，容易误以为“开始上传”不可用是系统卡住。
- 处理：为 `.error-msg` 增加 `role="alert"` 和 `aria-live="assertive"`。
- 测试：扩展 `document-upload.test.ts`，构造 `virus.exe` 触发 file input change，断言错误消息以 alert 语义出现并包含拒绝原因。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `77.16%`，`DocumentUpload.vue` 行覆盖 `59.73%`。
- 剩余风险：当前只覆盖格式拒绝；超大文件、单文件上传失败、队列项错误态和成功上传后的治理文档注入仍需要后续覆盖。

## PurchaseBoard 采购订单列表缺少键盘选择和选中状态语义

- 问题：`PurchaseBoard.vue` 的采购订单列表项是可点击 `div`，没有 listbox/option 语义、tab 焦点、键盘选择入口或 `aria-selected` 当前状态。
- 风险：采购/计划人员无法用键盘选择采购单查看详情；屏幕阅读器用户也无法确认当前详情、物料明细和提交/确认/收货动作对应哪张采购订单，影响缺料加急、供应风险和外协到货确认上下文。
- 处理：为 `.list-items` 增加 `role="listbox"` 和 `aria-label="采购订单列表"`；为每张 `.list-item` 增加 `role="option"`、`tabindex="0"`、动态 `aria-selected`、动态 `aria-label`，并支持 Enter/Space 触发 `selectOrder(o)`。
- 测试：扩展 `purchase-board.test.ts`，mock 两张采购单，断言第二张采购单可聚焦且默认未选中；按 Enter 后调用 `getPurchaseById('po-b')`，详情切换到 `PO-20260602` 并将该项标记为选中。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `77.27%`，`PurchaseBoard.vue` 行覆盖 `69.37%`。
- 剩余风险：当前只覆盖采购单选择入口；创建、提交、确认、收货、取消、供应风险升级、替代供应商锁定、外协到货确认和真实 API 成功/失败路径仍需要后续覆盖。

## ScannerBoard 扫描历史缺少键盘重放入口

- 问题：`ScannerBoard.vue` 的扫描历史项是可点击 `div`，没有 button 语义、tab 焦点、键盘触发入口或可访问名称。
- 风险：现场操作员无法用键盘重放历史扫码；屏幕阅读器用户也无法确认历史项会重新扫描哪个工单/设备/物料，影响扫码证据链复核和现场纠错。
- 处理：为 `.history-item` 增加 `role="button"`、`tabindex="0"`、动态 `aria-label="重新扫描<类型> <编码> <名称>"`，并支持 Enter/Space 触发 `handleScan(item.code)`。
- 测试：扩展 `scanner-board.test.ts`，手动输入 `WO-RUSH-9001` 走 demo fallback 生成历史，断言历史项语义和 label，并通过 Enter 重放同一工单。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `77.41%`，`ScannerBoard.vue` 行覆盖 `80.55%`，函数覆盖 `43.75%`。
- 剩余风险：当前只覆盖工单历史重放；真实摄像头解码、摄像头失败、设备/物料重放字段、证据确认写入和路由跳转仍需要后续覆盖。

## KnowledgeGovernancePanel 下一轮训练集合并按钮缺少资产上下文

- 问题：`KnowledgeGovernancePanel.vue` 的下一轮训练集资产在未生成版本记录时显示“合并现场反馈”按钮，但按钮可访问名称没有包含资产标题。
- 风险：质量主管或知识治理人员使用辅助技术处理多个训练集候选时，无法区分当前按钮会合并哪一项现场反馈，可能误触训练集治理动作。
- 处理：为下一轮训练集的合并按钮增加 `aria-label="合并现场反馈：<asset.title>"`。
- 测试：扩展 `knowledge-governance-panel.test.ts`，构造 `R3 下一轮训练集：现场复核反馈` 资产，断言按钮 label，并确认点击后 emit `quality-next-training-merged` 的 payload 为 `feedback-r3-001`。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `77.68%`，`KnowledgeGovernancePanel.vue` 行覆盖 `83.40%`，函数覆盖 `17.94%`。
- 剩余风险：当前只覆盖下一轮训练集的合并入口；批准、校验、灰度发布、reopened 校验、实验候选和父组件写入刷新仍需要后续覆盖。

## ScheduleBoard 任务详情请求期间缺少加载态

- 问题：`ScheduleBoard.vue` 在甘特任务点击后会立即打开工单详情和任务级排产解释，但向后端请求真实工单详情期间没有把 `detailLoading` 置为 true。
- 风险：计划员点击任务后，详情面板可能显示演示工单/本地解释，却没有提示真实工单详情仍在加载；在慢接口或网络抖动下容易误判当前详情已经是最终后端数据。
- 处理：在 `handleTaskClick()` 调用 `openDemoTaskExplanation(task)` 后、调用 `api.getWorkOrderById(task.workOrderId)` 前设置 `detailLoading.value = true`，保持既有成功覆盖和失败 fallback 行为。
- 测试：扩展 `schedule-board.test.ts`，用 `GanttChart` stub 发出 `task-click`，让 `getWorkOrderById` 返回 pending promise，断言 `OrderDetailPanel` 已 visible、loading 为 true，且 explanation 指向 `WO-001`。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `77.86%`，`ScheduleBoard.vue` 行覆盖 `50.25%`。
- 剩余风险：当前只覆盖请求 pending 状态；真实工单成功覆盖、请求失败 fallback、拖拽保存失败恢复、Agent 事件采纳和 A/B 报告读取仍需要后续覆盖。

## AuditDecisionReplayPanel 配置审批清单缺少列表语义

- 问题：`AuditDecisionReplayPanel.vue` 的“关键配置变更审批”区域显示待审批配置，但容器和每个审批项都是普通 `div`，没有列表语义或逐项上下文 label。
- 风险：安全/合规复核人员使用辅助技术检查 Agent 策略变更时，无法快速确认这是审批清单，也无法从单行语义中区分审批标题、状态和责任人；安全签字前的配置审计可读性不足。
- 处理：为 `.approval-lane` 增加 `role="list"` 和 `aria-label="关键配置变更审批"`；为 `.approval-row` 增加 `role="listitem"` 和动态 `aria-label="审批项：<title>，状态 <status>，责任人 <owner>"`。
- 测试：扩展 `audit-decision-replay-panel.test.ts`，mock pending 配置审批，断言审批区域 list/listitem 语义、审批项上下文 label 和 `1 个配置待审批` 计数。
- 验证：目标测试先红后绿；相邻组合、full lint、full unit、coverage 均通过；总行/语句覆盖率 `77.95%`，`AuditDecisionReplayPanel.vue` 行覆盖 `42.47%`。
- 剩余风险：当前只覆盖审批清单的可读性；审批动作仍由 AdminBoard 承接，质量/设备业务落库回放和更多 backend-first 映射分支仍需要后续覆盖。
