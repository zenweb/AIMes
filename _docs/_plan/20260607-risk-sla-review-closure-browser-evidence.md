# Plan：RiskBoard 风险 SLA 晨会复核闭环真实浏览器证据

## 成功标准

- Chromium 中打开风险处置队列页。
- 风险页能生成 SLA 晨会复核包。
- 责任动作能被确认闭环。
- 本地快照保留 closed 状态和责任动作。
- 排产页能显示风险 SLA 复核事件和闭环后的排产建议。
- AI 助手能解释该复核。
- Agent 治理页、报表 OTD 证据链和审计回放均能追溯该闭环。

## 执行

1. 读取现有风险 e2e 和已有风险证据文档。
2. 选择既有 `生成风险 SLA 晨会复核包并联动排产、助手、治理、报表和审计` 用例作为本轮真实浏览器证据。
3. 使用 Nuxt production build + Chromium 复跑目标用例。
4. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/risk.spec.ts -g "生成风险 SLA 晨会复核包"
```

结果：`1 passed`。
