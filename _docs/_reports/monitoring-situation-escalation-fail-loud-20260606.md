# Monitoring 现场态势升级失败可见化报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片只处理 `MonitoringBoard` 的「升级为跨模块处置包」按钮在升级记录写入失败时没有 fail-loud UI 的问题。
- 未扩展新功能，未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/monitoring/MonitoringBoard.vue`
  - `escalateSituationResponse()` 包裹 `writeMonitoringSituationEscalation()`。
  - 写入异常时显示 `现场态势升级失败`。
  - 展示具体影响面和失败原因：`跨模块处置包未写入风险队列和排产事件队列：...`。
  - 失败后提前返回，避免误报 `现场态势已升级为跨模块处置包`。
- `src/frontend/tests/unit/monitoring-board.test.ts`
  - 将 `writeMonitoringSituationEscalation` 提升为可控 mock。
  - 新增失败路径单元测试，模拟升级记录写入抛错。
  - 断言页面展示失败标题、失败原因，并且不展示成功文案。

## 验证

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`
  - 3 passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 533 tests passed。
  - 全局覆盖率：statements 74.83%，branches 58.91%，functions 69.71%，lines 78.21%。
  - `MonitoringBoard.vue`：statements 73.91%，branches 76.47%，functions 47.22%，lines 75.44%。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`
  - Nuxt production build passed。
  - Chromium 4/4 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
