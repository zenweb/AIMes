# 2026-06-01 Sprint 6 Code Hygiene Review

## 6.6 Login Page Stale Error Clear 复核

- 登录页错误提示已经具备 alert、字段关联和失败后焦点恢复；但用户开始修改凭据后，旧错误如果继续存在，会让字段仍处于 invalid 状态，形成过期反馈。
- 修复后用户名/密码任一输入变化都会清理当前错误；下一次提交仍会重新运行 trim 校验或登录请求，并按新结果展示错误。
- 测试覆盖真实组件路径：mock 登录失败，确认错误出现后编辑密码会移除 alert，并清掉两个凭据字段上的 `aria-invalid` / `aria-describedby`。
- 风险：当前仍是表单级错误模型；若未来拆成字段级错误，需要把清理策略细分为字段级或错误来源级。
- 验证：目标测试红绿已确认，登录页测试 `9/9 passed`，相邻身份测试 `11/11 passed`。

## 6.6 Login Page Validation Focus Recovery 复核

- 空白凭据校验失败时，错误会关联用户名和密码两个字段；焦点如果留在 `body`，键盘用户需要重新定位到表单起点。
- 修复后校验失败路径聚焦用户名输入框，符合当前表单级“请输入用户名和密码”错误模型，并保留提交入口的 trim guard。
- 测试把组件挂到 `document.body`，通过真实 DOM `activeElement` 断言焦点位置，并用 `finally` 卸载组件避免污染后续测试。
- 风险：未来如果拆分字段级校验，应根据具体缺失字段决定焦点目标，而不是固定用户名。
- 验证：目标测试红绿已确认，登录页测试 `10/10 passed`，相邻身份测试 `11/11 passed`。

## 6.6 Login Page First Invalid Field Focus 复核

- 前一切片让空白校验失败回到用户名，但当用户名已有效、只有密码缺失时，固定回用户名会让键盘用户多走一步。
- 修复后校验失败会聚焦第一个无效凭据字段：用户名缺失优先用户名，用户名有效但密码缺失则聚焦密码。
- 测试覆盖真实 DOM 焦点：用户名填 `admin`、密码填空白，提交后断言 `document.activeElement` 是密码输入框。
- 风险：当前错误文案仍是表单级 `请输入用户名和密码`；未来如拆分字段级文案，应同步调整字段级 `aria-describedby`。
- 验证：目标测试红绿已确认，登录页测试 `11/11 passed`，相邻身份测试 `11/11 passed`。

## 6.6 Login Page Field-Level Invalid State 复核

- 前一切片已经能把焦点放到第一个缺失字段，但字段错误状态仍是表单级：用户名有效、密码缺失时两个字段都会被标记 invalid。
- 修复后空白校验失败只标记实际缺失字段；登录请求失败仍保留两个字段 invalid，因为这是凭证组合错误，无法单独归责到用户名或密码。
- 测试覆盖真实组件路径：用户名填 `admin`、密码填空白，提交后断言用户名没有 `aria-invalid` / `aria-describedby`，密码关联 `login-error`。
- 风险：错误文案仍是统一 `请输入用户名和密码`；如果后续拆成字段级文案，需要让每个字段指向更具体的描述节点。
- 验证：目标测试红绿已确认，登录页测试 `12/12 passed`，相邻身份测试 `11/11 passed`，coverage/full unit/lint 均通过。

## 6.6 MainLayout Mobile Menu A11y 复核

- `MainLayout.vue` 是全局壳层组件，移动菜单按钮此前只靠视觉状态和 DOM 面板显示表达开合，辅助技术无法读取展开状态。
- 修复后按钮通过 `aria-expanded` 暴露关闭/打开状态，并通过 `aria-controls` 指向打开后的移动导航面板。
- 测试覆盖真实组件挂载路径，并 stub Nuxt/PrimeVue/子组件依赖，避免把测试耦合到第三方渲染细节；`localStorage` 使用既有内存夹具。
- 风险：当前只覆盖移动菜单状态，尚未覆盖退出登录、暗色模式持久化、移动导航点击后关闭菜单等壳层行为。
- 验证：目标测试红绿已确认，MainLayout 测试 `1/1 passed`，登录页相邻测试 `12/12 passed`，coverage/full unit/lint 均通过。

## Claude Opus 4.8 外审采纳

- 外审结论：不建议继续精修已 100% 覆盖的 LoginPage；建议用覆盖率增量作为 6.6 选片路由信号，并把发布阻断项从前端测试轨道中显式拆出。
- 证据核对：当前 `coverage-summary.json` 显示总行/语句覆盖率 `24.19%`，`LoginPage.vue` 行覆盖 `100%`，`MainLayout.vue` 行覆盖 `93.58%`，`ScheduleBoard.vue` 行覆盖 `0.00%` 且约 `2771` 行。
- 技术判断：反馈成立。继续在 LoginPage 上做字段级微调只会改善局部体验，不能显著提升总体发布就绪度；下一片应转向 0 覆盖且用户必经的核心排产入口。
- 采纳动作：新增 Coverage-Leverage Routing 规则，下一片锁定 `ScheduleBoard.vue` 首个高价值组件测试；发布阻断项另列 Release Gate 轨道，避免质量绿灯掩盖 hosted CI / staging / 灰度 / 安全签字 / 观察窗口缺口。
- 风险：`ScheduleBoard.vue` 体量大、依赖多，测试夹具需严格控制范围，优先断言稳定首屏契约或关键操作入口，避免一次性覆盖过宽导致脆弱测试。

## 6.6 ScheduleBoard Optimize Error Alert 复核

- `ScheduleBoard.vue` 是 `/scheduling` 核心排产入口，优化失败横幅此前只提供视觉反馈；键盘和屏幕阅读器用户可能无法及时感知优化失败。
- 修复后错误横幅具备 `role="alert"` 和 `aria-live="assertive"`，覆盖优化失败路径，并复用同一个错误横幅承载其他排产保存/加载错误。
- 测试覆盖真实组件挂载和真实 `handleOptimize()` 路径：初始化排产计划成功后点击工具栏优化，mock 优化接口失败，断言错误横幅是 alert 且包含失败原因。
- 风险：为隔离大组件依赖，测试 stub 了多个子组件和证据链读取边界；后续仍应继续补充更接近用户工作流的排产事件队列、采纳、拖拽保存等行为测试。
- 验证：目标测试红绿已确认，ScheduleBoard 测试 `1/1 passed`，coverage/full unit/lint 均通过；`ScheduleBoard.vue` 行覆盖从 `0.00%` 打开到 `46.62%`。

## 6.6 ScheduleBoard Optimize Error Alert Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 `requesting-code-review` 意图执行 scoped self-review fallback，未声称外部 reviewer 已完成。
- 审查范围：本轮可归因生产改动限定为 `ScheduleBoard.vue` 的 `.error-banner` 增加 `role="alert"` / `aria-live="assertive"`；`schedule-board.test.ts` 覆盖优化接口失败后的真实 `handleOptimize()` 告警路径；五份当天文档记录覆盖率路由与发布 B 轨拆分。
- CRITICAL/HIGH：未发现。
- MEDIUM：`schedule-board.test.ts` 依赖多个 stub 来隔离排产大组件，能证明优化失败横幅语义，但不能替代更真实的排产事件队列、采纳、拖拽保存和后端证据链集成测试。
- 发布判断：本片只推进质量打磨 A 轨；hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍属发布 B 轨缺证，不能据此标记大 goal complete。

## 6.6 ProductionBoard Scan Miss Alert 复核

- `ProductionBoard.vue` 是 `/production` 生产报工入口，覆盖率为 `0.00%`；扫码未命中是现场用户进入工单/工序前的高频失败路径。
- 修复后错误通知具备 `role="alert"` 和 `aria-live="assertive"`，成功通知具备 `role="status"` 和 `aria-live="polite"`，让不同严重度反馈符合辅助技术播报预期。
- 测试覆盖真实组件挂载路径：mock 工单列表为空、扫码接口失败，输入 `WO-MISSING` 后点击查询，断言错误通知是 alert 并包含未命中文案。
- 风险：测试 stub 了生产执行 trace、资质面板和证据链读写边界；当前只能证明扫码未命中通知语义，不能替代开工/完工/异常上报的集成覆盖。
- 验证：目标测试红绿已确认，ProductionBoard 测试 `1/1 passed`；相邻组合 `15/15 passed`；coverage `48 files / 222 tests passed`，总行/语句覆盖率 `39.58%`，`ProductionBoard.vue` 行覆盖 `52.36%`；full unit `48 files / 222 tests passed`；lint 通过。

## 6.6 ProductionBoard Scan Miss Alert Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 `requesting-code-review` 意图执行 scoped self-review fallback，未声称外部 reviewer 已完成。
- 审查范围：本轮可归因生产改动限定为 `ProductionBoard.vue` 通知节点增加错误 `alert/assertive` 与成功 `status/polite` 语义；`production-board.test.ts` 覆盖扫码未命中通知播报路径；五份当天文档补齐验证证据和发布 B 轨缺口。
- CRITICAL/HIGH：未发现。
- MEDIUM：`production-board.test.ts` stub 了生产执行 trace、开工资质面板、扫码证据链和 OTD 证据链边界，能证明扫码未命中通知语义，但不能替代开工资质阻断、完工回写、异常上报和 OTD 证据链的真实路径测试。
- 发布判断：本片只推进质量打磨 A 轨；hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍属发布 B 轨缺证，不能据此标记大 goal complete。

## 6.6 ProductionBoard Start Block Reason 复核

- 开工前资质阻断会禁用“确认开工”，但禁用按钮如果没有说明关联，屏幕阅读器用户只能感知按钮不可用，无法直接获知阻断原因。
- 修复后阻断态开工对话框会渲染稳定 `#start-qualification-block-reason`，确认按钮通过 `aria-describedby` 指向它，说明来源优先使用 `qualificationBlockReason`，没有时回退到完整 note。
- 测试覆盖真实组件路径：mock 热处理工单、mock `readLaborQualificationBlockForOperation()` 返回未闭环阻断，打开开工对话框后断言确认按钮禁用并关联阻断原因。
- 风险：当前只覆盖阻断态禁用说明；仍未覆盖替班放行后的确认开工证据写入、完工回写、异常上报和 OTD 证据链端到端路径。
- 验证：目标测试红绿已确认，ProductionBoard 测试 `2/2 passed`；相邻组合 `16/16 passed`；full unit `48 files / 223 tests passed`；coverage `48 files / 223 tests passed`，总行/语句覆盖率 `39.88%`，`ProductionBoard.vue` 行覆盖 `58.74%`；lint 通过。

## 6.6 ProductionBoard Start Block Reason Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 `requesting-code-review` 意图执行 scoped self-review fallback，未声称外部 reviewer 已完成。
- 审查范围：本轮可归因生产改动限定为 `ProductionBoard.vue` 开工对话框阻断说明与按钮 `aria-describedby` 关联；`production-board.test.ts` 新增热处理资质阻断测试；五份当天文档补齐验证证据。
- CRITICAL/HIGH：未发现。
- MEDIUM：测试仍通过 stub 隔离资质阻断来源和生产证据链，只证明开工阻断说明关联；不能替代替班放行、确认开工写证据、完工回写、异常上报和 OTD 复盘的端到端覆盖。
- 发布判断：本片只推进质量打磨 A 轨；hosted CI、PostgreSQL/staging、首次灰度、安全签字、2 周无 P0/P1 观察窗口仍属发布 B 轨缺证，不能据此标记大 goal complete。

