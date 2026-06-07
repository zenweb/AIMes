# Review：PurchaseBoard 收货失败 Chromium 证据

## 结论

未发现本轮新增测试覆盖路径的阻断问题。现有产品行为在真实 Chromium 中符合预期：收货接口失败时 fail loud，弹窗保留，采购单状态和物料已收数量未被误推进。

## 已验证

- POST `/api/v1/purchase/{id}/receive` 被真实浏览器发起并由 route 返回 409。
- 组件内 `.purchase-notification` 展示 `收货失败：received quantity exceeds remaining from chromium`。
- 收货弹窗仍可见。
- `PO-20260501` 详情状态仍为 `已确认`。
- `MAT-A01` 已收数量仍为 `0`。
- `.act-receive` 仍可见。

## 残余风险

- 只跑了目标 Chromium 用例，未跑完整采购 e2e。
- 收货弹窗当前没有 `role="dialog"`，本轮未扩大到 a11y 修复。
- B 轨发布闸门未关闭。
