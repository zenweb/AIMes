# 2026-06-06 AnomalyBoard 现场事件分流队列语义真实浏览器证据

## Changed

- 为 `AnomalyBoard` 的现场事件中心分流 lane 补充 `list/listitem` 可访问语义。
- 分流队列容器现在暴露 `aria-label="异常分流事件队列：3 条"`。
- 每条分流 lane 现在暴露包含事件类型、标题和下游路线的可访问名称。
- 真实 Chromium “展示异常到风险、排产、质量、采购的处置闭环”场景新增事件分流队列语义断言。

## Tests

- RED：`npm.cmd run test:unit -- tests/unit/anomaly-board.test.ts -t "event dispatch lanes"`：预期失败，原 `.event-lanes` 缺少 `role="list"`。
- GREEN：`npm.cmd run test:unit -- tests/unit/anomaly-board.test.ts -t "event dispatch lanes"`：1 file passed，1/6 passed，5 skipped。
- `npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "展示异常到风险、排产、质量、采购的处置闭环"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run lint`：ESLint passed，覆盖 `src`、`tests/unit`、`tests/e2e`、`vitest.config.ts`。

## Notes

- 本片只硬化既有异常分流入口 UX/可访问性，不新增异常处置功能。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察。
