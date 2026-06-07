# Monitoring 初始化治理记录读取失败可见化报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片只处理 `MonitoringBoard` 初始化时读取 Hypercare 与现场处置包治理记录失败后的 fail-loud UI。
- 未扩展新功能，未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/monitoring/MonitoringBoard.vue`
  - `onMounted()` 中的 `readPocHypercareAcceptanceRecordBackendFirst()` 与 `readMonitoringSituationEscalationsBackendFirst()` 增加异常兜底。
  - 读取异常时显示 `现场态势初始化读取失败`。
  - 展示具体影响面和失败原因：`Hypercare 与现场处置包记录暂未加载：...`。
  - 读取失败后仍继续执行 `connectSignalR()`，避免治理记录异常阻断实时监控页面后续加载。
- `src/frontend/tests/unit/monitoring-board.test.ts`
  - 新增 mounted 失败路径单元测试，模拟 Hypercare 后端优先读取失败。
  - 断言页面展示失败标题、影响面和错误原因。

## 验证

- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts`
  - 4 passed。
- `npm.cmd run test:unit:coverage`
  - 84 files passed。
  - 534 tests passed。
  - 全局覆盖率：statements 74.84%，branches 58.91%，functions 69.71%，lines 78.22%。
  - `MonitoringBoard.vue`：statements 74.33%，branches 76.47%，functions 47.22%，lines 75.88%。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts`
  - Nuxt production build passed。
  - Chromium 4/4 passed。

## B 轨道仍未关闭

- Hosted CI 仍缺 GitHub run URL / run id / job summary。
- PostgreSQL/staging rehearsal 仍缺真实演练证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
