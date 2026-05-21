# 2026-05-20 人员资质临期替班执行闭环

## 变更

- 新增 `labor-assignment-sync.ts`，统一保存人员替班记录并写入 `aimes_otd_evidence_chain`。
- 同一同步层新增 `aimes_labor_qualification_block`，当候选评分找不到有效替班人员时生成停工复核阻断记录，并写入 `人员阻断` 阶段 OTD 证据。
- 停工复核继续新增 `reviewing / released` 状态机：
  - “主管确认停工复核”会把阻断状态推进为 `reviewing`，写入 `人员复核` 阶段证据 `TRACE-LABOR-BLOCK-WO-013-OP-10-REVIEW`。
  - “补证改派并重新放行”会生成 `AUD-LABOR-RELEASE-20260520-001` / `TRACE-LABOR-RELEASE-WO-013-OP-10`，保留 released 阻断历史，同时写入新的替班记录和 `人员放行` 阶段证据。
- `人员管理 > 技能矩阵与资质有效期` 新增“资质临期替班建议”区块：
  - `EMP-003 王五` 热处理上岗证 `2026-05-25` 临期。
  - 系统按技能、班组/班次、证书有效期和排班可用性评分候选人。
  - `EMP-006 孙八` 以有效热处理上岗证和班组长授权接管热处理替班复核。
  - `EMP-004 赵六` 保留工程放行与 SOP/炉批复核。
  - 生成审计编号 `AUD-LABOR-REASSIGN-20260520-001` 和追踪编号 `TRACE-LABOR-REASSIGN-WO-013-OP-10`。
- 替班候选继续接入班组排班、请假、加班和值班窗口：
  - `EmployeeAvailability` 记录日期、状态、窗口、可用工时和来源。
  - `EMP-006 孙八` 的加班窗口 `2026-05-20 18:00-22:00` 来自 `排班计划 SCH-LABOR-20260520-A`，会进入候选理由、替班审计原因和 OTD 证据。
  - `EMP-009 高十一` 虽具备 `热处理上岗证` 且与风险人员同班组/同班次，但因 `请假单 LEAVE-20260520-009` 和 `capacityHours=0` 被排除在替班候选之外。
- 当无有效替班候选时，`人员管理` 会生成审计编号 `AUD-LABOR-BLOCK-20260520-001` 和追踪编号 `TRACE-LABOR-BLOCK-WO-013-OP-10`，提示必须停工复核而不是自动放行。
- 复核重新放行后，`人员管理` 明确显示补证改派结果，生产侧读取 `EMP-006 孙八` 的 `AUD-LABOR-RELEASE-20260520-001` 替班记录，不再继续读取 released 阻断作为开工禁用条件。
- `EMP-006` demo 人员补充 `热处理` 技能、有效 `热处理上岗证` 与加班窗口，候选排序可展示“热处理技能匹配 / 同证书有效 / 班组可调配 / 班次可调班 / 加班窗口”。
- `生产报工` 热处理开工会读取替班记录：
  - 有替班记录时，开工校验从“临期可开工”变为“替班已确认”。
  - 开工确认后写入 `生产开工` 阶段证据 `TRACE-LABOR-REASSIGN-WO-013-OP-10-START`。
  - 有阻断记录时，开工校验变为“停工复核”，工序约束显示 `人员: EMP-003 停工复核`，确认开工按钮禁用。
  - 阻断状态为 `reviewing` 时仍然禁用开工，但显示“主管复核中”；状态转为 `released` 后恢复读取替班记录并允许确认开工。
- `AI 排产` 读取同一替班记录：
  - 工程约束解释把人员能力约束更新为替班复核状态。
  - 事件队列新增“人员替班事件”，可生成开工复核建议。
  - 有阻断记录时，工程约束解释更新为“无有效替班候选”，事件队列新增“人员资质阻断事件”，Agent 建议保持热处理工序冻结并升级主管复核。
  - 阻断进入 `reviewing` 时，事件队列会显示“主管复核中”；重新放行后，排产解释回到“人员替班事件”。
- `生产报工` 开工弹窗增加视口高度限制和内部滚动，避免替班校验内容增多后确认按钮不可点击。
- 新增 e2e 覆盖：
  - `Employee 人员能力约束 › 按技能班组班次证书和排班可用性推荐替班候选`
  - `Employee 人员能力约束 › 排班请假人员不进入替班候选`
  - `Employee 人员能力约束 › 无有效替班候选时生成停工复核阻断`
  - `Employee 人员能力约束 › 停工复核经主管补证改派后重新放行生产与排程`
  - `Employee 人员能力约束 › 资质临期生成替班建议并进入报表与审计回放`
  - `Production 生产看板 › 热处理开工读取人员替班建议并写回 OTD 证据`
  - `Production 生产看板 › 热处理无有效替班候选时阻断确认开工`
  - `Scheduling 排产甘特图 › 人员替班证据释放排产人员约束`
  - `Scheduling 排产甘特图 › 人员无有效替班候选时排产保持停工复核事件`

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：passed。
- `npm run test:e2e -- tests/e2e/employee.spec.ts`：7 passed。
- `npm run test:e2e -- tests/e2e/production.spec.ts tests/e2e/scheduling.spec.ts --grep "异常上报后能在异常管理|人员替班证据释放排产人员约束"`：2 passed。
- `npm run test:e2e -- tests/e2e/production.spec.ts`：20 passed。
- `npm run test:e2e -- tests/e2e/employee.spec.ts --grep "无有效替班候选"`：1 passed。
- `npm run test:e2e -- tests/e2e/employee.spec.ts --grep "重新放行"`：1 passed。
- `npm run test:e2e -- tests/e2e/employee.spec.ts tests/e2e/production.spec.ts tests/e2e/scheduling.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`：60 passed。

## 后续

- 把当前前端演示排班字段升级为后端排班日历、请假/加班审批和可用工时接口。
- 把停工复核处置状态机从前端本地证据升级为后端审批流，接入真实人员证书、排班可用性和审批权限。
