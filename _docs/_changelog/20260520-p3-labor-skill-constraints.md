# 2026-05-20 P3 — 人员技能与资质进入开工校验

## 触发

深化计划中 P3 “系统运营与治理”要求人员管理具备技能矩阵、资质有效期、班组排班，并让人员可用性成为排产约束。当前人员页只有基础资料，生产开工也只校验工位/设备。

## 产出

- 新增 `src/frontend/src/components/employee/SkillMatrixPanel.vue`
- 新增 `src/frontend/src/components/production/StartQualificationPanel.vue`
- 新增 `src/frontend/tests/e2e/employee.spec.ts`
- 更新 `src/frontend/src/types/employee.ts`
- 更新 `src/frontend/src/components/employee/EmployeeBoard.vue`
- 更新 `src/frontend/src/components/production/ProductionBoard.vue`
- 更新 `src/frontend/src/components/schedule/EngineeringConstraintPanel.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/tests/e2e/production.spec.ts`
- 更新 `src/frontend/tests/e2e/scheduling.spec.ts`
- 更新 `src/frontend/tests/e2e/modules.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 人员页新增“技能矩阵与资质有效期”面板。
- demo 人员数据补充技能、资质、班组、班次：
  - `EMP-001`：CNC 精加工，`CNC-2 级` 有效。
  - `EMP-003`：热处理，`热处理上岗证` 临期。
- 生产开工弹窗新增“开工前校验”，展示推荐人员、班组班次、必需技能和资质有效期。
- 开工确认后执行轨迹写入“人员资质”标签和资质校验说明。
- 排产工程约束面板新增“人员能力”约束，把 CNC 与热处理人员资质纳入 Agent 推荐解释。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/employee.spec.ts tests/e2e/production.spec.ts tests/e2e/scheduling.spec.ts --reporter=list --workers=1 --retries=0`，32 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`，87 passed。
- 非阻断警告：Node `DEP0180`、SignalR Rollup PURE 注释、chunk size > 900k。

## 下一步

继续 P3：让条码扫描从工具变成现场入口，支持扫工单进入报工、扫设备进入设备详情、扫物料进入库存/BOM。