## B 轨 Hosted CI Root Workflow 复核

- 根因：`v1` 是当前 git 仓库根和远端推送边界，仓库外层 `.github/workflows` 不能证明 `origin` 上会有 hosted CI；前序 H20 测试把计划根当作 CI 生效根，证据模型偏弱。
- 修复后：仓库根 `.github/workflows/ci.yml` 包含 backend、frontend、container、security 四个 job，且路径按当前仓库根书写；仓库根 `.github/workflows/eval.yml` 覆盖 agent evaluation gate。
- 测试覆盖：H20 架构门现在读取仓库根 `.github/workflows/ci.yml`；前端 `frontend-ci-coverage.test.ts` 也读取仓库根 workflow，避免再次只验证仓库外层文件。
- CRITICAL/HIGH：未发现新的配置缺口。
- MEDIUM：本地无法证明 GitHub/Tencent hosted runner 已执行，Docker build、NuGet/npm audit、Integration job 和 evaluation gate 仍需远端 run 结果作为发布证据。
- 发布判断：hosted CI 配置缺口已推进到“仓库内可触发”；B 轨仍需远端 hosted run URL / run id 才能视为通过。

## B 轨 Hosted CI Root Workflow Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 `requesting-code-review` 意图执行 scoped self-review fallback，未声称外部 reviewer 已完成。
- 审查范围：仓库根 `.github/workflows/ci.yml` / `.github/workflows/eval.yml`，H20 架构门仓库根路径修正，`frontend-ci-coverage.test.ts` 仓库根路径修正，当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：仓库外层 `C:\AIWorks\AIMes\.github\workflows` 仍存在，容易在人工阅读时混淆；但自动测试现在只信当前 git 仓库根 `.github/workflows/ci.yml`。后续应在计划根文档里明确外层 workflow 非权威，或把外层目录转为只读参考/删除，避免再次被当作 hosted CI 证据。
- MEDIUM：本地测试只能证明 workflow 文件存在且关键命令齐全，不能证明 hosted runner 已执行。必须触发远端 run 并记录 run URL / run id / job 摘要后，才能把 hosted CI 闸门从 B 轨缺证列表移除。
- MEDIUM：当前环境没有 GitHub CLI 登录态，且 `origin` 的 `git ls-remote` 返回 project not found；这说明 hosted runner run 证据需要远端权限或 CI 平台访问，不能由本地继续闭环。
- 发布判断：本片修复“CI 配置不在 git 根”的结构性缺口，但不等同于 hosted CI 已通过；大 goal 仍不能 complete。

## B 轨 PostgreSQL/Staging Runbook Policy 复核

- 根因：runbook 同时保留了旧 `db/init.sql` 目录树和“API 启动自动迁移”的 Docker 说明，和 Sprint 0 已定的 Production 显式迁移 + 启动校验策略冲突。
- 修复后：`_docs/SOP.md` 不再把 `init.sql` 当作现役 schema 文件，启动性能表不再暗示 API 包含 EF 迁移；`db/README.md` 的 Docker 步骤明确先启动依赖、执行 `dotnet ef database update`、再启动 API，pending migration 时 API 拒绝启动。
- 测试覆盖：`ReleaseRunbooks_ShouldRequireExplicitProductionMigrationAndAvoidLegacyInitSql` 固化了不得在 SOP 引用现役 `init.sql`、不得暗示自动 `MigrateAsync`、必须保留显式迁移和 pending migration 策略说明。
- CRITICAL/HIGH：未发现。
- MEDIUM：`db/README.md` 仍保留“旧 init.sql 已删除/替代”的历史说明，这是刻意说明迁移来源，测试也只禁止 SOP 把它列为现役文件；若后续人工阅读仍混淆，可再把历史说明移到 ADR。
- 发布判断：runbook 策略一致性已恢复，但真实 PostgreSQL/staging 执行证据仍缺；必须补 staging run 日志、连接串脱敏摘要、迁移输出和健康检查结果后，才能关闭该 B 轨闸门。

## B 轨 PostgreSQL/Staging Runbook Policy Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 `requesting-code-review` 意图执行 scoped self-review fallback，未声称外部 reviewer 已完成。
- 审查范围：`_docs/SOP.md`、`db/README.md`、`ArchitectureRuleTests.cs` 中的 release runbook policy 测试，以及当天五份文档追加记录。
- CRITICAL/HIGH：未发现。
- MEDIUM：本地测试只能证明文档策略不再自相矛盾，不能证明 PostgreSQL/staging 环境已按该 runbook 实跑；需要把实跑证据作为独立发布工单继续追踪。
- MEDIUM：SOP 当前已经包含较多历史增量，后续若继续堆 B 轨证据，建议抽出 staging rehearsal checklist，避免生产 SOP 变成混合审计日志。
- 发布判断：大 goal 仍不能 complete；B 轨还缺 hosted CI run URL/run id、真实 PostgreSQL/staging 实跑、首次灰度、安全签字、2 周无 P0/P1 观察窗口。

## B 轨 PostgreSQL/Staging Rehearsal Evidence Script 复核

- 目的：把 staging 闸门从“文档要求”推进到“可执行证据采集脚本”，让有 Docker 的环境能一次性产出迁移、API 启动和健康检查报告。
- 修复后：`scripts/run-staging-rehearsal.ps1` 会记录 Docker 版本、外部依赖启动、显式 EF migration、API 启动、`/live`、`/ready`，并写入 `_docs/_reports`。
- 测试覆盖：`StagingRehearsal_ShouldHaveExecutableEvidenceScript` 固化脚本必须包含依赖启动、`dotnet ef database update`、API 启动、健康检查、报告目录和关键环境变量 token。
- CRITICAL/HIGH：未发现。
- MEDIUM：架构测试只证明脚本结构存在，不能模拟 Docker/EF/API 全链路；真实 PASS 仍需要具备 Docker 的 staging 或类 staging 环境执行。
- MEDIUM：当前本机实跑报告 `_docs/_reports/staging-rehearsal-20260601-local.md` 为 `FAIL`，失败原因是 `docker` 命令不存在；这是环境缺口，不是 staging 通过证据。
- 发布判断：该脚本降低了后续取证摩擦，但 PostgreSQL/staging 闸门仍缺 PASS 证据，不能标记大 goal complete。

## B 轨 PostgreSQL/Staging Rehearsal Evidence Script Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 `requesting-code-review` 意图执行 scoped self-review fallback，未声称外部 reviewer 已完成。
- 审查范围：`scripts/run-staging-rehearsal.ps1`、`ArchitectureRuleTests.cs` 的 staging rehearsal 架构门、`_docs/_reports/staging-rehearsal-20260601-local.md` 和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：脚本默认使用 `Host=localhost` 执行 EF migration、容器 API 使用 `Host=postgresql`，符合从宿主机迁移再容器启动的本地 compose 模式；如果远端 staging 不在宿主机跑 EF，需要传入环境连接串或扩展参数。
- MEDIUM：脚本当前不自动清理 Docker compose 资源，避免误删人工正在观察的 staging 容器；后续可以增加显式 `-Cleanup` 开关，但不应默认销毁证据现场。
- 发布判断：当前只有失败报告，证明本机缺 Docker；仍需在可运行 Docker 的环境拿到 PASS 报告并附 run 时间戳。

## B 轨 Security Self-Assessment High/Critical 复核

- 根因：安全自评脚本把中文 clean 输出误判为 NuGet 漏洞，并使用 Windows PowerShell 不兼容的 `String.Contains(value, StringComparison)`；脚本修复后，npm audit 暴露真实 `nuxt 3.11.2` high/critical 漏洞链。
- 修复后：NuGet 通过 central transitive pinning、`System.IO.Packaging 8.0.1` 和 `RabbitMQ.Client 7.2.0` 清掉 high；npm 通过 `nuxt 3.21.6`、移除旧 `nuxi/nitropack` override、`js-beautify -> glob ^10.5.0` 清掉 high/critical。
- 测试覆盖：`SecuritySelfAssessment_ShouldFailLoudOnVulnerablePackageOutput` 固化中文 clean 输出和 Windows PowerShell 兼容性；`SecuritySignoff_ShouldHaveSelfAssessmentScriptAndUnsignedPacket` 固化签字包不能被自动签掉。
- CRITICAL/HIGH：自动 audit 阈值下未发现剩余 high/critical。`dotnet list ... --vulnerable --include-transitive` 无漏洞；`npm audit --audit-level=high` exit `0`；安全自评报告 `Result: PASS`。
- MEDIUM：npm audit 仍报告 5 个 moderate，集中在 Vitest/Vite/esbuild 链，官方修复建议需要 major 版本升级；当前 high 阈值脚本不会阻断，但发布前应由 owner 决定升级、风险接受或调整阈值。
- MEDIUM：`npm run build` 通过，但仍有 chunk size warning 和上游 `@vue/shared` trailing slash export deprecation warning；这些不是本片 high/critical 阻断，但应保留在前端/DX 或性能轨道。
- 发布判断：自动安全自评已从 FAIL 推进到 PASS；安全签字闸门仍未关闭，因为 `_docs/_review/20260601-security-signoff.md` 仍为 `Status: UNSIGNED`，Attack Chain A/B/C 需要人工验证和签字。

## B 轨 Security Self-Assessment High/Critical Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查本轮安全自评和依赖升级，未声称外部 reviewer 已完成。
- 审查范围：`scripts/run-security-self-assessment.ps1`、`Directory.Build.props`、`Directory.Packages.props`、`src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`、`src/frontend/package.json`、`src/frontend/package-lock.json`、`_docs/_review/20260601-security-signoff.md` 和本轮报告。
- CRITICAL/HIGH：未发现新的可归因缺陷。`npm ls glob nuxt` 退出 `0`，确认 override 没有留下 invalid dependency tree。
- MEDIUM：`npm install` 首次完整安装曾超时，但随后 `npm install --ignore-scripts` 和 audit/test/lint/build 均通过；当前证据足以证明 lockfile/installed tree 可用，但 CI 仍需重新跑 hosted runner。
- MEDIUM：安全签字 packet 的自动证据从 pending 更新为 dated report，但 signer/decision 必须由 human 更新；自动脚本不能替代签字动作。
- 发布判断：大 goal 仍不能 complete；B 轨至少还缺 hosted CI run URL/run id、真实 PostgreSQL/staging PASS、首次灰度、安全签字、2 周无 P0/P1 观察窗口。

## B 轨 Gray Observation Evidence Gate 复核

