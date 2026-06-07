# AnomalyBoard 现场事件分流队列语义真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片覆盖异常管理 `AnomalyBoard` 的现场事件中心分流 lane。
- 重点验证设备、质量、物料三类异常分流入口能在真实 Chromium 中以 list/listitem 暴露，并保持风险队列导航可用。
- 未扩展新功能，未改动异常分流、风险队列、AI 排产、质量闭环、采购协同或 OTD 证据逻辑。
- 未关闭发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/anomaly/AnomalyBoard.vue`
  - `.event-lanes` 增加 `role="list"` 和 `aria-label="异常分流事件队列：3 条"`。
  - `.event-lane` 增加 `role="listitem"` 和包含事件上下文的 `aria-label`。
  - 新增 `eventLaneListLabel`、`eventLaneLabel` 小 helper。
- `src/frontend/tests/unit/anomaly-board.test.ts`
  - 新增现场事件分流队列语义单测。
- `src/frontend/tests/e2e/anomaly.spec.ts`
  - 在“展示异常到风险、排产、质量、采购的处置闭环”真实 Chromium 场景中验证 list/listitem 语义。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/anomaly-board.test.ts -t "event dispatch lanes"`
  - 预期失败：`expected undefined to be 'list'`，证明原分流队列没有 list 语义。
- GREEN：`npm.cmd run test:unit -- tests/unit/anomaly-board.test.ts -t "event dispatch lanes"`
  - Vitest 1 file passed，1/6 passed，5 skipped。
- `npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts -g "展示异常到风险、排产、质量、采购的处置闭环"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run lint`
  - ESLint passed，覆盖 `src`、`tests/unit`、`tests/e2e`、`vitest.config.ts`。

## 未通过/未覆盖项

- 本片未全量重跑异常分流到质量、设备、物料三条下游长链路 e2e。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口。
