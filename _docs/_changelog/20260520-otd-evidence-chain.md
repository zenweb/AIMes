# 2026-05-20 OTD 复盘证据链

## 变更

- 新增 `schedule-feedback-sync.ts`，把 `AI 排产` 中调度员对 Agent 建议的采纳/拒绝、原因、目标口径和追踪编号写成本地 OTD 复盘证据。
- 新增 `risk-action-sync.ts`，把 `风险预警` 中风险处置队列的转派、升级、关闭动作写成本地 OTD 复盘证据。
- `报表中心` OTD 改善复盘新增“OTD 复盘证据链”，串联风险触发、Agent 建议、人工采纳、现场处置、质量回写和 POC 签署。
- CSV 导出新增 `OTD复盘证据链` 行，导出内容包含阶段、证据标题、状态、对象和追踪编号。
- 新增 `otd-evidence-chain-sync.ts` 统一证据链同步层，`AI 排产`、`风险预警`、`质量闭环` 和 `POC 签署` 在保留旧本地键的同时，也会写入 `aimes_otd_evidence_chain`。
- `采购协同` 加急收货会写入 `采购回写` 证据，明确采购单、受影响工单和缺料风险释放结果。
- `设备维护` 标记停机与客户真实设备故障样例会分别写入 `设备维护` 和 `设备实证` 证据。
- `生产报工` 完工后会写入 `生产完工` 证据，把完工数量、工单进度、质检结果和 OTD 状态带入复盘。
- `报表中心` 优先读取统一证据链，并保留旧键 fallback；CSV 导出覆盖采购、设备和生产新增证据。
- `MainLayout.vue` 改为显式 `vue-router` 导入 `useRoute/useRouter`，让 `vue-tsc` 能通过类型检查。
- e2e 已覆盖跨页面链路：
  - `AI 排产` 采纳事件建议后，跳转 `报表中心` 能看到人工采纳证据。
  - `风险预警` 关闭缺料风险后，跳转 `报表中心` 能看到现场处置证据。
  - `报表中心` CSV 下载内容包含 OTD 证据链字段。

## 验证

- `npm run test:e2e -- tests/e2e/scheduling.spec.ts tests/e2e/risk.spec.ts tests/e2e/report.spec.ts`：27 passed。
- `npx vue-tsc --noEmit -p tsconfig.json`：passed。
- `npm run test:e2e -- tests/e2e/purchase.spec.ts tests/e2e/equipment.spec.ts tests/e2e/production.spec.ts tests/e2e/report.spec.ts tests/e2e/scheduling.spec.ts tests/e2e/risk.spec.ts tests/e2e/quality.spec.ts`：69 passed。

## 后续

- 可继续把库存齐套、实时监控事件和工程约束审批纳入同一证据链，让 OTD 复盘覆盖“计划约束 -> 现场执行 -> 经营结果”的完整审计范围。
