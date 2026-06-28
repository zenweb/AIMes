# 2026-06-21 Schedule Labor Evidence Retry

- 在排产页人员约束启动证据加载失败时，预警条新增 `重试人员证据 / Retry labor evidence` 操作。
- 重试不会压掉 fail-loud 提示；点击后先清理旧的人员证据启动失败提示，再重新读取人员阻断/替班后端证据。
- 重试成功后刷新人员约束、排产事件队列和 Agent 建议上下文，让调度员无需刷新整个页面即可恢复人员替班/放行证据。
- 新增单测覆盖：首次后端读取失败、按钮出现、重试成功、旧警告清除、已放行人员替班事件恢复。

## Verification

- `npm run test:unit -- tests/unit/schedule-board.test.ts --maxWorkers=1 --no-file-parallelism`: 75/75 passed.
- `npm run test:unit:coverage -- tests/unit/schedule-board.test.ts --maxWorkers=1 --no-file-parallelism`: 75/75 passed; `ScheduleBoard.vue` line coverage in this slice is 89.13%.
- `npm run test:unit -- tests/unit/schedule-board.test.ts tests/unit/employee-board.test.ts tests/unit/router-auth.test.ts tests/unit/login-page.test.ts --maxWorkers=1 --no-file-parallelism`: 127/127 passed.

## 2026-06-21 Real Browser Attempt

- 新增 focused E2E 草案：`人员证据启动读取失败后可重试并释放排产人员约束`，目标是在真实 Chromium 中模拟首次人员证据后端读取 503、点击 `重试人员证据 / Retry labor evidence` 后读回放行证据。
- `scripts/e2e.mjs` 增加 `targetsLiveBackendMock`，让该 focused grep 使用 `VITE_OFFLINE_DEMO=false`，但保留 demo hints，避免误套真实 dhtmlx 配置。
- 已修复 focused E2E auth loop：为该 live-mock 用例补齐 `/auth/refresh`、`/llm/status`、`/dashboard`、`/risk/dashboard` 和未显式 mock 的 `/scheduling/**` JSON 边界，避免 preview HTML/401 清登录。
- Focused 真实浏览器已通过：`npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试"` 1/1 passed。
- 小范围 `-g "人员"` 结果：新 focused 通过；两个相邻旧用例仍因 employee/scheduling 默认 session mock 不完整发生 login/dashboard 循环，记录为后续 E2E fixture 稳定性问题。

## 2026-06-21 Personnel Evidence Offline Demo Hardening

- 修复排产人员事件复核链路：离线演示模式跳过 `/scheduling/labor-qualification-blocks` 或 `/scheduling/labor-reassignments` 后端请求时，改为读取本地人员阻断/替班证据继续生成排产建议。
- 真实后端非 offline-demo 错误仍保持 fail-loud，不静默吞掉生产故障。
- 修复 `人员无有效替班候选时排产保持停工复核事件` 的 E2E storage seed：改为 `page.addInitScript()`，避免在无 origin 文档上访问 `localStorage`。
- 验证通过：`npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班证据释放排产人员约束|人员无有效替班候选时排产保持停工复核事件"` 2/2 passed。
- 验证通过：`npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线演示|backend skip"` 2/2 passed，员工离线入口不再暴露 `Offline demo mode skipped backend request`。

## 2026-06-21 Release-Candidate Slice

- Added release-candidate slice packet: `_docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.md`.
- The packet scopes the dirty-worktree candidate to Schedule labor evidence retry/offline fallback files and records the local unit/e2e evidence already collected.
- Hosted CI remains unclaimed for this dirty slice until it is staged, pushed, and verified on the resulting SHA.
