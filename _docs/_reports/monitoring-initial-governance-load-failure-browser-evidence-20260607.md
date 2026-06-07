# MonitoringBoard 初始化治理证据加载失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`MonitoringBoard` 初始化读取 POC Hypercare 与现场态势处置包失败时的 fail-loud 证据。
- 目标：上线后监控页进入时，如果治理证据接口不可用，真实浏览器必须明确告警，同时保留现场态势入口，避免用户误以为 Hypercare 与现场处置包状态可信。

## 发现

- 组件单元测试通过 mock helper 抛错覆盖了 `现场态势初始化读取失败`。
- 真实 HTTP 503 会被 `getLatestPocHypercareAcceptance()` catch 成 `null`，也会被 `queryMonitoringSituationEscalations()` catch 成 `[]`，导致真实浏览器无法触发初始化 fail-loud。
- 这是单元证据和真实浏览器证据不一致的产品缺口。

## 变更

- `src/frontend/src/api/pocEvidence.ts`
  - 为 `getLatestPocHypercareAcceptance()` 增加可选 `failLoud` 读取模式。
- `src/frontend/src/api/riskEvidence.ts`
  - 为 `queryMonitoringSituationEscalations()` 增加可选 `failLoud` 读取模式。
- `src/frontend/src/utils/poc-hypercare-sync.ts`
  - 为 `readPocHypercareAcceptanceRecordBackendFirst()` 透传 `failLoud`。
- `src/frontend/src/utils/monitoring-situation-escalation-sync.ts`
  - 为 `readMonitoringSituationEscalationsBackendFirst()` 透传 `failLoud`。
- `src/frontend/src/components/monitoring/MonitoringBoard.vue`
  - 初始化读取 Hypercare 与现场态势处置包时启用 `failLoud`。
- `src/frontend/tests/e2e/monitoring.spec.ts`
  - 新增真实 Chromium 用例：`初始化治理证据加载失败时真实浏览器展示 fail-loud 且保留现场态势入口`。

## 验证

- `npm.cmd run test:unit -- tests/unit/monitoring-situation-escalation-sync.test.ts -t "throws monitoring escalation backend failures"`
  - Vitest 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/poc-hypercare-sync.test.ts -t "throws hypercare backend failures"`
  - Vitest 1/1 passed。
- `npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts -t "initial monitoring governance records"`
  - Vitest 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts -g "初始化治理证据加载失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 真实 Chromium 显式关闭 offline demo，走真实 API 拦截。
- `/api/v1/scheduling/poc-hypercare-acceptance/latest` 返回 503。
- `/api/v1/scheduling/monitoring-situation-escalations` 返回 503。
- 页面展示 `现场态势初始化读取失败`。
- 页面展示 `Hypercare 与现场处置包记录暂未加载`。
- 现场态势核心入口仍保留：`同步态势证据` 与 `升级为跨模块处置包` 可见。

## 结论

- `MonitoringBoard` 初始化治理证据失败路径已从“单元 mock 可见”推进到“真实 HTTP 失败可见”。
- 本片修复了真实浏览器下被 helper 吞错的 fail-loud 缺口，同时保留其他调用默认回退语义。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
