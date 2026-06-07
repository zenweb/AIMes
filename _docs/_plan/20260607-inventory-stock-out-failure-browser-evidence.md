# 2026-06-07 Plan - InventoryBoard 库存出库失败 Chromium 证据

## 成功标准

- 真实 Chromium 能覆盖出库提交后端 503。
- 失败时 `出库` dialog 必须保留。
- 失败原因必须以 `role="alert"` 暴露。
- dialog 必须保留当前物料上下文，支持用户修正或重试。

## 执行

- 在 `src/frontend/tests/e2e/inventory.spec.ts` 增加单条定向 e2e。
- 选择 `轴承钢圈 / MAT-A01` 并打开出库弹窗。
- 使用 `page.route('**/api/v1/inventory/stock-out')` 注入 503。
- 只跑目标用例，避免重复烧整套浏览器回归成本。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/inventory.spec.ts -g "库存出库失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## Stop Condition

- 目标 Chromium 用例通过。
- 文档证据补齐到 report/changelog/review/todo/issue/plan。
- B 轨仍以 fail-loud 方式保留为未关闭发布阻断项。