- 根因：已有文档说明首次灰度和 2 周无 P0/P1 是 v1.0.0 发布硬门，但没有像 staging/security 一样的可复跑证据入口，容易被其他绿色检查掩盖。
- 修复后：`scripts/run-gray-observation.ps1` 把灰度观察拆为 `NOT_STARTED` / `OBSERVING` / `PASS`，并要求 PASS 至少 14 天、P0/P1 为 0、附证据链接。
- 当前报告：`_docs/_reports/gray-observation-20260601.md` 为 `Status: NOT_STARTED` / `Result: FAIL`，明确不能关闭 v1.0.0 release gate。
- 测试覆盖：`GrayObservationGate_ShouldHaveEvidencePacketAndFailLoudUntilObservationCompletes` 固化脚本和报告必须存在，并保留 `P0/P1`、`14`、`Result: FAIL` 等关键 token。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：脚本只能校验传入字段和时间跨度，不能自动查询真实 incident 系统；`PASS` 时 `Evidence` 必须填写外部 incident 查询、灰度变更单或监控链接。
- 发布判断：该切片只让灰度/观察闸门可见且可复跑；当前状态仍是失败，不能标记大 goal complete。

## B 轨 Gray Observation Evidence Gate Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查灰度观察脚本、报告和架构门，未声称外部 reviewer 已完成。
- 审查范围：`scripts/run-gray-observation.ps1`、`_docs/_reports/gray-observation-20260601.md`、`ArchitectureRuleTests.cs` 的灰度观察门，以及当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`P0IncidentCount` / `P1IncidentCount` 默认 `-1`，用于区分“未查询”与“0 起”；后续真实 PASS 必须显式传 0，不能省略。
- MEDIUM：`ObservationStartedAt` / `ObservationEndedAt` 解析依赖标准时间戳；建议后续证据统一用 ISO 8601，避免本地化日期歧义。
- 发布判断：B 轨剩余缺口仍包括 hosted CI run URL/run id、真实 PostgreSQL/staging PASS、灰度 PASS 观察报告、安全签字。

## B 轨 Hosted CI Remote Run Evidence Gate 复核

- 根因：H20 已经把 workflow 配置放回当前 git 仓库根，但本地文件存在不能证明 hosted runner 实跑；发布闸门仍缺 run URL/run id。
- 修复后：`scripts/run-hosted-ci-evidence.ps1` 会检查仓库根 `ci.yml` / `eval.yml`，采集 `git ls-remote` 与 `gh run list` 输出，并要求 `RunUrl` / `RunId` 才能 PASS。
- 当前报告：`_docs/_reports/hosted-ci-20260601.md` 为 `Status: MISSING_REMOTE_RUN` / `Result: FAIL`，明确不能关闭 hosted CI release gate。
- 测试覆盖：`HostedCiRunGate_ShouldHaveEvidenceScriptAndFailLoudWithoutRemoteRun` 固化脚本和报告必须存在，并保留 `RunUrl`、`RunId`、`gh run`、`git ls-remote` 和 workflow 路径等关键 token。
- CRITICAL/HIGH：未发现新的配置缺口。
- MEDIUM：脚本无法替代远端平台权限；没有 `RunUrl` / `RunId` 时必须 FAIL。当前环境仍需由有权限的 CI 平台补证。
- 发布判断：该切片只让 hosted CI 远端 run 缺口可见且可复跑；当前状态仍是失败，不能标记大 goal complete。

## B 轨 Hosted CI Remote Run Evidence Gate Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 hosted CI 证据脚本、报告和架构门，未声称外部 reviewer 已完成。
- 审查范围：`scripts/run-hosted-ci-evidence.ps1`、`_docs/_reports/hosted-ci-20260601.md`、`ArchitectureRuleTests.cs` 的 hosted CI run gate，以及当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`gh run list` 只作为本地诊断输出；真正 PASS 仍要求显式传入 run URL/run id，避免脚本从无权限环境误推断成功。
- MEDIUM：`git ls-remote` 失败会记录到报告，但不是独立 PASS 条件；远端 CI 证据以 hosted platform run URL/run id 为准。
- 发布判断：B 轨剩余缺口仍包括 hosted CI PASS 报告、真实 PostgreSQL/staging PASS、灰度 PASS 观察报告、安全签字。

## B 轨 Attack Chain Manual Verification Gate 复核

- 根因：安全签字包已保持 `UNSIGNED`，但缺少可复跑证据入口来证明 Attack Chain A/B/C 的手工验证是否完成，容易让自动安全自评 PASS 掩盖人工验证缺口。
- 修复后：`scripts/run-attack-chain-verification.ps1` 要求 verifier、verified timestamp、Attack Chain A/B/C 全部 `PASS`，并分别填写 evidence；缺任一项都会生成 `PENDING_MANUAL_VERIFICATION` / `Result: FAIL`。
- 当前报告：`_docs/_reports/attack-chain-verification-20260601.md` 为 `Status: PENDING_MANUAL_VERIFICATION` / `Result: FAIL`，明确不能关闭 security signoff release gate。
- 测试覆盖：`AttackChainManualVerification_ShouldHaveEvidenceScriptAndFailLoudUntilVerified` 固化脚本和报告必须存在，并保留 Attack Chain A/B/C、Verifier、VerifiedAt、Evidence、`Result: FAIL` 等关键 token。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：脚本只能校验手工验证字段和证据引用是否齐备，不能替代真正的攻击链验证；PASS 证据必须由 human verifier 基于外部请求样例、日志/审计 payload 和配置复核填写。
- 发布判断：该切片只让安全签字人工验证缺口可见且可复跑；当前状态仍是失败，不能标记大 goal complete。

## B 轨 Attack Chain Manual Verification Gate Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 Attack Chain 手工验证脚本、报告和架构门，未声称外部 reviewer 已完成。
- 审查范围：`scripts/run-attack-chain-verification.ps1`、`_docs/_reports/attack-chain-verification-20260601.md`、`_docs/_review/20260601-security-signoff.md`、`ArchitectureRuleTests.cs` 的 Attack Chain manual verification gate，以及当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`VerifiedAt` 当前只要求非空字符串，不解析时间格式；后续真实 PASS 建议统一用 ISO 8601，避免签字包里出现本地化日期歧义。
- MEDIUM：三条 evidence 当前可以是文档路径或外部链接；发布审计时应确保 evidence 可由 reviewer 访问，而不是仅写内部口头说明。
- 发布判断：B 轨剩余缺口仍包括 hosted CI PASS 报告、真实 PostgreSQL/staging PASS、灰度 PASS 观察报告、安全签字。

## 6.6 AdminBoard Tabs A11y 复核

- 根因：系统管理页分区切换只靠视觉 active 样式表达当前分区，没有给辅助技术暴露互斥 tab 结构和选中状态。
- 修复后：`AdminBoard.vue` 的 `.tabs` 暴露为 `role="tablist"`，六个分区按钮暴露为 `role="tab"`，并通过 `aria-selected` 跟随 `tab` 状态变化。
- 测试覆盖：`admin-board.test.ts` 固化六个分区文本、首个分区默认选中，以及切换到“系统配置”后 `aria-selected` 变更。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：`AdminBoard.vue` 在本轮前已有较多未提交变更，本片只新增 tab 语义；最终合入前需要按完整 diff 再审一次既有改动。
- MEDIUM：全量 `npm run lint` 首次执行曾工具超时；分段 lint 与最终 full lint 后续均通过，当前不再是阻断，但若再次出现应检查当时 Node/ESLint 进程状态。
- 发布判断：A 轨覆盖率从 `39.88%` 提升到 `44.31%`，但这不关闭 hosted CI、staging、灰度、安全签字等 B 轨发布闸门。

## 6.6 AdminBoard Tabs A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 AdminBoard tab 语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/admin/AdminBoard.vue` 的分区切换语义、`src/frontend/tests/unit/admin-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：测试当前只验证鼠标点击后的选中状态，不覆盖键盘方向键 roving tabindex；这是后续 a11y 深化点，不应阻塞本片。
- MEDIUM：AdminBoard 行覆盖率因挂载大模板快速提升到 `84.70%`，但函数覆盖率仍只有 `1.88%`；后续仍需覆盖用户创建/禁用、配置保存、通知开关和治理动作。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 ScheduleBoard Task Detail Loading State 复核

- 根因：任务点击会先用 `openDemoTaskExplanation(task)` 打开详情并显示本地解释/演示工单，再异步请求真实工单；但请求 pending 期间没有把 `detailLoading` 置为 true，导致详情面板无法表达“真实工单详情仍在加载”。
- 修复后：`handleTaskClick()` 在打开任务解释后立即进入加载态，后端成功时用真实工单覆盖演示工单，失败时保留演示工单并在 `finally` 关闭加载态。
- 测试覆盖：`schedule-board.test.ts` 新增 `OrderDetailPanelProbe`，让 `GanttChart` stub 发出 `task-click`，并让 `getWorkOrderById` 保持 pending；断言详情面板已打开、loading 为 true，且任务级解释仍指向 `WO-001`。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试刻意让请求 pending，只覆盖加载中状态；后端成功覆盖真实工单、失败 fallback 到演示工单仍可按业务风险单独补断言。
- MEDIUM：`ScheduleBoard.vue` 行覆盖提升到 `50.25%`，但排产台仍有大量 Agent 事件、风险联动、拖拽保存、A/B 报告读取和采纳反馈分支未覆盖。
- 发布判断：A 轨覆盖率达到 `77.86%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 ScheduleBoard Task Detail Loading State Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 ScheduleBoard 任务详情 loading 状态、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/schedule/ScheduleBoard.vue` 的 `handleTaskClick()` 加载态设置、`src/frontend/tests/unit/schedule-board.test.ts` 的任务点击详情用例、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`ScheduleBoard.vue` scoped diff 中存在本轮前已有调度台 hero、backend-first 读取和错误处理改动；本次 review 只认 `detailLoading.value = true` 与对应测试。
- MEDIUM：如果后续产品希望“先显示旧详情直到新详情返回”，需要重新定义 UX；当前行为与既有 `openDemoTaskExplanation()` 立即打开解释面板一致。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 AuditDecisionReplayPanel Config Approval List A11y 复核

- 根因：关键配置变更审批区域使用普通 `div` 行展示审批项；屏幕阅读器用户无法把它识别为审批清单，也无法从单行语义中快速确认标题、状态和责任人。
- 修复后：审批区域暴露为 `role="list"` / `aria-label="关键配置变更审批"`，每个审批项暴露为 `role="listitem"`，并用动态 `aria-label` 串联审批标题、状态和责任人。
- 测试覆盖：`audit-decision-replay-panel.test.ts` mock 一条 pending 配置审批，断言审批 lane 的列表语义、审批行的 listitem 语义和待审批计数 `1 个配置待审批`。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试中的 `approvalStatusLabel` mock 直接返回状态枚举，因此 label 断言为 `pending`；真实 UI 会显示中文状态标签，语义补强路径一致。
- MEDIUM：本片只覆盖审批清单可访问语义；审批按钮实际处理仍在 AdminBoard，审计回放面板目前不提供 approve/reject 动作。
- 发布判断：A 轨覆盖率达到 `77.95%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 AuditDecisionReplayPanel Config Approval List A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 AuditDecisionReplayPanel 审批列表语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue` 的 `.approval-lane` / `.approval-row` 语义、`src/frontend/tests/unit/audit-decision-replay-panel.test.ts` 的 pending 审批用例、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`AuditDecisionReplayPanel.vue` scoped diff 中存在本轮前已有大量审计回放/backend-first 改动；本次 review 只认审批列表语义和对应测试。
- MEDIUM：如果后续审批项增加可执行按钮，应给通过/驳回按钮补业务对象 label，并验证键盘顺序。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 InventoryBoard List Selection A11y 复核

