# 2026-05-21 P0 — 现场态势处置包风险关闭反写闭环

## 背景

上一片已经让 `实时监控` 的 `CNC-001` 现场态势升级为跨模块处置包，并同步到风险队列、AI 排产、OTD 证据链和审计回放。但风险队列关闭后，处置包本体仍停留在 `待跨模块处置`，排产页也只能继续显示待处理事件。

## 改动

- `monitoring-situation-escalation-sync.ts` 增加处置包状态流：`escalated -> closed`。
- 新增 `closeMonitoringSituationEscalation`，风险队列关闭对应处置卡时会反写：
  - `aimes_monitoring_situation_escalations`
  - `aimes_otd_evidence_chain`
- `风险预警` 关闭 `CNC-001 现场态势升级处置包` 后，处置留痕显示已反写现场处置包，并把 OTD 证据状态更新为 `已闭环`。
- `AI 排产` 读取已闭环处置包后，事件卡显示 `已缓解 / 风险关闭后复核`，Agent 建议切换为闭环复核口径。
- `审计日志` 复用统一 OTD 证据链，回放 `现场处置包` 时可看到关闭留痕和 `当前状态为 已闭环`。
- `CHANGELOG.md` 与功能深化计划已同步更新。

## 验证

- 待跑：`npx vue-tsc --noEmit -p tsconfig.json`
- 待跑：`npm run test:e2e -- tests/e2e/monitoring.spec.ts --grep "处置包关闭"`
- 待跑：`npm run test:e2e -- tests/e2e/monitoring.spec.ts tests/e2e/risk.spec.ts tests/e2e/scheduling.spec.ts tests/e2e/audit.spec.ts`

## 后续

- 可继续把闭环状态扩展到现场监控页刷新后展示，而不是只在风险、排产和审计中体现。
- 可把关闭原因拆成结构化字段，支持报表中心按处置原因统计现场态势闭环效率。
