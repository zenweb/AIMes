# 2026-06-07 PurchaseBoard 供应商绩效 SLA Chromium 证据

## 变更

- 复跑采购协同 e2e：`供应商绩效 SLA 选优进入排产复核和 OTD 审计`。
- 确认 Nuxt production build + Chromium 下，供应网络选优能贯通采购页、排产复核、报表 OTD 证据链和审计回放。
- 本轮未修改产品代码，只补充真实浏览器证据报告。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "供应商绩效 SLA"
```

结果：`1 passed`。
