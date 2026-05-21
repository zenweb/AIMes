# 2026-05-21 P0 — 实时监控现场态势升级为跨模块处置包

## 背景

实时监控已经能展示现场态势图，并能把设备、物料、质量事件同步到统一 OTD 证据链。但这仍偏“告警可见”，还没有把现场事件转成风险队列和排产 Agent 可消费的处置包。

## 改动

- 新增 `monitoring-situation-escalation-sync.ts`，统一写入 `aimes_monitoring_situation_escalations` 与 `aimes_otd_evidence_chain`。
- `实时监控 / 现场态势图` 新增 `升级为跨模块处置包` 动作，默认把 `CNC-001` 瓶颈负载事件升级为：
  - 审计编号：`AUD-SF-ESC-SF-CNC-LOAD-20260521`
  - 追踪编号：`TRACE-SF-ESC-SF-CNC-LOAD`
  - 负责人：`生产经理审批`
  - 影响工单：`WO-RUSH-9001 / WO-DEMO-1002`
- `风险预警` 风险处置队列读取现场态势处置包，自动生成 `现场态势` 风险卡。
- `AI 排产` 事件队列读取现场态势处置包，自动生成 `现场处置包` 事件，并支持生成锁定期后 CNC 分流建议。
- `审计日志` 通过统一 OTD 证据链回放 `现场处置包`，报表中心可继续复用该证据记录。
- `CHANGELOG.md` 与功能深化计划已同步更新。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`
- 通过：`npm run test:e2e -- tests/e2e/monitoring.spec.ts --grep "跨模块处置包"`，1 passed。
- 通过：`npm run test:e2e -- tests/e2e/monitoring.spec.ts tests/e2e/risk.spec.ts tests/e2e/scheduling.spec.ts tests/e2e/audit.spec.ts`，36 passed。

## 后续

- 可继续把现场处置包扩展为多事件选择，而不是默认升级 `CNC-001` 瓶颈事件。
- 可把处置包状态从 `待跨模块处置` 扩展为风险队列关闭后回写 `已闭环`。
