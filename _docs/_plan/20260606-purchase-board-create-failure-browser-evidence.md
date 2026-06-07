# Plan：PurchaseBoard 新建失败真实浏览器证据

## 成功标准

- Chromium 中触发新建采购订单 POST。
- POST 失败时组件 fail loud。
- 弹窗不关闭，用户输入上下文不丢。
- 列表不出现失败订单，避免假成功。

## 执行

1. 读取现有 `PurchaseBoard`、采购 API、单测和 e2e。
2. 新增最小 Chromium 用例，先用 503 后端响应证明失败路径。
3. RED 发现真实浏览器点击被截获，定位到采购页布局压缩。
4. 最小修复订单区布局。
5. 复跑目标 e2e。
6. 记录报告、changelog、review、todo、issue。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts -g "新建采购订单接口失败"
```

结果：`1 passed`。
