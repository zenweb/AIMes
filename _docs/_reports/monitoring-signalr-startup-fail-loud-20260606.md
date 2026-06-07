# Monitoring SignalR 启动失败可诊断报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片只处理 `MonitoringBoard` 非 demo 环境下 SignalR 实时连接启动失败后的可诊断提示。
- 未扩展新功能，未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/monitoring/MonitoringBoard.vue`
  - `connection.start().catch(...)` 保留原有演示数据 fallback。
  - 连接启动失败时展示具体错误原因：`实时连接失败，使用演示数据：...`。
- `src/frontend/tests/unit/monitoring-board.test.ts`
  - 将 `isOfflineDemoMode` 与 SignalR builder/mock connection 改为可控测试替身。
  - 新增非 demo SignalR 启动失败单元测试。
  - 断言页面展示失败原因，并继续加载演示设备数据。

## 验证

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`
  - 5 passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 535 tests passed。
  - 全局覆盖率：statements 74.93%，branches 58.92%，functions 69.75%，lines 78.31%。
  - `MonitoringBoard.vue`：statements 79.14%，branches 77.31%，functions 50%，lines 81.17%。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`
  - Nuxt production build passed。
  - Chromium 4/4 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