- 根因：库存物料列表项是可点击 `div`，只靠鼠标点击和视觉 active 状态表达选择；键盘用户无法聚焦物料，屏幕阅读器用户也无法获知当前详情对应哪条物料。
- 修复后：物料列表暴露为 `listbox`，每条物料暴露为可聚焦 `option`，并通过动态 `aria-selected` 表达当前详情选中项；Enter/Space 与点击走同一个 `selectItem(item)` 路径。
- 测试覆盖：`inventory-board.test.ts` mock 库存 dashboard、两条物料列表和交易记录，挂载 InventoryBoard 后断言列表语义、第二条物料默认未选中、Enter 选择第二条后读取 `MAT-B02` 交易记录并更新选中态。
- CRITICAL/HIGH：未发现。
- MEDIUM：当前使用 `div role="option"` 是最小风险改动以保留既有卡片布局；如果后续要实现完整 listbox 键盘模式，可再补上下箭头 roving tabindex。
- MEDIUM：测试覆盖 Enter 选择，不单独断言 Space；模板两者绑定同一路径，后续如改键盘处理应补 Space 回归测试。
- MEDIUM：`InventoryBoard.vue` 行覆盖打开到 `85.32%`，但入库/出库/调拨/盘点弹窗、交易失败、导出和齐套闭环集成路径仍需后续独立覆盖。
- 发布判断：A 轨本片改善库存入口可达性，不能替代 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察证据。

## 6.6 InventoryBoard List Selection A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 InventoryBoard 物料列表语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/inventory/InventoryBoard.vue` 的 `.list-items` / `.list-item` 语义与键盘入口、`src/frontend/tests/unit/inventory-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：当前 diff 还包含 `confirmDialog()` 错误处理使用 `unknown` + `errorMessage()` 的类型卫生改动；这和本片 a11y 主测试不完全同轴，但属于收窄 `any` 的低风险既有工作树改动，未回滚。
- MEDIUM：`KittingClosurePanel` 被 stub 掉以聚焦 InventoryBoard 自身列表选择；齐套闭环已有独立组件测试，后续如要验证库存页与齐套闭环页面级集成，可增加非 stub 冒烟测试。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 ScannerBoard Camera Placeholder A11y 复核

- 根因：摄像头占位区提示“点击开启摄像头扫描”，但 DOM 中只是可点击 `div`；键盘用户无法聚焦该入口，也无法用 Enter/Space 开启摄像头。
- 修复后：占位区暴露为 `role="button"`，提供 `aria-label="开启摄像头扫描"`，并通过点击、Enter、Space 走同一个 `scannerActive = true` 启动路径。
- 测试覆盖：`scanner-board.test.ts` mock `Html5Qrcode`、router、http 和扫码证据读取，挂载 ScannerBoard 后断言占位区语义、键盘焦点、可访问名称，并通过 Enter 触发 `Html5Qrcode.start()`。
- CRITICAL/HIGH：未发现。
- MEDIUM：测试当前只覆盖 Enter 键触发，不单独断言 Space；模板两者绑定同一路径，后续如改键盘处理应补 Space 回归测试。
- MEDIUM：`Html5Qrcode` 被 mock 以避免真实摄像头依赖；本片能证明组件启动路径被触发，不能替代浏览器设备权限、摄像头可用性或扫码识别准确率的端到端验证。
- MEDIUM：`ScannerBoard.vue` 行覆盖打开到 `63.08%`，但手动输入失败、上下文跳转、证据链确认、扫码历史重放和摄像头启动失败仍需后续独立覆盖。
- 发布判断：A 轨本片改善现场扫码入口可达性，不能替代 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察证据。

## 6.6 ScannerBoard Camera Placeholder A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 ScannerBoard 摄像头占位区语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/scanner/ScannerBoard.vue` 的 `.scanner-placeholder` 语义与键盘入口、`src/frontend/tests/unit/scanner-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：测试 mock `readBarcodeScanEvidenceRecordsBackendFirst()` 返回空数组以聚焦扫描入口；扫码证据持久化和 OTD 镜像仍由 `barcode-scan-evidence-sync.test.ts` 覆盖，不在组件单测里重复验证全部存储细节。
- MEDIUM：占位区仍使用 `div role="button"` 保留现有布局；后续如允许结构调整，可评估原生 `button` 以获得默认键盘行为和禁用语义。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 EmployeeBoard Card Keyboard A11y 复核

- 根因：员工卡片是可点击 `div`，只靠鼠标点击和视觉卡片表达可进入详情；键盘用户无法聚焦员工卡片，屏幕阅读器用户也无法直接知道当前卡片对应哪名员工。
- 修复后：员工卡片暴露为 `role="button"`，提供员工级 `aria-label`，并通过点击、Enter、Space 走同一个 `openEdit(e)` 详情路径。
- 测试覆盖：`employee-board.test.ts` mock 员工 API、导出工具并 stub `SkillMatrixPanel`，挂载 EmployeeBoard 后断言两张员工卡渲染、首卡语义/可访问名称正确，并通过 Enter 打开员工详情弹窗。
- CRITICAL/HIGH：未发现。
- MEDIUM：当前使用 `div role="button"` 是最小风险改动以保留现有卡片布局；后续如允许结构调整，可评估原生 button 或 card 内独立详情按钮。
- MEDIUM：测试覆盖 Enter 打开详情，不单独断言 Space；模板两者绑定同一路径，后续如改键盘处理应补 Space 回归测试。
- MEDIUM：`EmployeeBoard.vue` 行覆盖打开到 `76.58%`，但员工新增、编辑保存、离职、过滤组合、分页和导出仍需后续独立覆盖。
- 发布判断：A 轨本片改善人员管理入口可达性，不能替代 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察证据。

## 6.6 EmployeeBoard Card Keyboard A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 EmployeeBoard 员工卡片语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/employee/EmployeeBoard.vue` 的 `.emp-card` 语义与键盘入口、`src/frontend/tests/unit/employee-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`SkillMatrixPanel` 被 stub 掉以聚焦 EmployeeBoard 自身卡片详情入口；资质阻断和替班写入已有独立测试，页面级集成可后续补非 stub 冒烟测试。
- MEDIUM：离职员工 label 使用 `查看离职员工详情` 分支，但本片 mock 数据只覆盖在职员工；后续若调整离职卡片行为，应补离职卡片断言。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 ReportBoard KPI Tabs A11y 复核

- 根因：OTD KPI 钻取维度已有 tab 结构，但没有 `aria-selected`，导致当前维度只以视觉 active 样式表达。
- 修复后：`ReportBoard.vue` 的 OTD KPI 维度 tab 通过 `aria-selected` 跟随 `activeOtdKpiDimension` 变化。
- 测试覆盖：`report-board.test.ts` 固化四个维度文本、默认“客户”选中，以及切换到“产线”后 `aria-selected` 变更。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：`ReportBoard.vue` 在本轮前已有较多未提交变更，本片只新增 KPI tab 选中语义；最终合入前需要按完整 diff 再审一次既有改动。
- MEDIUM：并行启动 full unit 与 coverage 曾触发 `auth.store.test.ts` 失败；单独复跑两者均通过，后续验证避免同时运行两个全量 Vitest 进程。
- 发布判断：A 轨覆盖率从 `44.31%` 提升到 `48.19%`，但这不关闭 hosted CI、staging、灰度、安全签字等 B 轨发布闸门。

## 6.6 ReportBoard KPI Tabs A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 ReportBoard KPI tab 语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/report/ReportBoard.vue` 的 OTD KPI 维度切换语义、`src/frontend/tests/unit/report-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：测试当前只覆盖维度 tab 的点击选中状态，不覆盖 KPI drilldown card 的键盘交互；后续可继续补 `aria-pressed` 或列表选中语义。
- MEDIUM：ReportBoard 行覆盖率因挂载大模板提升到 `78.98%`，函数覆盖率为 `30%`；后续仍需覆盖导出、承诺包生成、POC 签署和 evidence drilldown 路由动作。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 DashboardBoard Command Journey A11y 复核

- 根因：AI MES 指挥中心五步主线是顺序旅程，但模板里只是普通容器内的链接卡片；辅助技术无法获得“这是一个有顺序的主线列表”的结构信息。
- 修复后：`.command-grid` 暴露为 `ol[aria-label="AI MES 指挥中心主线"]`，每个步骤为 `li > router-link`，视觉卡片布局通过 `li` flex 和 link width 保持稳定。
- 测试覆盖：`dashboard-board.test.ts` 固化五步主线标题、步骤数量和 `OL` 语义，且 mock 了 Dashboard API、离线模式、证据读取和 POC Hypercare 读取，避免真实网络/SignalR 影响。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：`DashboardBoard.vue` 本轮前已有较大未提交差异，本片只复核 `ol/li` 主线语义与新单测；最终合入前仍需对该文件完整 diff 做独立审查。
- MEDIUM：单测当前覆盖主线列表语义，不覆盖点击路由后的路径变化；现有 dashboard e2e 已覆盖部分主线点击，但本片没有重新跑 e2e。
- 发布判断：A 轨覆盖率从 `48.19%` 提升到 `50.07%`，但 hosted CI、真实 PostgreSQL/staging、灰度观察、安全签字仍是 B 轨硬闸门。

## 6.6 DashboardBoard Command Journey A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 DashboardBoard 主线语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/dashboard/DashboardBoard.vue` 的 `.command-grid` 结构语义和相关样式、`src/frontend/tests/unit/dashboard-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`DashboardBoard.vue` 行覆盖率因挂载大模板提升到 `95.34%`，函数覆盖率为 `55.55%`；后续仍需覆盖 Demo 彩排写入、短缺风险同步、POC Hypercare 状态和 SignalR 更新路径。
- MEDIUM：`git diff --check` 只提示该 Vue 文件 LF 将被 Git 替换为 CRLF，没有发现空白错误；这是现有行尾规范提示，不是本片功能阻断。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 PurchaseBoard Create Dialog A11y 复核

- 根因：新建采购订单表单以视觉 modal 呈现，但 `.modal-content.wide` 没有 dialog 角色、modal 状态和标题关联。
- 修复后：新建采购单弹窗暴露为 `role="dialog"` / `aria-modal="true"`，并通过 `aria-labelledby="create-purchase-order-title"` 关联标题。
- 测试覆盖：`purchase-board.test.ts` mock 采购 API、路由 query 和所有 backend-first 读取工具，点击“+ 新建”后断言 dialog 语义、modal 状态和标题关联。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：`PurchaseBoard.vue` 本轮前已有较大未提交差异，本片只复核新建弹窗 dialog 语义和新单测；最终合入前仍需对该文件完整 diff 做独立审查。
- MEDIUM：测试当前只覆盖新建弹窗，不覆盖收货弹窗；后续应把收货 modal 同样补 `role="dialog"` 和标题关联。
- 发布判断：A 轨覆盖率从 `50.07%` 提升到 `53.60%`，但 hosted CI、真实 PostgreSQL/staging、灰度观察、安全签字仍是 B 轨硬闸门。

