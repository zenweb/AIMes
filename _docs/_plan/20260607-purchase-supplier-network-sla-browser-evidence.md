# Plan：PurchaseBoard 供应商绩效 SLA 真实浏览器证据

## 成功标准

- Chromium 中打开采购协同页。
- 供应网络治理面板展示 SLA 违约候选。
- 选优供应商后生成 trace。
- 排产页能看到供应网络事件并打开排产复核建议。
- 报表页能看到 OTD evidence。
- 审计页能回放供应网络决策链。

## 执行

1. 读取现有采购 e2e 和证据文档格式。
2. 选择既有 `供应商绩效 SLA` 用例作为本轮真实浏览器证据。
3. 使用 Nuxt production build + Chromium 复跑目标用例。
4. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "供应商绩效 SLA"
```

结果：`1 passed`。
