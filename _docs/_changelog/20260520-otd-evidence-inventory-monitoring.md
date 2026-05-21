# 2026-05-20 库存齐套与现场态势进入 OTD 证据链

## 变更

- `库存管理 > 工单齐套闭环` 生成缺料排产事件时，同步写入统一 `aimes_otd_evidence_chain`。
- 库存证据包含工单、物料、缺口、在途量、建议动作、来源模块和 `TRACE-KIT-*` 追踪编号。
- `实时监控 > 现场态势图` 新增“同步态势证据”动作，把设备、物料、质量现场事件写入统一 OTD 复盘证据链。
- `报表中心`、`系统管理 Agent 治理` 和 `审计日志 AI 决策回放` 直接复用统一证据链展示库存齐套与现场态势记录。
- 新增 e2e 覆盖：
  - `Inventory 库存齐套闭环 › 工单齐套缺口进入报表 OTD 证据链`
  - `Monitoring 实时监控现场态势 › 同步现场态势证据进入审计回放`

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：passed。
- `npm run test:e2e -- tests/e2e/inventory.spec.ts tests/e2e/monitoring.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`：17 passed。

## 后续

- 下一步把工程约束审批、人员技能/资质校验继续写入统一 OTD 证据链。
- 后续可在审计回放增加阶段筛选，便于从库存、监控、工程、人员四类来源快速定位证据。
