# 2026-06-14 批量方案反馈 Warning 竞态复查

## 变更
- 按 owner 指令跳过 15 天灰度观察，继续推进排产现有功能精品化。
- 复查 `批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因` 的 `.warnings-bar` 竞态风险。
- 当前生产代码已有 `scheduleStateVersion` 保护，防止晚到的初始排产加载失败覆盖已采纳批量方案 warning。
- 本轮未改生产代码；以单测和真实 Chromium 连跑补强证据，避免在未复现根因时乱试。

## 验证
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "keeps the applied compared plan warning|announces batch objective feedback"`：2 passed。
- `npm run test:e2e -- --grep "批量方案反馈同步失败时真实浏览器保留本地目标切换并展示原因"`：1 passed。
- 同一真实 Chromium 定向用例连续 3 次运行：3/3 passed。

## 结论
- 当前工作树未复现该 `.warnings-bar` 竞态。
- 继续保留现有状态版本防护和真实浏览器断言作为回归网。
