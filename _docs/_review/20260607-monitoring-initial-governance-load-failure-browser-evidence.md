# 2026-06-07 Review - MonitoringBoard 初始化治理证据加载失败 Chromium 证据

## 审计结论

通过。`MonitoringBoard` 初始化治理证据后端失败路径已补齐真实 Chromium 证据，并修复了真实 HTTP 503 被读取 helper 吞掉导致页面无法 fail-loud 的缺口。

## 证据

- 新增用例位置：`src/frontend/tests/e2e/monitoring.spec.ts`
- 用例名：`初始化治理证据加载失败时真实浏览器展示 fail-loud 且保留现场态势入口`
- 生产修复：
  - `src/frontend/src/api/pocEvidence.ts`
  - `src/frontend/src/api/riskEvidence.ts`
  - `src/frontend/src/utils/poc-hypercare-sync.ts`
  - `src/frontend/src/utils/monitoring-situation-escalation-sync.ts`
  - `src/frontend/src/components/monitoring/MonitoringBoard.vue`
- 验证命令：

```powershell
npm.cmd run test:unit -- tests/unit/monitoring-situation-escalation-sync.test.ts -t "throws monitoring escalation backend failures"
npm.cmd run test:unit -- tests/unit/poc-hypercare-sync.test.ts -t "throws hypercare backend failures"
npm.cmd run test:unit -- tests/unit/monitoring-board.test.ts -t "initial monitoring governance records"
npm.cmd run test:e2e -- tests/e2e/monitoring.spec.ts -g "初始化治理证据加载失败"
```

结果：三个 Vitest 定向用例通过，Chromium `1 passed`。

## 风险与边界

- 本轮只跑初始化治理证据加载失败目标切片，未全量回归 Monitoring 全套跨模块 e2e。
- `failLoud` 只在 MonitoringBoard 初始化治理证据读取中启用，其他 backend-first 调用仍保持原有 best-effort 回退。
- B 轨发布闸门仍未关闭，不能把此 A 轨证据等同于 v1.0.0 发布就绪。
