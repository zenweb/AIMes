# 2026-06-06 PurchaseBoard 新建失败 Chromium 证据

## 变更

- 新增采购协同 e2e：`新建采购订单接口失败时保留弹窗并告警`。
- 用 Chromium route 模拟 POST `/api/v1/purchase` 返回 503，验证创建失败时页面告警、弹窗保留、列表不虚增。
- 修复采购页订单区在真实浏览器中被上方供应网络治理区块截获点击的问题。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "新建采购订单接口失败"
```

结果：`1 passed`。

## 注意

本轮不改变发布闸门状态；B 轨仍需独立证据。
