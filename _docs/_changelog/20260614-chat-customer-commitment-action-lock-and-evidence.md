# 2026-06-14 ChatPanel 客户交付恢复承诺包动作锁定

## 变更

- 将 AI 生产助手的“生成客户交付恢复承诺包”成功态纳入 `completedActionIds` 锁定。
- 成功生成承诺包后，按钮立即禁用，避免重复写入客户承诺包、助手动作审计和跳转状态。
- 为单元测试补充重复点击保护断言，为真实 Chromium e2e 补充按钮禁用证据。

## 验证

- RED：`npm run test:unit -- tests/unit/chat-panel.test.ts -t "locks the customer commitment package action"` 先失败，失败点为按钮未 `disabled`。
- GREEN：同 focused 单测通过。
- `npm run test:unit -- tests/unit/chat-panel.test.ts`：51 passed。
- `npm run test:e2e -- tests/e2e/chat.spec.ts -g "可执行动作：生成客户交付恢复承诺包并同步排产报表和审计" --project=chromium`：1 passed。
- `npm run test:unit:coverage`：105 files passed，771 tests passed，Lines 84.04%，`ChatPanel.vue` Lines 73.02%。

## 备注

- `test:unit:coverage` 输出了既有 warning：`--localstorage-file was provided without a valid path`，本次未改动该启动参数。
