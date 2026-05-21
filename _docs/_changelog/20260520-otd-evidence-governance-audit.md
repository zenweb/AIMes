# 2026-05-20 OTD 证据治理与审计回放

## 变更

- `系统管理 > Agent 治理` 新增 `OTD 复盘证据治理` 区块，直接读取 `aimes_otd_evidence_chain`。
- Agent 治理指标新增 `OTD 复盘证据`，用于核对统一证据链是否覆盖跨模块执行记录。
- 治理清单按阶段展示采购回写、设备维护、生产完工、质量回写、排产反馈和签署记录，并暴露对象与追踪编号。
- `审计日志` AI 决策回放新增 `OTD 证据链` 动态卡片，把证据阶段、对象、来源、状态、追踪编号和报表/CSV 核对点串成可回放步骤。
- 新增 e2e 覆盖：
  - `Admin Agent 治理 › OTD 复盘证据进入 Agent 治理清单`
  - `Audit 审计决策回放 › 回放统一 OTD 复盘证据链`

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：passed。
- `npm run test:e2e -- tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts`：12 passed。

## 后续

- 下一步可把库存齐套、实时监控现场事件、工程约束审批和人员技能校验也写入统一证据链。
- 审计回放可继续增加筛选/分组，支持按阶段、来源模块、对象工单和追踪编号快速定位。
