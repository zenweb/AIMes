# 2026-06-05 生产构建拆包下一步

## Done

- 已完成：确认原生产构建存在 `911.05 kB` JS chunk 超过 `900 kB` 阈值。
- 已完成：验证 PrimeVue 独立拆包会产生 circular chunk，不采用。
- 已完成：采用 Vue 核心独立 chunk，生产构建最大 JS chunk 降至 `817.49 kB`。
- 已完成：跑通 `production.spec.ts` 真实 Chromium E2E，`21 passed`。

## Next

- 继续按覆盖率杠杆选择用户必经、低覆盖、业务关键组件。
- 后续如继续压 bundle，优先从路由级动态 import 或组件懒加载入手，不再盲拆 PrimeVue。
- 发布 B 轨仍需单独追踪：hosted CI、PostgreSQL/staging、attack-chain A/B/C、安全签字、灰度观察。
