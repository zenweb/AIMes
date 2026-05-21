# 2026-05-21 异常分流闭环

## 触发

功能深化计划中 `异常管理` 已升级为现场事件中心，但原能力主要停留在展示异常分流路线。用户期望 AI MES 不只是看板，而是能把现场异常变成风险处置、排产复核、OTD 证据和审计回放的闭环动作。

## 产出

- 新增 `src/frontend/src/utils/anomaly-dispatch-sync.ts`
- 更新 `src/frontend/src/components/anomaly/AnomalyBoard.vue`
- 更新 `src/frontend/src/components/equipment/EquipmentScheduleImpactPanel.vue`
- 更新 `src/frontend/src/components/inventory/KittingClosurePanel.vue`
- 更新 `src/frontend/src/components/purchase/PurchaseBoard.vue`
- 更新 `src/frontend/src/components/risk/RiskActionQueuePanel.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleEventQueuePanel.vue`
- 更新 `src/frontend/tests/e2e/anomaly.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `异常管理` 现场事件中心新增“确认分流”动作。
- `装配间隙超差` 确认后写入 `aimes_anomaly_dispatch_records`，生成 `AUD-ANOMALY-DISPATCH-20260521-001` 和 `TRACE-ANOMALY-DISPATCH-QUALITY-GAP-20260521`。
- `CNC-001 主轴温升异常` 确认后进入 `设备管理`，可生成维护复核单、写入设备停机事件，并同步排产复核和 OTD 证据链。
- `原料批次来料异常` 确认后进入 `库存齐套` 和 `采购协同`，可生成批次隔离、齐套复核、供应商 8D 和备用批次承诺。
- `风险预警` 行动队列读取异常分流记录，展示影响工单、负责人、交付影响、处置窗口和异常管理追踪来源。
- `AI 排产` 事件队列读取异常分流记录，新增 `异常分流` 事件，并生成质量、设备、物料异常后的排产复核建议。
- `报表中心` OTD 证据链记录 `异常分流` 阶段，保留影响工单、处置建议、审计编号和追踪编号。
- `审计日志` 决策回放可回放现场确认、风险、设备维护、库存隔离、采购整改、排产复核和 OTD 证据链路径。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`
- 通过：`npm run test:e2e -- tests/e2e/anomaly.spec.ts`，5 passed。

## 下一步

继续把异常闭环从本地演示状态推进到真实后端事件模型，补齐异常 SLA、责任人签收、处置结果回写和跨班组交接。
