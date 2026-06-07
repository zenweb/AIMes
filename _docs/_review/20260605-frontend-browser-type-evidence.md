# 2026-06-05 前端真实浏览器与类型证据审查

## Review Result

- 结论：本轮没有新增功能，只补齐当前用户关键路径的类型证明和真实浏览器证据，符合精品现有功能约束。
- `GanttChart.vue` 的类型问题来自本地模块声明过宽，修复点集中在 `src/env.d.ts`，没有改运行逻辑。
- `MainLayout.vue` 和 `PurchaseBoard.vue` 的修复都是类型边界收窄，业务行为不变。

## What Was Verified

- 甘特图组件仍能通过组件测试，包含轻量任务标记、拖拽冲突、锁定期阻断和错误提示。
- 排产板风险事件相关单测仍通过。
- 首登改密链路在 Chrome Playwright 下通过，覆盖登录、首登进入改密、改密成功返回登录、路由守卫。
- Demo 主链路在 Chrome Playwright 下通过，覆盖 Dashboard -> Scheduling -> Audit -> Report 可回放。

## Residual Risk

- `npm run lint` 的既有限制仍存在：它不覆盖 Nuxt 根层、middleware、pages、e2e。
- 本轮只抽测 `login.spec.ts` 和 `demo-smoke.spec.ts`，未跑完整 E2E 套件。
- 构建 chunk 超过 `900 kB` 的警告仍需单独作为性能/打包优化项处理。
