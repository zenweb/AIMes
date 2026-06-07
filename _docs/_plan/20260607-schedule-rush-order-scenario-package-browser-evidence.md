# Plan：ScheduleBoard 急单插单多方案决策包真实浏览器证据

## 成功标准

- Chromium 中打开排产甘特图页。
- 急单插单事件能生成 Agent 重排建议。
- 页面展示多方案决策包，包含推荐方案和未选方案。
- 人工采纳后生成反馈记录。
- 本地反馈快照保留推荐与未选原因。
- 报表页 OTD 证据链能回放急单插入重排建议。

## 执行

1. 读取现有排产 e2e 和证据文档格式。
2. 选择既有 `急单插单生成多方案决策包并进入 OTD 复盘` 用例作为本轮真实浏览器证据。
3. 使用 Nuxt production build + Chromium 复跑目标用例。
4. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单插单生成多方案决策包"
```

结果：`1 passed`。
