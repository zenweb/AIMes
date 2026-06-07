# Todo：PurchaseBoard 确认失败证据下一步

## 下一片建议

- 继续采购状态变更失败路径：提交失败、收货失败、取消失败。
- 优先级建议：收货失败高于提交失败，因为收货会影响库存齐套、排产复核和 OTD 证据链。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts`。
- 后续覆盖率刷新时确认 `PurchaseBoard.vue` 覆盖率增量，避免继续投入边际收益过低的路径。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨。
