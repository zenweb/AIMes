# 2026-06-06 PurchaseBoard 确认失败 Chromium 证据

## 变更

- 新增采购协同 e2e：`确认采购订单接口失败时保留已提交状态并告警`。
- Chromium route 模拟 POST `/api/v1/purchase/{id}/confirm` 返回 409。
- 验证确认失败时组件告警、详情状态和列表状态都保留 `已提交`，不产生假确认。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "确认采购订单接口失败"
```

结果：`1 passed`。
