# Review：PurchaseBoard 确认失败 Chromium 证据

## 结论

未发现本轮新增测试覆盖路径的阻断问题。现有产品行为在真实 Chromium 中符合预期：确认接口失败时 fail loud，采购单保持 `已提交`，不误推进状态。

## 已验证

- POST `/api/v1/purchase/{id}/confirm` 被真实浏览器发起并由 route 返回 409。
- 组件内 `.purchase-notification` 展示 `确认失败：supplier credit hold from chromium`。
- `PO-20260502` 详情状态仍是 `已提交`。
- `PO-20260502` 列表状态仍是 `已提交`。
- `.act-confirm` 仍可见。

## 残余风险

- 只跑了目标 Chromium 用例，未跑完整采购 e2e。
- 当前工作树很脏，本 review 只覆盖本轮新增确认失败证据。
- B 轨发布闸门未关闭。
