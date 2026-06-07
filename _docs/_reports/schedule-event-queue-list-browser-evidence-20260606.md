# ScheduleEventQueuePanel 事件队列语义真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片覆盖排产页 `ScheduleEventQueuePanel` 的三类事件重排队列。
- 重点验证事件队列能在真实 Chromium 中以 list/listitem 暴露，并继续生成缺料、设备、急单三类 Agent 重排建议。
- 未扩展新功能，未改动建议生成、采纳反馈、证据归档或排产业务逻辑。
- 未关闭发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/schedule/ScheduleEventQueuePanel.vue`
  - `.event-grid` 增加 `role="list"` 和带事件数量的 `aria-label`。
  - `.event-card` 增加 `role="listitem"` 和包含事件上下文的 `aria-label`。
  - 新增 `eventListLabel`、`eventItemLabel` 两个小 helper。
- `src/frontend/tests/unit/schedule-event-queue-panel.test.ts`
  - 扩展既有组件单测，验证事件队列和事件卡片语义。
- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 在“三类事件触发 Agent 重排建议”真实 Chromium 场景中验证 list/listitem 语义。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/schedule-event-queue-panel.test.ts`
  - 预期失败：`expected undefined to be 'list'`，证明原事件队列没有 list 语义。
- GREEN：`npm.cmd run test:unit -- tests/unit/schedule-event-queue-panel.test.ts`
  - Vitest 1 file passed，1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/scheduling.spec.ts -g "三类事件触发 Agent 重排建议"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run lint`
  - ESLint passed，覆盖 `src`、`tests/unit`、`tests/e2e`、`vitest.config.ts`。

## 未通过/未覆盖项

- 本片未扩展 Agent 多方案决策包内部 scenario 列表语义。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口。
