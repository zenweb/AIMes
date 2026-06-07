# 2026-06-07 ScheduleBoard 急单插单多方案决策包 Chromium 证据

## 变更

- 复跑排产甘特图 e2e：`急单插单生成多方案决策包并进入 OTD 复盘`。
- 确认 Nuxt production build + Chromium 下，急单插单能生成 Agent 多方案决策包、完成人工采纳，并进入报表 OTD 证据链。
- 本轮未修改产品代码，只补充真实浏览器证据报告。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "急单插单生成多方案决策包"
```

结果：`1 passed`。
