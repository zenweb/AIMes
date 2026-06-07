# 2026-06-06 ScheduleEventQueuePanel 事件队列语义真实浏览器证据

## Changed

- 为 `ScheduleEventQueuePanel` 的排产事件队列补充 `list/listitem` 可访问语义。
- 事件队列容器现在暴露带事件数量的 `aria-label`。
- 每张事件卡片现在暴露包含事件类型、标题、风险等级、影响订单和窗口的可访问名称。
- 真实 Chromium “三类事件触发 Agent 重排建议”场景新增事件队列语义断言。

## Tests

- RED：`npm.cmd run test:unit -- tests/unit/schedule-event-queue-panel.test.ts`：预期失败，原 `.event-grid` 缺少 `role="list"`。
- GREEN：`npm.cmd run test:unit -- tests/unit/schedule-event-queue-panel.test.ts`：1 file passed，1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "三类事件触发 Agent 重排建议"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run lint`：ESLint passed，覆盖 `src`、`tests/unit`、`tests/e2e`、`vitest.config.ts`。

## Notes

- 本片只硬化既有排产事件队列 UX/可访问性，不新增排产功能。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察。