## 6.6 PurchaseBoard Create Dialog A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 PurchaseBoard 新建弹窗语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/purchase/PurchaseBoard.vue` 的新建采购单 modal、`src/frontend/tests/unit/purchase-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`PurchaseBoard.vue` 行覆盖率因挂载大模板提升到 `66.04%`，函数覆盖率仍只有 `10.81%`；后续仍需覆盖缺料加急、供应风险升级/锁定、收货和审计定位。
- MEDIUM：`git diff --check` 只提示该 Vue 文件 LF 将被 Git 替换为 CRLF，没有发现空白错误；这是现有行尾规范提示，不是本片功能阻断。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 AuditDecisionReplayPanel Replay Selection A11y 复核

- 根因：AI 决策回放卡片可以切换详情，但“回放决策链”按钮只靠详情区域变化和视觉上下文表达当前选择，没有给辅助技术暴露选中状态。
- 修复后：`AuditDecisionReplayPanel.vue` 的每个 `.replay-btn` 通过动态 `aria-pressed` 表达当前回放动作；默认第一条回放为 `true`，切换到第二条后前一条为 `false`、第二条为 `true`。
- 测试覆盖：`audit-decision-replay-panel.test.ts` mock 所有 backend-first 读取和审计 API，稳定落在两条 base replay items 上，断言默认选中状态、点击切换后的 `aria-pressed` 变化，以及详情标题切到 `M-AL-6061 收货后释放冻结工序 回放链`。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试当前只覆盖 base replay items 的回放按钮选中语义，不覆盖动态审计日志、OTD、知识治理、质量灰度等映射项的具体内容；后续可按业务高频映射继续补单元测试。
- MEDIUM：`AuditDecisionReplayPanel.vue` 行覆盖率从 `0.00%` 提升到 `35.86%`，但函数覆盖率仍只有 `10.52%`；后续仍需覆盖 `map*ToReplay`、backend audit payload 解析和默认选中优先级。
- 发布判断：A 轨覆盖率从 `53.60%` 提升到 `54.83%`，但 hosted CI、真实 PostgreSQL/staging、灰度观察、安全签字仍是 B 轨硬闸门。

## 6.6 AuditDecisionReplayPanel Replay Selection A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 AuditDecisionReplayPanel 回放选中语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue` 的 `.replay-btn` 选中语义、`src/frontend/tests/unit/audit-decision-replay-panel.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：当前选择 `aria-pressed` 是最小低风险修复；若后续把回放卡片升级为完整列表/tabpanel 交互，需要重新评估 `aria-controls`、焦点管理和键盘导航。
- MEDIUM：本片 mock 了大量外部同步读取以隔离组件首屏；后续针对 mapping 函数的测试应减少整组件挂载成本，避免单测变成大型集成夹层。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 QualityBoard Root Cause Dialog A11y 复核

- 根因：质量根因分析以浮动面板呈现，但 `.analysis-panel` 缺少 dialog 角色、modal 状态和标题关联；屏幕阅读器用户无法获得“当前进入根因分析面板”的结构上下文。
- 修复后：根因分析面板暴露为 `role="dialog"` / `aria-modal="true"`，并通过 `aria-labelledby="root-cause-analysis-title"` 关联 `根因分析 — <inspectionId>` 标题。
- 测试覆盖：`quality-board.test.ts` mock 质量 API、异常 API、质量返工/MRB/知识样本/OTD 读取工具，挂载 QualityBoard 后点击“根因分析”，断言 labelled dialog 语义、modal 状态和标题内容。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试当前只覆盖根因分析浮动面板语义，不覆盖关闭按钮的焦点返回、ESC 关闭或焦点陷阱；后续若把该面板升级为强 modal，应补键盘交互测试。
- MEDIUM：`QualityBoard.vue` 行覆盖率因挂载大模板提升到 `80.98%`，函数覆盖率为 `47.36%`；后续仍需覆盖返工释放、MRB 创建/关闭、知识样本沉淀和审计定位路径。
- 发布判断：A 轨覆盖率从 `54.83%` 提升到 `59.76%`，但 hosted CI、真实 PostgreSQL/staging、灰度观察、安全签字仍是 B 轨硬闸门。

## 6.6 QualityBoard Root Cause Dialog A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 QualityBoard 根因分析 dialog 语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/quality/QualityBoard.vue` 的 `.analysis-panel` 语义、`src/frontend/tests/unit/quality-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：测试为隔离 QualityBoard 首屏 mock 了三个子面板，未验证子面板内部 CAPA/MRB/返工交互；这些属于后续独立覆盖片。
- MEDIUM：根因分析按钮在结果生成后会被禁用，当前测试通过点击前触发并等待异步分析；后续如调整 disabled 策略，应保持“已分析记录能重新打开已有分析”的行为测试。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 MonitoringBoard Equipment Drawer A11y 复核

- 根因：实时监控设备卡片是可点击 `div`，缺少 button 角色、键盘焦点和键盘打开入口；详情抽屉也缺少 dialog 角色、modal 状态和标题关联。
- 修复后：`.equip-card` 暴露为 `role="button"` / `tabindex="0"`，通过 `aria-label` 标明设备详情入口，并支持 Enter/Space 打开；`.drawer-panel` 暴露为 labelled modal dialog。
- 测试覆盖：`monitoring-board.test.ts` mock SignalR、离线 demo、Hypercare 和现场态势升级读取，挂载 MonitoringBoard 后断言首个设备卡可键盘访问，Enter 打开设备详情 dialog，并验证标题关联到 `CNC-001`。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试当前覆盖 Enter 打开，不覆盖 Space 触发和关闭后焦点恢复；后续如把抽屉改成强 modal，应补焦点管理和 ESC 关闭测试。
- MEDIUM：`MonitoringBoard.vue` 行覆盖率因 demo 数据挂载提升到 `90.54%`，函数覆盖率为 `50%`；后续仍需覆盖 SignalR reconnect/onclose、现场态势同步、升级处置包和 Hypercare 卡片路径。
- 发布判断：A 轨覆盖率从 `59.76%` 提升到 `62.59%`，但 hosted CI、真实 PostgreSQL/staging、灰度观察、安全签字仍是 B 轨硬闸门。

## 6.6 MonitoringBoard Equipment Drawer A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 MonitoringBoard 设备卡片/抽屉语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/monitoring/MonitoringBoard.vue` 的 `.equip-card` 与 `.drawer-panel` 语义、`src/frontend/tests/unit/monitoring-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：设备卡仍是 `div role="button"` 而非原生 button；这是最小风险改动以保留现有卡片布局，后续若允许结构调整，可改为语义化 button 并重新验证样式。
- MEDIUM：测试通过 offline demo 模式稳定生成设备数据；真实 SignalR 数据映射和连接生命周期仍需要独立测试。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 KnowledgeGovernancePanel Review Button A11y 复核

- 根因：知识治理卡片可能同时出现多个“复核并重建索引”按钮，但按钮可访问名称不包含文档标题；辅助技术用户无法直接区分要复核哪份文档。
- 修复后：文档复核按钮通过动态 `aria-label` 暴露 `复核并重建索引：<文档标题>`，同名动作获得文档级上下文。
- 测试覆盖：`knowledge-governance-panel.test.ts` 以一条即将过期且待索引的 CNC 维护手册挂载组件，断言按钮 `aria-label` 包含文档标题，并确认点击后仍 emit 原始 `document-reviewed` payload。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试当前只覆盖文档复核动作，不覆盖质量资产再训练/灰度发布按钮的可访问名称；这些按钮仍可能需要按资产标题补上下文。
- MEDIUM：`KnowledgeGovernancePanel.vue` 行覆盖率提升到 `68.78%`，函数覆盖率仍只有 `11.11%`；后续需覆盖再训练审批、灰度发布、实验候选和 citation trace 状态。
- 发布判断：A 轨覆盖率从 `62.59%` 提升到 `63.88%`，但 hosted CI、真实 PostgreSQL/staging、灰度观察、安全签字仍是 B 轨硬闸门。

## 6.6 KnowledgeGovernancePanel Review Button A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 KnowledgeGovernancePanel 文档复核按钮语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue` 的文档复核按钮、`src/frontend/tests/unit/knowledge-governance-panel.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：测试使用 `as const` 构造最小文档，覆盖 emit payload；如类型字段扩展，应补一条包含失败索引和有效文档混合列表的测试，避免误给无需复核的文档渲染按钮。
- MEDIUM：质量资产治理按钮仍有多个同名动作（如运行校验/发布/回滚），后续应按资产标题或版本号补 `aria-label`。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 SkillMatrixPanel Qualification Block Alert A11y 复核

- 根因：人员资质临期且没有替班候选时，停工复核区域以视觉块显示，但没有 alert 语义、标题关联，也没有在初始状态直接说出“无有效替班候选”。
- 修复后：`.qualification-review` 暴露为 `role="alert"` 并通过 `aria-labelledby="qualification-review-title"` 关联当前状态标题；未生成阻断记录前，正文直接使用 `无有效替班候选：<阻断原因>`。
- 测试覆盖：`skill-matrix-panel.test.ts` 构造一名热处理资质临期员工和一名工程 reviewer，但不给任何有效替班人，断言停工复核告警语义、标题关联和阻断原因。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试当前只覆盖“无候选 -> 停工复核”首屏告警，不覆盖点击“主管确认停工复核”后的 reviewing 状态和“补证改派并重新放行”状态；后续应补状态流转测试。
- MEDIUM：`SkillMatrixPanel.vue` 行覆盖率因挂载组件提升到 `84.57%`，但函数覆盖率为 `50%`；候选评分、替班写入、阻断复核和 release 分支仍需要后续细化覆盖。
- 发布判断：A 轨覆盖率从 `63.88%` 提升到 `64.54%`，但 hosted CI、真实 PostgreSQL/staging、灰度观察、安全签字仍是 B 轨硬闸门。

## 6.6 SkillMatrixPanel Qualification Block Alert A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 SkillMatrixPanel 停工复核告警语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/employee/SkillMatrixPanel.vue` 的 `.qualification-review` 告警语义和首屏阻断文案、`src/frontend/tests/unit/skill-matrix-panel.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`role="alert"` 会让无候选阻断被即时播报；这是符合生产开工阻断风险的选择，但如果后续面板在候选存在时也显示，需要继续确保不会产生误报。
- MEDIUM：本片 mock 了 labor assignment 写入函数以避免真实 localStorage/证据链副作用；后续可用 util 层既有测试覆盖持久化语义，不应在组件单测里重复验证所有存储细节。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 DocumentUpload Drop Zone A11y 复核

- 根因：上传区文案提示“点击选择文件”，但 DOM 中只是可点击 div 覆盖透明 file input；键盘用户无法聚焦上传区，也不能用 Enter/Space 触发文件选择。
- 修复后：`.drop-zone` 暴露为 `role="button"` / `tabindex="0"`，有明确上传入口 `aria-label`，并通过点击、Enter、Space 调用 `fileInput.click()`。
- 测试覆盖：`document-upload.test.ts` mock 知识上传 API 和所有证据读取工具，stub `KnowledgeGovernancePanel`，断言上传区语义、键盘焦点、可访问名称和 Enter 触发隐藏 input。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试当前只覆盖 Enter 键触发，不覆盖 Space 键和真实文件 change 后的队列/上传流程；后续应补文件类型、大小限制、重复文件和上传失败错误文案。
- MEDIUM：上传区仍依赖透明 file input 覆盖整个 drop zone；本片保留现有结构以降低风险，若后续改成原生 button + label，需要重新验证浏览器文件选择兼容性。
- 发布判断：A 轨覆盖率从 `64.54%` 提升到 `65.52%`，但 hosted CI、真实 PostgreSQL/staging、灰度观察、安全签字仍是 B 轨硬闸门。

