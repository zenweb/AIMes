# 2026-06-06 PurchaseBoard 收货失败 Chromium 证据

## 变更

- 新增采购协同 e2e：`收货接口失败时保留收货弹窗和已确认状态并告警`。
- Chromium route 模拟 POST `/api/v1/purchase/{id}/receive` 返回 409。
- 验证收货失败时组件告警、弹窗保留、采购单状态和已收数量不造假。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "收货接口失败"
```

结果：`1 passed`。
