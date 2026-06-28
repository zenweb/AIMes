# 2026-06-11 急单插单多方案决策包深化

## 背景

按精品化约定，本片不扩新功能，继续打磨 AI 排产里用户必经的急单插单决策链路。安全发布闸门不作为本片主线。

## 改动

- 急单插单 `加班插入`、`强插当前窗口`、`换设备插入` 三个方案补充 `适用条件` 与 `取舍代价`。
- `Agent 多方案决策包` 在排产页直接展示每个方案的适用条件和取舍代价。
- 人工采纳后的反馈快照、后端反馈 `reasonDetail`、OTD 报表证据链保留推荐方案与未选方案的适用条件和取舍代价。
- 单测改为断言 `writeScheduleFeedbackSnapshot` 与后端提交 payload，避免测试环境误读本地存储。
- e2e 收窄推荐方案选择器，避免多个方案都出现同名字段时触发 Playwright strict mode。

## 验证

- `npm run test:unit -- schedule-board.test.ts -t "persists rush-order scenario fit and tradeoff"`：passed
- `npm run test:unit -- schedule-board.test.ts`：22 passed
- `npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：1 passed

## 真实浏览器证据补强

- `AIMES_E2E_PORT=4181 npm run test:e2e -- scheduling.spec.ts -g "急单插单生成多方案决策包并进入 OTD 复盘"`：production build + real Chrome，1 passed。
- 追加截图证据：`output/playwright/20260611-schedule-rush-decision/schedule-rush-scenario-package.png`。
- 追加截图证据：`output/playwright/20260611-schedule-rush-decision/report-rush-otd-evidence.png`。
- 证据清单：`output/playwright/20260611-schedule-rush-decision/manifest.md`。
