# Monitoring SignalR 重连原因可见化报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片只处理 `MonitoringBoard` 非 demo 环境下 SignalR 进入重连状态时错误原因丢失的问题。
- 未扩展新功能，未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/monitoring/MonitoringBoard.vue`
  - `connection.onreconnecting(error => ...)` 保持 `connected=false`。
  - 当 `onreconnecting` 携带错误时，实时事件展示具体重连原因：`实时连接断开，正在重连...：...`。
  - 当 `onreconnecting` 无错误时，保留原有 `实时连接断开，正在重连...` 文案。
- `src/frontend/tests/unit/monitoring-board.test.ts`
  - 新增 SignalR `onreconnecting(error)` 单元测试。
  - 断言页面显示断开状态、重连事件和具体异常原因。

## 验证

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`
  - 7 passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 537 tests passed。
  - 全局覆盖率：statements 74.99%，branches 58.92%，functions 69.86%，lines 78.38%。
  - `MonitoringBoard.vue`：statements 82.53%，branches 76.42%，functions 58.33%，lines 84.88%。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`
  - Nuxt production build passed。
  - Chromium 4/4 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
