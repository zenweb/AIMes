# Plan：PurchaseBoard 确认失败真实浏览器证据

## 成功标准

- Chromium 中选择 `PO-20260502`。
- 触发确认 POST。
- POST 失败时组件 fail loud。
- 详情与列表状态都保持 `已提交`。
- 确认按钮仍可见，支持后续重试。

## 执行

1. 读取当前 PurchaseBoard 行为、e2e 和单测。
2. 新增最小 Chromium 用例。
3. 通过 route 返回 409 模拟后端确认失败。
4. 跑目标 e2e。
5. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "确认采购订单接口失败"
```

结果：`1 passed`。