## 6.6 DocumentUpload Drop Zone A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 DocumentUpload 上传入口语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/knowledge/DocumentUpload.vue` 的 `.drop-zone` 键盘入口、`src/frontend/tests/unit/document-upload.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`openFilePicker()` 直接调用 `fileInput.value?.click()`，如果未来把 input 条件渲染或移动到子组件，需要同步测试空 ref 保护和聚焦策略。
- MEDIUM：本片把复杂质量知识治理子组件 stub 掉，只验证上传入口首屏；质量再训练、灰度发布和知识治理事件仍由后续独立覆盖片处理。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 RiskActionQueuePanel Card Action A11y 复核

- 根因：风险队列每张卡都有“转派/升级/关闭”三枚同名按钮，辅助技术用户无法直接知道当前按钮对应哪条风险。
- 修复后：卡片动作按钮通过动态 `aria-label` 带上风险标题，例如 `升级风险：WO-2026-0042 CNC 停机延期`，同时保持原视觉短按钮。
- 测试覆盖：`risk-action-queue-panel.test.ts` mock 生产异常、异常分流、助手执行包、SLA 复核和监控升级读取为空，稳定落到 base 风险卡片；断言首卡标题、升级按钮可访问名称、点击后状态变为“已升级”且写入 risk action trace。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试当前只覆盖“升级”按钮的可访问名称和状态写入，没有逐一断言“转派/关闭”；模板三枚按钮使用同一动态模式，后续可补参数化测试覆盖三种动作。
- MEDIUM：`RiskActionQueuePanel.vue` 行覆盖率提升到 `80.04%`，但仍需覆盖 SLA 生成/关闭、监控升级反写、助手执行包和异常分流动态数据路径。
- 发布判断：A 轨覆盖率从 `65.52%` 提升到 `67.71%`，但 hosted CI、真实 PostgreSQL/staging、灰度观察、安全签字仍是 B 轨硬闸门。

## 6.6 RiskActionQueuePanel Card Action A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 RiskActionQueuePanel 卡片动作按钮语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/risk/RiskActionQueuePanel.vue` 的 `.card-actions` 动作按钮、`src/frontend/tests/unit/risk-action-queue-panel.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：按钮文案保持短词，`aria-label` 带完整标题；如果未来增加图标按钮或批量操作，需要继续避免同名控件。
- MEDIUM：本片 mock 后端读取为空以聚焦 base 队列；动态记录合并和 backend-first 读取已由 util 测试覆盖，但组件映射路径仍需后续单测。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 BomBoard List Selection A11y 复核

- 根因：BOM 列表项是可点击 `div`，仅靠鼠标点击和视觉 active 状态表达选择；键盘用户无法聚焦条目，屏幕阅读器用户也无法获知当前 BOM 是否选中。
- 修复后：BOM 列表暴露为 `listbox`，每条 BOM 暴露为可聚焦 `option`，并通过动态 `aria-selected` 表达当前选中项；Enter/Space 与点击走同一个 `selectBom(b)` 路径。
- 测试覆盖：`bom-board.test.ts` mock BOM API、工程变更/齐套/OTD 工具读取为空，挂载 BomBoard 后断言列表语义、第二条默认未选中、Enter 选择第二条后加载 `bom-2` 详情并更新选中态。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试当前只覆盖 Enter 键选择，不覆盖 Space 键；模板两者使用同一调用模式，后续如调整键盘处理应补 Space 断言。
- MEDIUM：`BomBoard.vue` 行覆盖率因组件挂载提升到 `72.95%`，但函数覆盖率为 `31.57%`；后续仍需覆盖爆炸展开、替代料审批、ECN 批准/驳回、BOM 齐套包发布和 OTD 证据写入路径。
- 发布判断：A 轨覆盖率从 `67.71%` 提升到 `68.72%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度观察仍是 B 轨硬闸门。

## 6.6 BomBoard List Selection A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 BomBoard 列表选择语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/bom/BomBoard.vue` 的 `.list-items` / `.list-item` 语义与键盘入口、`src/frontend/tests/unit/bom-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：当前采用 `div role="option"` 是最小风险改动以保留现有布局；如果后续允许结构调整，可评估原生 button 或更完整 listbox 键盘 roving tabindex。
- MEDIUM：本片 mock 所有 backend-first 读取为空以聚焦 BOM 选择契约；BOM 与工程变更、短缺齐套、OTD 证据之间的真实写入链路仍需后续独立覆盖。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 EquipmentBoard Type Filter Regression 复核

- 根因：`filteredEquipment` 在存在 `typeFilter` 时使用 `equipmentType !== typeFilter`，导致用户选择某类型后页面排除了该类型，显示了其他设备。
- 修复后：类型筛选保留 `equipmentType === typeFilter` 的设备，`CNC` 过滤后只显示 CNC 设备，符合列表筛选的用户预期。
- 测试覆盖：`equipment-board.test.ts` mock 设备统计和两条设备列表，选择类型下拉框 `CNC` 后断言列表只剩 `CNC-001 加工中心`，不包含 `ASM-001 装配线`。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试当前只覆盖类型筛选，不覆盖状态筛选与类型筛选组合；后续如果两个筛选都要同时生效，应补组合过滤测试。
- MEDIUM：`EquipmentBoard.vue` 行覆盖率从 `0.00%` 提升到 `79.00%`，但函数覆盖率为 `20.00%`；健康 tab、维护记录、故障诊断、审计定位 fallback 和分页仍需后续覆盖。
- 发布判断：A 轨覆盖率从 `68.72%` 提升到 `69.85%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度观察仍是 B 轨硬闸门。

## 6.6 EquipmentBoard Type Filter Regression Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 EquipmentBoard 类型筛选修复、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/equipment/EquipmentBoard.vue` 的 `filteredEquipment` 计算属性、`src/frontend/tests/unit/equipment-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：类型筛选下拉没有显式 `@change` 触发重新拉取 API；当前实现是前端基于已加载页过滤，这和既有行为一致。本片只修正反向过滤条件，不扩大为服务端类型筛选。
- MEDIUM：测试 stub 了 `EquipmentScheduleImpactPanel` 以聚焦设备列表；排产影响面板已有覆盖率被父组件挂载计入，但它的真实业务契约仍应由独立测试保护。
- 发布判断：本片是 A 轨质量打磨和筛选回归修复，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 KittingClosurePanel Shortage Action A11y 复核

- 根因：三张工单卡片都有同名“生成缺料排产事件”按钮，辅助技术用户无法区分当前按钮对应哪个工单和哪项缺料。
- 修复后：按钮通过动态 `aria-label` 暴露工单号、首个缺料物料和缺口数量；`publishShortage()` 也复用同一个首个缺料 helper，避免 label 和事件实际物料来源分叉。
- 测试覆盖：`kitting-closure-panel.test.ts` mock 短缺、异常分流和 OTD 证据工具，断言首张卡按钮可访问名称包含 `WO-RUSH-9001 / M-AL-6061 缺 19件`，点击后仍写入短缺事件和 OTD 证据。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：当前测试只覆盖首个缺料工单按钮，不覆盖 warning 工单和 ready 工单的 label；模板使用同一 helper，后续可补参数化测试覆盖三种状态。
- MEDIUM：`KittingClosurePanel.vue` 行覆盖率提升到 `92.95%`，但异常分流批次隔离路径仍未覆盖；后续应测试 `publishMaterialIsolation()` 对短缺事件和 OTD 证据链的写入。
- 发布判断：A 轨覆盖率从 `69.85%` 提升到 `71.91%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度观察仍是 B 轨硬闸门。

## 6.6 KittingClosurePanel Shortage Action A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 KittingClosurePanel 齐套按钮语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/inventory/KittingClosurePanel.vue` 的缺料按钮 `aria-label`、`firstShortageItem()` / `shortageActionLabel()`、`src/frontend/tests/unit/kitting-closure-panel.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`shortageActionLabel()` 对 ready 工单返回“已齐套”，但按钮本身 disabled；该 label 仍能帮助解释禁用原因，后续若隐藏 ready 按钮则需同步调整测试。
- MEDIUM：本片 mock 读写工具以聚焦组件契约；短缺证据持久化和 backend-first fallback 仍由 `shortage-risk-sync.test.ts` 覆盖，不在组件单测里重复验证全部存储细节。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 AnomalyBoard List Selection A11y 复核

- 根因：异常记录卡片是可点击 `div`，只有鼠标点击和视觉状态；键盘用户无法聚焦异常卡片并打开详情，屏幕阅读器用户也无法获知当前详情对应哪条异常。
- 修复后：异常列表暴露为 `listbox`，每条异常暴露为可聚焦 `option`，并通过动态 `aria-selected` 表达当前详情选中项；Enter/Space 与点击走同一个 `selectAnomaly(a)` 路径。
- 测试覆盖：`anomaly-board.test.ts` mock 异常 API、生产异常 backend-first 读取和异常分流读取为空，挂载 AnomalyBoard 后断言异常卡可聚焦、默认未选中、Enter 打开详情并更新选中态。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：当前使用 `div role="option"` 是保留现有卡片布局的最小改动；如后续要实现完整 listbox 键盘模式，可再补上下箭头 roving tabindex。
- MEDIUM：测试覆盖 Enter 打开详情，不单独断言 Space；模板两者绑定同一路径，后续如改键盘处理应补 Space 回归测试。
- MEDIUM：`AnomalyBoard.vue` 行覆盖打开到 `70.91%`，但 AI 分析、事件分流、分页和 backend-first 动态事件合并仍需要后续独立覆盖。
- 发布判断：A 轨本片改善异常入口可达性，不能替代 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察证据。

## 6.6 AnomalyBoard List Selection A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 AnomalyBoard 异常列表语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/anomaly/AnomalyBoard.vue` 的 `.anomaly-list` / `.anomaly-card` 语义与键盘入口、`src/frontend/tests/unit/anomaly-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：测试 mock `writeAnomalyDispatchRecord` 为空以避免本片触发真实 localStorage/OTD 副作用；异常分流写入链路仍由 `anomaly-dispatch-sync.test.ts` 和后续组件交互测试覆盖。
- MEDIUM：详情滑出面板仍不是 labelled dialog，本片没有顺手改；如果后续要把异常详情作为 modal/drawer 语义暴露，应按 TDD 单独切片验证关闭、标题关联和焦点管理。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 RiskBoard Load Failure Alert 复核

- 根因：风险看板 API 失败时会显示 `.error-banner` 并回落到演示风险数据，但错误横幅没有 alert/live region 语义；屏幕阅读器用户可能只看到降级后的风险数据，漏掉“当前不是实时数据”的状态。
- 修复后：错误横幅暴露 `role="alert"` 和 `aria-live="assertive"`，把加载失败和演示数据 fallback 作为需要立即感知的风险状态播报。
- 测试覆盖：`risk-board.test.ts` mock `getRiskDashboard()` 抛普通错误，stub `RiskActionQueuePanel`，断言 alert 文案包含后端错误和“已加载演示数据”，同时确认 demo 工单风险已经渲染。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试 mock 了 `offline-demo-mode` 日志工具以避免输出噪声；离线演示错误识别本身已有 util 测试覆盖，本组件测试只覆盖普通 API 失败的可访问反馈。
- MEDIUM：`RiskBoard.vue` 行覆盖达到 `99.80%`，但测试主要通过失败 fallback 挂载 demo 数据获得覆盖；真实 API 成功数据的空列表、边界等级和生产风险口径仍可后续补更细的业务断言。
- 发布判断：A 轨覆盖率从 `71.84%` 提升到 `73.75%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 RiskBoard Load Failure Alert Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 RiskBoard 错误横幅语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/risk/RiskBoard.vue` 的 `.error-banner` alert/live 语义、`src/frontend/tests/unit/risk-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`RiskBoard.vue` 中 offline-demo/error-message 错误处理是本轮前既有脏改；本片没有回滚也没有扩大该逻辑，只在现有错误横幅上补语义。
- MEDIUM：`RiskActionQueuePanel` 被 stub 掉以聚焦 RiskBoard 自身加载失败状态；风险动作队列已有独立组件测试，后续如要验证页面级集成可增加非 stub 冒烟测试。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 RoutingBoard List Selection A11y 复核

