# Todo：PurchaseBoard 下一步

## 建议下一片

- 按覆盖率杠杆继续选择低覆盖且用户必经的组件，不回到 LoginPage 微切片。
- 若继续 PurchaseBoard，优先补真实浏览器失败路径：提交失败、确认失败、收货失败、取消失败四类关键采购状态变更。

## 验证待办

- 在资源允许时跑 `npm.cmd run test:e2e -- tests/e2e/purchase.spec.ts` 全采购 e2e。
- 在锁文件风险清理后跑前端 lint/coverage，避免把当前 dependency-lock 脏状态误当发布证据。

## 发布闸门

- Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需 B 轨单独追踪。
