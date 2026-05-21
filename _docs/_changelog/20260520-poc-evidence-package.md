# 2026-05-20 POC 客户证据包齐套

## 变更

- `报表中心` 将 `客户真实工单导入样例` 与 `客户真实设备故障数据` 统一纳入 POC 验收证据 checklist。
- 两类客户证据都补齐后，POC 评分从 `97 / 100` 提升到 `100 / 100`。
- 新增“客户 POC 证据包齐套”状态，展示 `IMP-POC-WO-20260520-001` 与 `IMP-POC-EQ-FAULT-20260520-001` 两个批次，作为 POC 复盘会入口证据。
- 保留单独补齐路径：工单导入样例仍回写执行维度，设备故障样例仍回写事件闭环维度。
- 新增 POC 证据治理映射层，把客户工单导入样例和设备故障样例统一转成批次、角色、审计编号、风险口径和回放步骤。
- `系统管理` Agent 治理页新增客户 POC 证据治理区，客户证据生成后可看到 `AUD-POC-WO-001` 和 `AUD-POC-EQ-001`。
- `审计日志` AI 决策回放新增 `POC 证据` 卡片，可回放字段映射、信号映射、排产事件联动和 POC 评分回写。

## 验证

- `npm run test:e2e -- tests/e2e/report.spec.ts`：6 passed。
- `npm run test:e2e -- tests/e2e/equipment.spec.ts tests/e2e/report.spec.ts`：25 passed。
- `npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts`：6 passed。
- `npm run test:e2e -- tests/e2e/equipment.spec.ts tests/e2e/report.spec.ts tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts`：31 passed。
