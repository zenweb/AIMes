# Plan：PurchaseBoard 收货失败真实浏览器证据

## 成功标准

- Chromium 中选择 `PO-20260501`。
- 打开收货弹窗并提交 `MAT-A01` 收货。
- POST 失败时组件 fail loud。
- 收货弹窗保持打开。
- 详情状态保持 `已确认`。
- `MAT-A01` 已收数量保持 `0`。

## 执行

1. 读取当前 PurchaseBoard 收货 UI、API 路径、单测和 e2e。
2. 新增最小 Chromium 用例。
3. 通过 route 返回 409 模拟后端收货失败。
4. 跑目标 e2e。
5. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "收货接口失败"
```

结果：`1 passed`。
