# Todo：PurchaseBoard 收货失败证据下一步

## 下一片建议

- 继续采购状态变更失败路径：提交失败或取消失败。
- 若坚持精品 UI/a11y，优先补收货弹窗 `role="dialog"`、`aria-modal` 和标题关联，再用 Chromium 验证。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts`。
- 后续覆盖率刷新时确认 `PurchaseBoard.vue` 覆盖率增量，避免低收益微切片长期占用 A 轨。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨。
