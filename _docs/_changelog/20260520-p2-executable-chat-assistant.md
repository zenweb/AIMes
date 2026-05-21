# 2026-05-20 P2 — AI 生产助手可执行动作

## 触发

深化计划中 P2 明确要求“AI 生产助手升级为可执行助手”，验收标准是 ChatPanel 至少能触发 3 个真实业务动作，而不是只返回文本。

## 产出

- 更新 `src/frontend/src/components/chat/ChatPanel.vue`
- 更新 `src/frontend/src/types/knowledge.ts`
- 更新 `src/frontend/tests/e2e/chat.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- ChatPanel 支持从用户自然语言中识别可执行意图。
- 支持动作按钮：
  - 打开 AI 排产
  - 打开风险预警
  - 打开 OTD 报告
  - 生成重排建议
  - 导出 OTD 复盘
- 点击“生成重排建议”会进入 AI 排产，并让用户在“三类事件重排队列”中复核 Agent 建议。
- 点击“导出 OTD 复盘”会生成 `AI-MES-OTD-POC-Report.csv`，并打开报表中心。
- 动作完成后会在聊天记录中追加“动作已执行”反馈，保留可审计轨迹。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/chat.spec.ts --reporter=list --workers=1 --retries=0`，10 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`，83 passed。
- 非阻断警告：Node `DEP0180`、SignalR Rollup PURE 注释、chunk size > 900k。

## 下一步

继续 P2“工程数据变约束来源”：让 BOM 替代料和工艺路线能力要求进入排产解释。