- 根因：工艺路线列表项是可点击 `div`，只靠鼠标点击和视觉 active 状态表达选择；键盘用户无法聚焦路线，屏幕阅读器用户也无法获知当前详情对应哪条路线。
- 修复后：路线列表暴露为 `listbox`，每条路线暴露为可聚焦 `option`，并通过动态 `aria-selected` 表达当前详情选中项；Enter/Space 与点击走同一个 `selectRoute(r)` 路径。
- 测试覆盖：`routing-board.test.ts` mock 路线 API 和能力校验记录读取为空，挂载 RoutingBoard 后断言列表语义、第二条路线默认未选中、Enter 选择第二条后读取 `route-b` 详情并更新选中态。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：当前使用 `div role="option"` 是最小风险改动以保留既有卡片布局；如果后续要实现完整 listbox 键盘模式，可再补上下箭头 roving tabindex。
- MEDIUM：测试覆盖 Enter 选择，不单独断言 Space；模板两者绑定同一路径，后续如改键盘处理应补 Space 回归测试。
- MEDIUM：`RoutingBoard.vue` 行覆盖打开到 `85.26%`，但函数覆盖率仍为 `30%`；能力校验、分流确认、草稿路线约束和分页仍需后续独立覆盖。
- 发布判断：A 轨覆盖率从 `73.75%` 提升到 `74.47%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 RoutingBoard List Selection A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 RoutingBoard 路线列表语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/routing/RoutingBoard.vue` 的 `.list-items` / `.list-item` 语义与键盘入口、`src/frontend/tests/unit/routing-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`RoutingBoard.vue` 中 backend-first 能力校验读取和 `RoutingStep` 类型收窄是本轮前既有脏改；本片没有回滚，也没有扩大该逻辑。
- MEDIUM：测试 mock `writeRouteCapabilityValidation` 为空以避免本片触发能力校验持久化副作用；能力校验写入链路仍由 `engineering-change-sync.test.ts` 和后续组件交互测试覆盖。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 BarcodePrintBoard Label Selection A11y 复核

- 根因：标签卡片是可点击 `div`，内部虽然有 checkbox 视觉控件，但外层卡片没有 checkbox 语义、焦点入口或键盘切换；键盘和屏幕阅读器用户无法等价选择打印标签。
- 修复后：标签卡片暴露为可聚焦 `checkbox`，通过动态 `aria-checked` 表达选择状态，Enter/Space 与点击走同一个 `toggleSelect(item.id)` 路径。
- 测试覆盖：`barcode-print-board.test.ts` mock 库存标签数据和 QRCode，断言首张标签卡片语义、可访问名称、默认未选中，并通过 Enter 切换为选中。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：当前使用 `div role="checkbox"` 是最小风险改动以保留既有卡片布局；后续如果允许结构调整，可评估原生 checkbox/label 结构，减少自定义交互负担。
- MEDIUM：测试覆盖 Enter 切换，不单独断言 Space；模板两者绑定同一路径，后续如改键盘处理应补 Space 回归测试。
- MEDIUM：QRCode 被 mock，不能替代真实 canvas/打印窗口验证；`handlePrint()`、`toDataURL`、`window.open`、证据状态分支仍待后续覆盖。
- 发布判断：A 轨覆盖率达到 `75.73%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 BarcodePrintBoard Label Selection A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 BarcodePrintBoard 标签卡片语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/barcode/BarcodePrintBoard.vue` 的 `.label-card` checkbox 语义与键盘入口、`src/frontend/tests/unit/barcode-print-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：本片没有扩大到打印窗口和 QR 生成真实浏览器行为；这些路径涉及 canvas、window.open 和打印副作用，适合后续单独切片。
- MEDIUM：当前动态可访问名称使用物料编码和名称；如果后续标签类型扩展到设备/工单专用字段，应同步补更具体的 label 断言。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 AuditLogBoard Detail Action A11y 复核

