# Issue - Schedule Labor Evidence Retry

## Problem

- 排产页启动时若人员阻断/替班后端证据读取失败，只能显示 warning。
- 调度员缺少页内恢复动作，复杂操作不符合“有提示且可点击帮助/支持”的核心产品原则。

## Resolution

- 在人员约束启动证据加载失败时展示 `重试人员证据 / Retry labor evidence`。
- 点击后重新读取后端人员证据，成功则刷新约束和事件队列，失败则继续保留 fail-loud warning。

## Verification

- Unit PASS: `tests/unit/schedule-board.test.ts` 75/75.
- Related unit PASS: schedule + employee + router + login 127/127.
- Focused real-browser PASS: `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员证据启动读取失败后可重试"` 1/1.

## Follow-up Issue - Personnel E2E Fixture Auth Loop

- Focused 人员证据重试用例已通过，不再阻断。
- 已修复两个相邻旧用例：
  - `人员替班证据释放排产人员约束`
  - `人员无有效替班候选时排产保持停工复核事件`
- 根因：人员复核在 offline-demo skipped backend request 下仍 fail-loud，未读取本地人员证据；另一个用例在无 origin 文档上直接访问 `localStorage` seed 测试数据。
- 处理：offline-demo 人员复核回落本地证据，真实后端错误继续 fail-loud；测试 seed 改为 `page.addInitScript()`。
- Verification PASS: `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "人员替班证据释放排产人员约束|人员无有效替班候选时排产保持停工复核事件"` 2/2。
- Employee offline PASS: `npm run test:e2e -- tests/e2e/employee.spec.ts -g "离线演示|backend skip"` 2/2。

## Release-Candidate Boundary

- Local issue is closed for this slice.
- Dirty-worktree CI boundary remains open until the candidate files in `_docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.md` are staged, pushed, and covered by hosted CI.
- Additional boundary: current candidate code diff is too large to call review-ready without splitting or explicit owner acceptance.
- Current decomposition shows unrelated topics mixed into the same files; pushing them together would weaken review quality and violate the 1 人 + AI bandwidth constraint.
