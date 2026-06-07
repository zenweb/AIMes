# Todo：PurchaseBoard 供应商绩效 SLA 证据下一步

## 下一片建议

- 若继续采购精品化，优先补供应网络选优写入失败的 Chromium fail-loud 证据，验证失败时保持 `待决策`，不显示 `供应网络已选优`。
- 若按覆盖率杠杆切换，转向仍低覆盖且用户必经的质量、生产、库存或路由关键路径。

## 验证待办

- 资源允许时跑完整 `npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts`。
- 后续覆盖率刷新时确认 `PurchaseBoard.vue` 覆盖率变化，避免采购页局部微切片长期占用 A 轨。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍属于 B 轨，不能用本轮 Chromium 证据替代。