- 根因：审计日志表格每行都有同名“详情”按钮，辅助技术用户无法区分当前按钮对应哪个用户、动作、资源或资源 ID。
- 修复后：详情按钮通过动态 `aria-label` 暴露审计上下文，视觉文案仍保留短按钮“详情”，点击仍走原 `openDetail(log.id)` 路径。
- 测试覆盖：`audit-log-board.test.ts` mock 两条审计日志和一条详情，断言第二行详情按钮包含 `operator1 更新 Production wo-001`，点击后调用 `getAuditLogDetail('audit-2')` 并渲染详情 JSON。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试 stub 了 `AuditDecisionReplayPanel` 以聚焦 AuditLogBoard 表格交互；决策回放面板仍由 `audit-decision-replay-panel.test.ts` 独立覆盖。
- MEDIUM：当前测试覆盖已有日志成功加载与详情打开，不覆盖 API 失败 fallback、筛选 watch、分页边界和详情接口失败分支。
- MEDIUM：`AuditLogBoard.vue` 行覆盖打开到 `91.62%`，但审计 API 模块 `auditLog.ts` 仍为 `0.00%`，后续可按接口契约单独补。
- 发布判断：A 轨覆盖率达到 `76.96%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 AuditLogBoard Detail Action A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 AuditLogBoard 详情按钮语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/auditLog/AuditLogBoard.vue` 的详情按钮动态 `aria-label`、`src/frontend/tests/unit/audit-log-board.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：详情弹窗本身仍不是 labelled dialog，本片没有顺手扩大；如果后续要完善弹窗语义，应按 TDD 单独验证标题关联、关闭按钮和焦点管理。
- MEDIUM：资源 ID 为空时 label 使用 `-`，与表格视觉展示一致；如果产品后续要求更口语化的“无资源 ID”，应同步更新视觉与测试口径。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 AuditDecisionReplayPanel Replay Button A11y 复核

- 根因：回放卡片按钮视觉文案都叫“回放决策链”，虽然 `aria-pressed` 能表达当前选择，但辅助技术用户无法区分每个按钮会打开哪条 AI 决策/证据链。
- 修复后：回放按钮通过动态 `aria-label` 暴露 replay item 标题，点击仍只更新 `selectedId`，没有改变回放数据来源或映射顺序。
- 测试覆盖：`audit-decision-replay-panel.test.ts` 在既有 `aria-pressed` 测试上新增第二个按钮的可访问名称断言，并继续验证点击后详情切换到 `M-AL-6061 收货后释放冻结工序`。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：本片只覆盖 base replay item 的按钮命名；backend-first 业务落库、质量灰度、知识治理、OTD 证据等动态 item 的映射分支仍需后续独立覆盖。
- MEDIUM：`AuditDecisionReplayPanel.vue` 行覆盖仅从 `35.86%` 到 `36.17%`，说明此大组件仍是后续 A 轨重点；下一步应优先选择能覆盖真实 backend-first 数据组合的稳定分支，而不是继续只打 UI 微断言。
- 发布判断：A 轨覆盖率保持 `76.96%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 AuditDecisionReplayPanel Replay Button A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 AuditDecisionReplayPanel 回放按钮语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue` 的 `.replay-btn` 动态 `aria-label`、`src/frontend/tests/unit/audit-decision-replay-panel.test.ts`、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：动态 label 直接使用 `item.title`，与卡片标题保持一致；如果后续标题包含冗长证据串，可能需要单独定义更短的按钮 label 策略。
- MEDIUM：测试保留大量读取 mock 为空以聚焦 base replay item；这不能替代审计回放真实数据链路测试。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 AuditDecisionReplayPanel Backend Business Write Replay 复核

- 根因：后端 Agent 业务落库回放详情里有“打开采购协同”等业务页链接，但链接可访问名称没有包含业务对象；屏幕阅读器用户无法知道会打开哪张采购单/质检单/设备。
- 修复后：`trace-link` 使用 `routeLabel` 和 `selectedItem.object` 生成动态 `aria-label`，视觉文案保持简短，路由 query 仍沿用既有业务对象定位参数。
- 测试覆盖：`audit-decision-replay-panel.test.ts` mock `AgentExecutePurchaseAction` 列表和详情，详情 `newValues` 包含 `businessWrite.resource = purchase-order`，断言默认回放为 `采购收货落库：PO-RUSH-20260519`，步骤包含真实写入内容，业务页链接暴露 `打开采购协同：PO-RUSH-20260519`。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：测试覆盖采购收货落库分支，不覆盖质量处置和设备状态落库分支；三者共用 `trace-link` label 逻辑，但业务映射内容仍应后续分别覆盖。
- MEDIUM：本片依赖当前工作树里已存在的 backend-first 业务落库映射；本轮只声明新增测试和 `trace-link` label 为本轮变更，不把既有映射实现算作本轮成果。
- MEDIUM：`AuditDecisionReplayPanel.vue` 行覆盖提升到 `39.73%`，但仍有大量质量灰度、知识治理、OTD、配置审批映射分支未覆盖。
- 发布判断：A 轨覆盖率达到 `77.08%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 AuditDecisionReplayPanel Backend Business Write Replay Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 AuditDecisionReplayPanel 后端业务落库回放测试、`trace-link` 语义和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue` 的 `.trace-link` 动态 `aria-label`、`src/frontend/tests/unit/audit-decision-replay-panel.test.ts` 的后端业务落库回放用例、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：业务对象 label 使用 `selectedItem.object`；如果某些动态 item 的 object 是组合字段而不是单一业务 ID，后续可按类型增加更精确的 route label。
- MEDIUM：测试通过 RouterLink stub 检查文本和属性，不验证真实路由导航；页面级 route query 定位仍需 E2E 或 router 集成测试补强。
- 发布判断：本片是 A 轨质量打磨和审计回放契约补强，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 ScheduleBoard Optimization Warning Status A11y 复核

- 根因：排产优化成功返回预警时，页面会显示 `.warnings-bar`，但它只是普通 `div`；辅助技术用户可能不会感知到优化后的瓶颈/冲突预警已更新。
- 修复后：预警条暴露为 `role="status"`，使用 `aria-live="polite"` 播报非错误类状态更新，并用 `aria-label="排产预警"` 给状态区域命名。
- 测试覆盖：`schedule-board.test.ts` mock `optimizeSchedule()` 返回 `warnings: ['CNC-01 瓶颈窗口冲突']`，点击优化按钮后断言状态区域语义、live 策略、名称和预警文本。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：本片只覆盖优化成功后的预警播报；`loadData()` 后端失败时写入 warnings 的演示 fallback、优化成功但 warnings 为空、以及多条 warnings 的播报体验仍可后续补测。
- MEDIUM：`ScheduleBoard.vue` 行覆盖只从 `46.62%` 提升到 `47.05%`，该组件仍有大量排产回放、风险联动、批量优化和事件队列路径未覆盖。
- 发布判断：A 轨覆盖率达到 `77.11%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 ScheduleBoard Optimization Warning Status A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 ScheduleBoard 预警状态语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/schedule/ScheduleBoard.vue` 的 `.warnings-bar` status/live/label 语义、`src/frontend/tests/unit/schedule-board.test.ts` 的优化预警用例、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`GanttToolbar` 和多数排产子面板在本组件测试中被 stub，以聚焦优化预警状态；页面级真实子组件集成仍需更高层测试覆盖。
- MEDIUM：状态区域选用 `polite` 而不是 `assertive`，因为预警来自优化成功后的非阻断状态更新；若产品将某类 warnings 升级为阻断错误，应另切 `alert` 语义测试。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 ProductionBoard Work Order List Selection A11y 复核

- 根因：生产工单列表项是可点击 `div`，只靠鼠标点击和视觉 selected 状态表达选择；键盘用户无法聚焦并选择工单，屏幕阅读器用户也无法获知当前详情对应哪张生产工单。
- 修复后：工单列表暴露为 `listbox`，每张工单卡暴露为可聚焦 `option`，动态 `aria-selected` 表达当前详情选中项；Enter/Space 与点击走同一个 `selectWorkOrder(wo)` 路径。
- 测试覆盖：`production-board.test.ts` mock 两张工单，断言第二张工单的 option 语义、焦点入口、可访问名称和默认未选中；按 Enter 后详情切换到 `WO-002` 并更新选中态。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：当前使用 `div role="option"` 是最小风险改动以保留既有卡片布局；若后续实现完整 listbox 键盘模式，可再补上下箭头 roving tabindex。
- MEDIUM：测试覆盖 Enter 选择，不单独断言 Space；模板两者绑定同一路径，后续若改键盘处理应补 Space 回归测试。
- MEDIUM：`ProductionBoard.vue` 行覆盖提升到 `59.28%`，但扫码完工、异常上报、质量门、交接冻结和真实 API 成功路径仍需后续覆盖。
- 发布判断：A 轨覆盖率达到 `77.13%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 ProductionBoard Work Order List Selection A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 ProductionBoard 工单列表语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/production/ProductionBoard.vue` 的 `.wo-list` / `.wo-card` 语义与键盘入口、`src/frontend/tests/unit/production-board.test.ts` 的工单选择用例、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：本片没有扩大到工序卡片动作按钮的动态命名；开工/完工/异常按钮仍可按业务风险后续单独补充上下文 label。
- MEDIUM：测试 mock `scanOperation` 为失败以走本地工序 fallback；真实扫描成功路径已有扫码 miss 测试的一部分覆盖，但不等同于完整生产扫码 E2E。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 DocumentUpload Rejected File Alert A11y 复核

- 根因：文件类型或大小校验失败时，页面会显示 `.error-msg`，但它只是普通 `div`；辅助技术用户可能不会即时获知文件被拒绝的原因。
- 修复后：错误消息暴露 `role="alert"` 和 `aria-live="assertive"`，把不支持格式/超大文件等阻断上传的状态作为即时错误播报。
- 测试覆盖：`document-upload.test.ts` 构造 `virus.exe` 并触发 file input change，断言错误消息以 alert 语义出现，并包含 `不支持的文件格式: virus.exe`。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：本片只覆盖不支持格式；超 50MB 文件错误共用 `.error-msg` alert 语义，但体积边界仍可后续补独立断言。
- MEDIUM：测试没有覆盖真实上传失败后的队列项错误态；`.status-err` 仍只是文本，后续如果要增强单文件上传失败播报，应单独切片。
- 发布判断：A 轨覆盖率达到 `77.16%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 DocumentUpload Rejected File Alert A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 DocumentUpload 错误消息语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/knowledge/DocumentUpload.vue` 的 `.error-msg` alert/live 语义、`src/frontend/tests/unit/document-upload.test.ts` 的拒绝文件用例、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：`KnowledgeGovernancePanel` 在本组件测试中被 stub，以聚焦上传入口；知识治理内部流程由独立 panel/sync 测试覆盖。
- MEDIUM：本片没有扩大到 uploadDocument API 成功/失败路径；那些路径涉及异步进度、history 和 governance document 注入，适合后续按业务链路单独覆盖。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 PurchaseBoard Purchase Order List Selection A11y 复核

- 根因：采购订单列表项是可点击 `div`，只靠鼠标点击和视觉 active 状态表达选择；键盘用户无法聚焦并选择采购单，屏幕阅读器用户也无法获知当前详情对应哪张订单。
- 修复后：采购订单列表暴露为 `listbox`，每张采购单暴露为可聚焦 `option`，动态 `aria-selected` 表达当前详情选中项；Enter/Space 与点击走同一个 `selectOrder(o)` 路径。
- 测试覆盖：`purchase-board.test.ts` mock 两张采购单，断言第二张采购单的 option 语义、焦点入口、可访问名称和默认未选中；按 Enter 后详情切换到 `PO-20260602` 并更新选中态。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：当前使用 `div role="option"` 是最小风险改动以保留既有卡片布局；若后续实现完整 listbox 键盘模式，可再补上下箭头 roving tabindex。
- MEDIUM：测试覆盖 Enter 选择，不单独断言 Space；模板两者绑定同一路径，后续若改键盘处理应补 Space 回归测试。
- MEDIUM：`PurchaseBoard.vue` 行覆盖提升到 `69.37%`，但创建、提交、确认、收货、取消、供应风险升级、替代供应商锁定和外协到货确认仍需后续覆盖。
- 发布判断：A 轨覆盖率达到 `77.27%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 PurchaseBoard Purchase Order List Selection A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 PurchaseBoard 采购订单列表语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/purchase/PurchaseBoard.vue` 的 `.list-items` / `.list-item` 语义与键盘入口、`src/frontend/tests/unit/purchase-board.test.ts` 的采购单选择用例、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：可访问名称包含订单号、供应商、状态和项数，足够区分列表项；如果后续列表加入金额/交期筛选，可能需要重新评估 label 是否过长。
- MEDIUM：本片没有扩大到采购动作按钮的动态命名；提交、确认、收货、取消仍可按业务风险后续单独补充上下文 label。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 ScannerBoard Manual Scan History Replay A11y 复核

- 根因：扫描历史项是可点击 `div`，鼠标用户可以重放历史扫码，但键盘用户无法聚焦重扫；屏幕阅读器用户也无法知道历史项会重新扫描哪个工单/设备/物料。
- 修复后：历史项暴露为可聚焦 `button` 语义，动态 `aria-label` 包含类型、编码和名称；Enter/Space 与点击走同一个 `handleScan(item.code)` 路径。
- 测试覆盖：`scanner-board.test.ts` mock API 失败走 demo fallback，手动输入 `WO-RUSH-9001` 后断言结果为 `急单阀体组件`，历史项可键盘聚焦并通过 Enter 重放，`httpGet` 调用次数从 1 到 2。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：历史项仍使用 `div role="button"`，是最小风险改动以保留现有布局；如果后续要更彻底，可切换为真实 `button` 并同步 CSS。
- MEDIUM：测试覆盖工单 demo fallback；设备、物料历史重放共用 `historyItemLabel` 和 `handleScan` 路径，但各自结果字段仍可按业务风险后续补测。
- MEDIUM：`ScannerBoard.vue` 行覆盖提升到 `80.55%`、函数覆盖到 `43.75%`，但真实摄像头解码、摄像头启动失败、证据确认写入和上下文跳转仍需后续覆盖。
- 发布判断：A 轨覆盖率达到 `77.41%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 ScannerBoard Manual Scan History Replay A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 ScannerBoard 历史重放语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/scanner/ScannerBoard.vue` 的 `.history-item` 语义与键盘入口、`src/frontend/tests/unit/scanner-board.test.ts` 的手动扫码历史重放用例、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：本片没有改变历史去重策略；连续重放会继续 unshift 新历史项，这是既有行为，若产品要求去重需另切。
- MEDIUM：`aria-label` 使用视觉历史项的类型/编码/名称组合，和当前 UI 一致；如果后续类型 label 国际化，应同步更新测试口径。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。

## 6.6 KnowledgeGovernancePanel Next Training Merge Action A11y 复核

- 根因：质量知识资产里的“合并现场反馈”按钮只暴露通用文案；当多个下一轮训练集候选同时出现时，辅助技术用户无法判断当前按钮会合并哪一项资产。
- 修复后：下一轮训练集合并按钮通过动态 `aria-label` 暴露 `asset.title`，点击仍只 emit `quality-next-training-merged` 和原有 feedback id。
- 测试覆盖：`knowledge-governance-panel.test.ts` 构造 `下一轮训练集` 资产，断言按钮 label 为 `合并现场反馈：R3 下一轮训练集：现场复核反馈`，点击后 emit `feedback-r3-001`。
- CRITICAL/HIGH：未发现新的实现缺口。
- MEDIUM：本片只覆盖无版本记录时的合并动作；批准、校验、灰度发布和 reopened 校验路径仍需后续独立覆盖。
- MEDIUM：`KnowledgeGovernancePanel.vue` 行覆盖提升到 `83.40%`，但函数覆盖仍只有 `17.94%`，说明质量知识治理动作链仍有不少未触发函数。
- 发布判断：A 轨覆盖率达到 `77.68%`，但 hosted CI、真实 PostgreSQL/staging、Attack Chain A/B/C、安全签字、灰度和 14 天观察仍是 B 轨硬闸门。

## 6.6 KnowledgeGovernancePanel Next Training Merge Action A11y Scoped Self-Review

- 外派状态：当前工具面板没有 Claude Code `Task` 子代理入口；已按 scoped self-review fallback 审查 KnowledgeGovernancePanel 下一轮训练集合并按钮语义、单测和验证输出，未声称外部 reviewer 已完成。
- 审查范围：`src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue` 的下一轮训练集 `.review-button` 动态 `aria-label`、`src/frontend/tests/unit/knowledge-governance-panel.test.ts` 的合并现场反馈用例、coverage 输出和当天五份文档。
- CRITICAL/HIGH：未发现。
- MEDIUM：测试直接 mount panel 并检查 emit，不覆盖 `DocumentUpload.vue` 父组件处理函数；父组件的训练集写入/刷新仍需后续按链路验证。
- MEDIUM：feedback id 由 `quality-asset-next-training-` 前缀裁剪得出，测试锁定了当前约定；若上游 id 规范变化，应同步更新 helper 和测试。
- 发布判断：本片是 A 轨质量打磨，不能替代 B 轨外部环境、人审和时间窗口证据。
