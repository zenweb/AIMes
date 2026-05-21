# 2026-05-20 工程约束与人员能力进入 OTD 证据链

## 变更

- `AI 排产 > 工程数据约束` 新增“同步工程证据”动作。
- 工程证据把 BOM 替代料、工艺能力、质量参数和人员能力约束写入统一 `aimes_otd_evidence_chain`。
- 工程证据包含来源编码、影响范围、Agent 用途、状态标签和 `TRACE-ENG-*` 追踪编号。
- `人员管理 > 技能矩阵与资质有效期` 新增“同步人员证据”动作。
- 人员证据把员工技能、班组班次、资质有效/临期状态写入 `人员能力` 阶段记录，并使用 `TRACE-LABOR-*` 追踪编号。
- 新增 e2e 覆盖：
  - `Engineering data 工程数据约束 › AI 排产同步工程约束到 OTD 证据链与审计回放`
  - `Employee 人员能力约束 › 人员技能资质同步到 OTD 证据链与 Agent 治理`

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：passed。
- `npm run test:e2e -- tests/e2e/engineering-data.spec.ts tests/e2e/employee.spec.ts tests/e2e/report.spec.ts tests/e2e/admin.spec.ts tests/e2e/audit.spec.ts`：24 passed。

## 后续

- 下一步可把工程变更审批、替代料确认结果和人员排班冲突继续升级为可执行任务，而不只是证据同步。
- 统一证据链后续可增加阶段筛选、来源筛选和一键导出审计包。
