# Monitoring 现场态势证据同步失败可见化报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片只处理 `MonitoringBoard` 的「同步态势证据」按钮在 OTD 证据链写入失败时没有 fail-loud UI 的问题。
- 未扩展新功能，未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/monitoring/MonitoringBoard.vue`
  - `syncSituationEvidence()` 包裹 OTD 证据链写入。
  - 写入异常时显示 `现场态势证据同步失败`。
  - 展示具体失败原因：`现场事件未完整写入 OTD 证据链：...`。
  - 失败后提前返回，避免误报 `现场态势证据已同步 OTD 复盘`。
- `src/frontend/tests/unit/monitoring-board.test.ts`
  - 新增失败路径单元测试，模拟 `upsertOtdEvidenceChainRecord` 抛错。
  - 断言页面展示失败标题、失败原因，并且不展示成功文案。

## 验证

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`
  - 2 passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 532 tests passed。
  - 全局覆盖率：statements 74.8%，branches 58.91%，functions 69.63%，lines 78.17%。
  - `MonitoringBoard.vue`：statements 71.66%，branches 76.47%，functions 41.66%，lines 73%。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`
  - Nuxt production build passed。
  - Chromium 4/4 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
