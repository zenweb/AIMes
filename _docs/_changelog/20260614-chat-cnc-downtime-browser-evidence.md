# 2026-06-14 Changelog - ChatPanel CNC 停机问答真实浏览器证据

## 变更
- 按 owner 指令跳过/后置 15 天灰度观察等待，不把它作为当前继续工作的阻塞项。
- 生成当前 release gate 口径报告：`_docs/_reports/release-gate-audit-20260614-gray-skipped-continue.md`。
- 选择当前覆盖率最低且用户必经的 `ChatPanel` 做下一片真实浏览器证据。
- 通过真实 Chrome 验证 AI 生产助手回答 “如果 CNC-001 故障 4 小时会怎样？”。
- 补充 `ChatPanel` 后端来源分数越界单元测试，验证 `relevanceScore > 1` 夹紧为 `100%`、负数夹紧为 `0%`，避免证据置信度误导用户。
- 新增证据截图与 manifest：
  - `output/playwright/20260614-chat-cnc-downtime-browser-evidence/chat-cnc-downtime-answer.png`
  - `output/playwright/20260614-chat-cnc-downtime-browser-evidence/manifest.md`

## 验证
- `npm run test:e2e -- tests/e2e/chat.spec.ts --project=chromium --grep "业务问答：评估 CNC-001 故障 4 小时影响"`：1 passed。
- `npm run test:unit -- tests/unit/chat-panel.test.ts`：45 passed。
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts`：45 passed；`ChatPanel.vue` lines 72.12%，branches 67.42%，本次边界断言未带来覆盖率百分比增量。
- 真实 Chrome 截图确认页面包含 CNC-001 4 小时影响、受影响工单和设备维护动作入口。

## 范围说明
- 未修改业务代码，只补测试与证据。
- 灰度观察仍是 owner 后置项，不计为严格 v1.0.0 final release PASS。
