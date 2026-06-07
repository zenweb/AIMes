# 2026-05-31 Sprint 6 Code Hygiene Plan

## 本次切片

- 目标：修复 Scheduling evidence upsert 后 audit log 未持久化的问题，并保持审计/UoW 分层一致。
- 成功标准：代表性失败用例通过、`ScheduleAgentServiceTests` 通过、`SchedulingControllerTests` 全类通过、`MES.Application` build 无 warning/error。
- 约束：不回滚脏工作树，不并行运行同一 .NET 输出目录测试，不让仓储恢复自提交。

## 执行记录

- 红灯：`EquipmentEvidenceApi_ShouldUpsertQueryAndAuditDowntimeAndCustomerFault` 复现 evidence 已落库但 `AuditLogs` 为空。
- 根因：`WriteAuditAsync` 只 Add audit，未通过 UoW/SaveChanges 提交；evidence repository 自提交导致两类记录持久化语义不一致。
- 修复：`WriteAuditAsync` 通过 `_unitOfWork.ExecuteAsync(...)` 提交审计写入；单元测试 UoW mock 执行传入 action。
- 验证：代表性集成用例、`ScheduleAgentServiceTests`、`SchedulingControllerTests`、`MES.Application` build 均通过。

## 6.6 Notifications Store 切片

- 目标：补强前端关键全局 store 单测，并修复子路径部署下浏览器通知图标路径错误。
- 红灯：critical quality alert 触发 `Notification` 时收到 `/favicon.ico`，未使用 `/scheduling/` base path。
- 修复：`notifications.ts` 复用 `appAssetPath('favicon.ico')`。
- 验证：`notifications.store.test.ts` 和前端全量 `npm run test:unit` 均通过。

## 6.6 Quality CAPA Sync 切片

- 目标：补强质量闭环 sync util 单测，并保证后端不可用时仍能读取本地闭环证据。
- 红灯：`readQualityCapaClosureBackendFirst` 在后端失败时 reject，未 fallback localStorage。
- 修复：backend-first 读取 catch 后返回 `readQualityCapaClosure()`。
- 验证：`quality-capa-sync.test.ts` 和前端全量 `npm run test:unit` 均通过。

## 6.6 Equipment Risk Sync 切片

- 目标：补强设备风险 sync util 单测，并防止不完整设备停机记录污染排产/报告证据。
- 红灯：`readEquipmentDowntimeEvent` 返回缺少影响工单和维护策略的不完整记录。
- 修复：读取时校验 downtime 关键字段，缺失则清理 localStorage 并返回 `null`。
- 验证：`equipment-risk-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Shortage Risk Sync 切片

- 目标：补强缺料风险 sync util 单测，并保留 BOM 齐套包中的跨工单影响说明。
- 红灯：`writeBomKittingPackage` 派生的 shortage event 只记录单个 `workOrderNumber`。
- 修复：派生事件 `affectedOrders` 使用 `record.summary || record.workOrderNumber`。
- 验证：`shortage-risk-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Agent Config Approval Sync 切片

- 目标：补强 Agent 治理审批 sync util 单测，并防止损坏或非法本地 override 污染审批状态。
- 红灯：损坏 `aimes_agent_config_approvals` JSON 不会被清理，非法 `status: "bypassed"` 会覆盖默认审批状态。
- 修复：读取 override 时校验字符串 `id` 和合法审批状态，解析失败时清理本地键。
- 验证：`agent-config-approval-sync.test.ts` 通过，前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Risk SLA Review Sync 切片

- 目标：补强风险 SLA 晨会复核 sync util 单测，并防止不完整本地复核记录污染风险看板。
- 红灯：不完整 `aimes_risk_sla_review` 记录虽然读出为 `null`，但不会从 `localStorage` 清理。
- 修复：结构校验失败时移除 `aimes_risk_sla_review`，让坏结构和坏 JSON 采用同一 fail-loud 清理口径。
- 验证：`risk-sla-review-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Anomaly Dispatch Sync 切片

- 目标：补强异常分流 sync util 单测，并防止不完整分流记录污染异常看板和 OTD 证据链入口。
- 红灯：只有 `id/anomalyId/type/title/traceId` 的不完整记录会被当作有效异常分流返回。
- 修复：本地记录必须包含合法异常类型、责任人、影响工单、窗口、建议动作、审计 ID、状态标签和摘要；坏结构会被过滤并同步清理本地键。
- 验证：`anomaly-dispatch-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Labor Assignment Sync 切片

- 目标：补强人员资质/替班 sync util 单测，并防止不完整本地人员记录污染生产看板。
- 红灯：不完整 `aimes_labor_reassignment` / `aimes_labor_qualification_block` 记录会被过滤为空结果，但旧 localStorage 值不会清理。
- 修复：读取人员替班和资质阻断数组时，坏结构会被剔除并写回有效记录；全部无效时清理对应 key。
- 验证：`labor-assignment-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Barcode Scan Evidence Sync 切片

- 目标：补强扫码证据 sync util 单测，并防止不完整扫码追溯记录污染执行看板。
- 红灯：不完整 `aimes_barcode_scan_evidence` 记录会被过滤为空结果，但旧 localStorage 值不会清理。
- 修复：读取扫码证据数组时，坏结构会被剔除并写回有效记录；全部无效时清理对应 key。
- 验证：`barcode-scan-evidence-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Production Anomaly Sync 切片

- 目标：补强生产异常 sync util 单测，并防止损坏或不完整生产异常事件污染异常看板。
- 红灯：损坏 `aimes_production_anomaly_event` JSON 不会被清理，缺少工序/建议动作的不完整对象会被强转返回。
- 修复：读取生产异常事件时校验关键字段；坏 JSON 和坏结构都会清理本地 key。
- 验证：`production-anomaly-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Monitoring Situation Escalation Sync 切片

- 目标：补强现场态势升级 sync util 单测，并防止不完整处置包污染监控看板和 OTD 证据链入口。
- 红灯：只有少量字段的不完整 `aimes_monitoring_situation_escalations` 记录会被当作有效现场态势升级包返回。
- 修复：读取现场态势升级数组时校验责任、排产、风险、OTD、审计和状态字段；坏结构会被过滤并同步清理本地键。
- 验证：`monitoring-situation-escalation-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Assistant Action Audit 切片

- 目标：补强助手动作审计 sync util 单测，并防止损坏或不完整 audit 记录污染助手审计列表。
- 红灯：坏 `aimes_assistant_action_audits` JSON 不会清理；只包含 `id/actionId/auditCode` 的不完整记录仍会被返回。
- 修复：读取助手动作审计数组时校验合法 action type 和完整权限解释字段；坏 JSON、非数组和坏结构会清理或写回有效记录。
- 验证：`assistant-action-audit.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Assistant Recovery Package Sync 切片

- 目标：补强交期恢复执行包 sync util 单测，并防止不完整恢复包污染排产、采购、质量和 OTD 证据链看板。
- 红灯：只有少量字段的不完整 `aimes_assistant_recovery_packages` 记录会被当作有效恢复包返回。
- 修复：读取恢复包数组时校验责任、排产、风险、OTD、dispatch step 和创建时间字段；坏结构会被过滤并同步清理本地键。
- 验证：`assistant-action-package-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Assistant Anomaly Card Sync 切片

- 目标：补强助手异常处置包 sync util 单测，并防止不完整异常包污染生产异常、风险分流、排产复核和 OTD 证据链看板。
- 红灯：只有少量字段的不完整 `aimes_assistant_anomaly_packages` 记录会被当作有效异常处置包返回。
- 修复：读取异常处置包数组时校验责任、异常、设备、交付影响、排产窗口、dispatch step 和创建时间字段；坏结构会被过滤并同步清理本地键。
- 验证：`assistant-anomaly-card-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Assistant Engineering Constraint Package Sync 切片

- 目标：补强助手工程约束包 sync util 单测，并防止不完整约束包污染工程、工艺、质量门和 OTD 证据链看板。
- 红灯：只有少量字段的不完整 `aimes_assistant_engineering_constraint_packages` 记录会被当作有效工程约束包返回。
- 修复：读取工程约束包数组时校验责任、BOM、ECN、工艺路线、工序、OTD、dispatch step 和创建时间字段；坏结构会被过滤并同步清理本地键。
- 验证：`assistant-engineering-constraint-package-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 OTD KPI Commitment Sync 切片

- 目标：补强 OTD KPI 客户承诺包 sync util 单测，并防止不完整承诺包污染报表、聊天、排产和 OTD 证据链看板。
- 红灯：只有少量字段的不完整 `aimes_otd_kpi_commitment_packages` 记录会被当作有效客户承诺包返回。
- 修复：读取客户承诺包数组时校验维度、OTD 数值、责任、承诺、action 和创建时间字段；坏结构会被过滤并同步清理本地键。
- 验证：`otd-kpi-commitment-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Outsourcing Commitment Sync 切片

- 目标：补强外协承诺包 sync util 单测，并防止不完整承诺包污染报表、采购、排产和 OTD 证据链看板。
- 红灯：只有少量字段的不完整 `aimes_outsourcing_commitment_packages` 记录会被当作有效外协承诺包返回。
- 修复：读取外协承诺包数组时校验维度、OTD 数值、责任、承诺、外协伙伴、影响工单、action 和创建时间字段；坏结构会被过滤并同步清理本地键。
- 验证：`outsourcing-commitment-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 OTD Evidence Chain Sync 切片

- 目标：补强 OTD 证据链 sync util 单测，并防止不完整证据链记录污染所有依赖 OTD 镜像的前端看板。
- 红灯：不完整 `aimes_otd_evidence_chain` 记录会被过滤为空结果，但旧 localStorage 值不会清理。
- 修复：读取 OTD 证据链数组时，坏结构会被剔除并写回有效记录；全部无效或非数组时清理本地键。
- 验证：`otd-evidence-chain-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Customer Order Import Sync 切片

- 目标：补强客户工单导入 evidence sync util 单测，并防止坏本地导入证据污染知识上传、POC evidence governance 和报表看板。
- 红灯：损坏 `aimes_customer_order_import` JSON 不会被清理；缺少文件名/来源/映射字段等关键解释字段的不完整对象会保留在 localStorage。
- 修复：读取客户工单导入证据时校验批次、文件名、来源、订单/风险数量、映射字段和准备时间；坏 JSON 和坏结构都会清理本地键。
- 验证：`customer-order-import-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Engineering Change Sync 切片

- 目标：补强工程变更 sync util 单测，并防止坏本地工程证据污染 BOM、排产、聊天和 OTD 证据链看板。
- 红灯：不完整替代料批准、工程变更影响和工艺能力校验记录会被读取；工程影响记录还会被默认补齐，掩盖坏缓存。
- 修复：读取三类工程证据时校验完整对象、责任、影响、审计、状态和时间字段；坏结构都会清理对应本地 key。
- 验证：`engineering-change-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Knowledge Governance Sync 切片

- 目标：补强知识治理 sync util 单测，并防止不完整复核记录污染知识上传、审计回放、AI 引用和 OTD 证据链。
- 红灯：不完整 `aimes_knowledge_governance_reviews` 记录会被过滤为空结果或有效子集，但旧 localStorage 值不会清理/写回。
- 修复：读取知识治理复核数组时，坏结构会被剔除并写回有效记录；全部无效或非数组时清理本地键。
- 验证：`knowledge-governance-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 POC Hypercare Sync 切片

- 目标：补强 POC Hypercare sync util 单测，并防止坏上线验收记录污染生产概览、实时监控、报表、聊天问答和审计回放。
- 红灯：不完整 `aimes_poc_hypercare_acceptance` 记录会残留本地键；缺少 evidence/action 的监控或检查点子项会被当成有效验收记录。
- 修复：读取 POC Hypercare 验收记录时校验外层验收字段、监控指标字段和检查点动作字段；坏结构都会清理本地键。
- 验证：`poc-hypercare-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 POC Pilot Run Sync 切片

- 目标：补强 POC 试点运行 sync util 单测，并防止坏首批真实工单记录污染生产、排产、报表、聊天问答和 Hypercare 链路。
- 红灯：不完整 `aimes_poc_pilot_run` 记录会残留本地键；缺少产品/路线/采纳决策/evidence 的工单或检查点子项会被当成有效试点运行记录。
- 修复：读取 POC 试点运行记录时校验外层运行字段、真实工单字段和检查点证据字段；坏结构都会清理本地键。
- 验证：`poc-pilot-run-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 POC Review Signoff Sync 切片

- 目标：补强 POC 复盘签署 sync util 单测，并防止坏签署记录污染上线交付包、报表、聊天问答和审计回放。
- 红灯：损坏 `aimes_poc_review_signoff` JSON 不会清理；只有 meetingId/auditId 的不完整签署记录会被当成有效 POC 通过记录。
- 修复：读取 POC 复盘签署记录时校验评分、签署人、复核人、证据批次和摘要字段；坏结构都会清理本地键。
- 验证：`poc-review-signoff-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 POC Rollout Package Sync 切片

- 目标：补强 POC 上线交付包 sync util 单测，并防止坏交付行动污染报表、聊天问答和首批真实工单试点链路。
- 红灯：不完整 `aimes_poc_rollout_package` 记录会残留本地键；缺少 owner/action/dueAt/evidence 的行动项会被当成有效上线交付包。
- 修复：读取 POC 上线交付包时校验外层交付字段和每个行动项字段；坏结构都会清理本地键。
- 验证：`poc-rollout-package-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Quality Rework Sync 切片

- 目标：补强质量返工 sync util 单测，并防止坏返工影响记录污染质量、排产和 OTD 影响解释链路。
- 红灯：不完整 `aimes_quality_rework_impact` 记录会被直接强转返回；缺少产品、工序、设备、批次、缺陷数量、返工工时、根因或 evidence 仍被视为有效返工影响。
- 修复：读取返工影响时校验完整质量、排产、OTD、建议动作、根因、证据和创建时间字段；坏 JSON 与坏结构都会清理本地键。
- 验证：`quality-rework-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Quality MRB Disposition Sync 切片

- 目标：补强质量 MRB 处置 sync util 单测，并防止坏 MRB 记录污染质量、排产、采购和客户 OTD 说明链路。
- 红灯：不完整 `aimes_quality_mrb_disposition` 记录会被直接强转返回；缺少处置、状态、责任、OTD/排产影响、审计 trace 或 action evidence 仍被视为有效 MRB 处置。
- 修复：读取 MRB 处置时校验完整质量、处置、排产、审计、责任和 action 字段；坏 JSON 与坏结构都会清理本地键。
- 验证：`quality-mrb-disposition-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Quality Knowledge Sample Sync 切片

- 目标：补强质量知识样本 sync util 单测，并防止坏本地质量知识数组持续污染质量、聊天、报表和审计回放链路。
- 红灯：混合坏结构的 `aimes_quality_knowledge_samples`、`aimes_quality_knowledge_reuse_drafts`、`aimes_quality_knowledge_review_queue` 会被读取函数过滤返回，但旧 localStorage 值不会写回或清理。
- 修复：读取质量知识本地数组时统一校验并清理；混合坏结构写回有效记录，全部无效、非数组或坏 JSON 清理对应本地键。
- 验证：`quality-knowledge-sample-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Customer Equipment Fault Evidence 切片

- 目标：补强客户设备故障 POC 证据可信边界，防止坏设备样例污染 POC evidence governance、设备风险和排产事件联动链路。
- 红灯：只有 `batchId/equipmentCode` 的 `aimes_customer_equipment_fault_evidence` 会被当成有效客户设备故障样例返回。
- 修复：读取客户设备故障证据时校验文件来源、设备、样本数、影响工单、停机小时、采集信号和准备时间；坏结构清理本地键。
- 验证：`equipment-risk-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 POC Evidence Governance / Customer Order Import 切片

- 目标：补强 POC evidence governance 聚合输出单测，并防止客户工单导入字段映射缺失时进入验收证据链。
- 红灯：`mappedFields: []` 的 `aimes_customer_order_import` 会被当成有效客户工单导入证据返回，POC 清单无法审计字段血缘。
- 修复：客户工单导入证据要求 `mappedFields` 非空且每项为非空字符串；空映射清理本地键。
- 验证：`customer-order-import-sync.test.ts`、`poc-evidence-governance.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Customer Equipment Fault Signal Lineage 切片

- 目标：补强客户设备故障证据的遥测/点检信号血缘，防止无信号来源的设备样例进入 POC 证据治理。
- 红灯：`capturedSignals: []` 的 `aimes_customer_equipment_fault_evidence` 会被当成有效客户设备故障样例返回。
- 修复：客户设备故障证据要求 `capturedSignals` 非空且每项为非空字符串；空信号清理本地键。
- 验证：`equipment-risk-sync.test.ts`、前端全量 `npm run test:unit` 和 `npm run lint` 均通过。

## 6.6 Knowledge Citations / Quality Knowledge Evidence Lineage 切片

- 目标：补强聊天知识引用的质量样本证据血缘，防止缺少 CAPA 推荐、复用范围或证据 trace 的样本被标为正式可引用。
- 红灯：`capaRecommendations/reuseTargets/evidenceTraceIds` 为空数组的 `aimes_quality_knowledge_samples` 会让 `knowledge-citations` 返回 `可引用` 并生成空内容 citation。
- 修复：质量知识样本要求三类证据数组均非空且每项为非空字符串；坏样本由质量知识本地数组读取边界清理。
- 验证：`knowledge-citations.test.ts` 和 `quality-knowledge-sample-sync.test.ts` 均通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Gantt Mapper Conflict Window 切片

- 目标：补强甘特图排产冲突检测，防止长任务覆盖多个后续任务时只提示第一个冲突。
- 红灯：同一设备上一条 08:00-12:00 长任务覆盖 09:00-10:00 与 10:30-11:00 两条短任务时，第二条短任务没有冲突记录。
- 修复：`detectConflicts` 在每台设备内维护结束时间最晚的 active 任务，用 active window 检测后续重叠。
- 验证：`gantt-mapper.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Gantt Mapper Setup Time Lineage 切片

- 目标：补强甘特图任务换型准备时间血缘，避免小时级准备时间被审计成分钟级。
- 红灯：`setupTime: "1 小时 30 分钟"` 映射为 `setupMinutes: 1`，低估 89 分钟准备时间。
- 修复：`parseSetupTime` 支持小时/分钟组合，输出统一分钟数。
- 验证：`gantt-mapper.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Gantt Mapper Conflict Marker Lineage 切片

- 目标：补强 `planToGanttData` 的冲突字段契约，确保所有甘特图消费者都能审计时间重叠。
- 红灯：重叠任务在 mapper 输出中缺少 `hasConflict/conflictMessage`，只有主排产板后处理能标记冲突。
- 修复：计划映射阶段统一调用 `detectConflicts` 并把冲突说明写入任务。
- 验证：`gantt-mapper.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Gantt Mapper Dependency Link Dedup 切片

- 目标：补强甘特图依赖链接契约，避免重复依赖污染前后工序审计。
- 红灯：同一任务重复声明相同前序依赖时，mapper 输出两条相同 link。
- 修复：按 link id 去重，只为同一个 source/target 组合生成一条依赖链接。
- 验证：`gantt-mapper.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Gantt Mapper Invalid Time Window 切片

- 目标：补强甘特图任务时间窗口审计，避免结束早于开始的数据被最小展示时长掩盖。
- 红灯：异常时间窗口只输出 `duration: 0.01`，但没有 `hasConflict/conflictMessage`。
- 修复：异常时间窗口任务写入冲突标记和明确说明，仍保持最小展示宽度。
- 验证：`gantt-mapper.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Gantt Mapper Flat Task Invalid Time Window 切片

- 目标：让扁平甘特任务映射与分组计划映射共享异常时间窗口审计口径。
- 红灯：`itemsToFlatTasks` 对结束早于开始的任务只输出 `duration: 0.01`，没有冲突字段。
- 修复：flat task 保持最小展示宽度，同时写入 `hasConflict/conflictMessage`。
- 验证：`gantt-mapper.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Gantt Mapper Flat Task Setup Time Lineage 切片

- 目标：让扁平甘特任务映射保留换型准备时间，避免 flat task 视图/导出缺少 setup 审计字段。
- 红灯：`itemsToFlatTasks` 不输出 `setupMinutes`，`1 小时 30 分钟` 的换型信息丢失。
- 修复：flat task 复用 `parseSetupTime`，输出统一分钟数。
- 验证：`gantt-mapper.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Gantt Mapper Decimal Setup Time 切片

- 目标：让甘特图换型准备时间解析支持小数小时，避免 `1.5 小时` 被误读为 `5 小时`。
- 红灯：`setupTime: "1.5 小时"` 映射为 `setupMinutes: 300`，目标值应为 90。
- 修复：`parseSetupTime` 的小时/分钟单位解析支持小数，并用 `Number.parseFloat` + `Math.round` 输出分钟数。
- 验证：`gantt-mapper.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 CSV Export Header Escaping 切片

- 目标：补强前端 CSV 导出审计可信度，避免特殊字符表头破坏列结构。
- 红灯：`exportToCsv` 导出 `工单,编号`、`备注"说明`、含换行表头时，首行未按 CSV 规则转义。
- 修复：headers 和 rows 共用 `escapeCsvCell`，统一处理逗号、双引号和换行。
- 验证：`export.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 useExport CSV Header Escaping 切片

- 目标：补强排产计划和报表 CSV 导出入口，避免 `useExport.downloadCsv` 与 `exportToCsv` 的表头转义口径分裂。
- 红灯：`downloadCsv` 导出 `工单,编号`、`备注"说明`、含换行表头时，首行未按 CSV 规则转义。
- 修复：headers 和 rows 共用 `escapeCsvCell`，统一输出带引号 CSV cell。
- 验证：`use-export.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Shortage BOM Kitting Package Item Guard 切片

- 目标：补强缺料齐套本地证据可信边界，避免不完整 BOM item 污染排产/采购缺料面板。
- 红灯：`readBomKittingPackage` 会返回缺少物料名称、数量、单位和动作字段的坏 `items` 明细。
- 修复：读取 BOM 齐套包时校验外层字段和每条 item 明细，坏结构清理本地键。
- 验证：`shortage-risk-sync.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Shortage Resolution Guard 切片

- 目标：补强缺料闭环本地证据可信边界，避免不完整到货/释放记录污染闭环看板。
- 红灯：`readShortageRiskResolution` 会返回缺少影响订单、来源工单、单位、可用量、闭环时间和说明的坏记录。
- 修复：读取缺料闭环时校验关键字段，坏结构清理本地键。
- 验证：`shortage-risk-sync.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Auth Store Local User Cache Guard 切片

- 目标：统一 auth store 与其他前端入口的 `aimes_user` 解析规则，避免损坏身份缓存反复污染启动状态和审计 actor。
- 红灯：`auth.store.test.ts` 中 token 存在但 `aimes_user` 为坏 JSON 时，`useAuth().user.value` 为 `null`，但坏缓存没有清理。
- 修复：`auth.ts` 复用 `getLocalUser()`，并在恢复登录态前校验 `username/displayName/role/mustChangePassword` 完整；`local-user.ts` 暴露共享读取入口。
- 验证：`auth.store.test.ts` 与 `local-user.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Report Actor Local User Cache Guard 切片

- 目标：统一报表承诺包 actor 与其他前端身份入口的 `aimes_user` 解析规则，避免报表证据签名继续私有解析坏缓存。
- 红灯：`local-user.test.ts` 调用 `getLocalUserReportActor()` 失败，说明报表 actor 仍没有共享入口；`ReportBoard.vue` 仍直接 `JSON.parse(aimes_user)`。
- 修复：`local-user.ts` 新增 username 优先的 `getLocalUserReportActor()`；`ReportBoard.vue.currentActor()` 改为调用共享函数。
- 验证：`local-user.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 HTTP Refresh Response Guard 切片

- 目标：补强前端 refresh token 响应可信边界，避免坏续期响应污染 token 缓存并用无效 Authorization 重试业务请求。
- 红灯：`http-refresh.test.ts` 复现 refresh 返回缺 `token` 时，响应拦截器仍 resolve 并调用原请求重试。
- 修复：`performRefresh()` 写入 localStorage 前校验 refresh 响应必须包含非空 `token` 和 `refreshToken`；无效响应走 refresh 失败清理路径。
- 验证：`http-refresh.test.ts`、`auth.store.test.ts` 和 `local-user.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 HTTP Refresh Retry Header Guard 切片

- 目标：补强 refresh 成功后的原请求重放边界，避免异常 Axios config 缺少 headers 时误清登录态。
- 红灯：`http-refresh.test.ts` 复现原 401 请求无 headers 时，refresh 成功后仍 reject 原请求。
- 修复：写入新 Authorization 前初始化 `config.headers`。
- 验证：`http-refresh.test.ts`、`auth.store.test.ts` 和 `local-user.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 HTTP Request Authorization Header Guard 切片

- 目标：补强请求拦截器 token 注入边界，避免 config 缺少 headers 时请求在发出前崩掉。
- 红灯：`http-refresh.test.ts` 复现请求 config 无 headers 且存在 token 时，拦截器写 Authorization 抛错。
- 修复：请求拦截器写入 token 前初始化 `config.headers`。
- 验证：`http-refresh.test.ts`、`auth.store.test.ts` 和 `local-user.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 HTTP / SignalR Access Token Shared Guard 切片

- 目标：统一 HTTP 与 SignalR 的本地 access token 读取规则，避免空白 `aimes_token` 被当作可用凭据。
- 红灯：`auth-token.test.ts` 先失败于 `../../src/utils/auth-token` 缺失，确认共享读取入口尚未存在。
- 修复：新增 `getLocalAccessToken()`，空白 token 返回 `null`；HTTP 请求拦截器、通知 hub、Dashboard hub 和 Monitoring hub 均改为复用该入口。
- 验证：`auth-token.test.ts`、`http-refresh.test.ts` 和 `notifications.store.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Access Token Whitespace Normalization 切片

- 目标：补强共享 token guard 的输出契约，避免边界空白污染 HTTP Authorization 和 SignalR credential factory。
- 红灯：`auth-token.test.ts` 复现 `"  access-token  "` 被原样返回。
- 修复：`getLocalAccessToken()` 返回 trim 后的 token；全空白 token 保持 `null`。
- 验证：`auth-token.test.ts`、`http-refresh.test.ts` 和 `notifications.store.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Auth Boot / Router Token Guard 切片

- 目标：统一页面启动恢复登录态、路由守卫、HTTP 和 SignalR 的 access token 可用性判断。
- 红灯：`auth.store.test.ts` 复现空白 token 会恢复缓存用户；`router-auth.test.ts` 复现空白 token 会通过受保护路由。
- 修复：`auth.ts` 与 `router/index.ts` 改为复用 `getLocalAccessToken()`。
- 验证：`router-auth.test.ts`、`auth.store.test.ts` 和 `auth-token.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Router Role Whitespace Normalization 切片

- 目标：统一缓存角色与后端角色名的边界空白处理，避免角色路由授权误拒。
- 红灯：`local-user.test.ts` 复现 `"  Admin  "` 被原样返回。
- 修复：`getLocalUserRole()` 返回 trim 后的 role，并保留空白 role 为 `null`。
- 验证：`local-user.test.ts` 与 `router-auth.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Local User Actor Whitespace Normalization 切片

- 目标：统一本地身份 actor/displayName 输出，避免审计和报表签名写入边界空白。
- 红灯：`local-user.test.ts` 复现 `"  报表管理员  "` 被原样返回。
- 修复：`getLocalUserDisplayName()` 与 `getLocalUserReportActor()` 返回 trim 后的 displayName / username。
- 验证：`local-user.test.ts`、`auth.store.test.ts` 与 `router-auth.test.ts` 已通过；全量前端单测、lint 和 touched-file 审计待收尾执行。

## 6.6 Auth Boot Cached Identity Normalization 切片

- 目标：保证 auth store 启动恢复出的 `AuthUser` 使用归一化身份字段，避免缓存边界空白污染前端登录态和权限角色。
- 红灯：`auth.store.test.ts` 复现 `aimes_user` 中的 `"  alice  "`、`"  Alice Zhang  "`、`"  Engineer  "` 原样进入恢复用户。
- 修复：`local-user.ts` 在共享缓存读取边界 trim 非空 `username/displayName/role`，空白字段返回 `undefined` 供 auth store 完整字段校验拒绝。
- 验证：`auth.store.test.ts`、`local-user.test.ts` 与 `router-auth.test.ts` 已通过；前端全量 `npm run test:unit` `42 files / 199 tests passed`，`npm run lint` 通过，touched-file 审计未发现尾随空白或 diff-check 错误。

## 6.6 HTTP Refresh Token Whitespace Normalization 切片

- 目标：保证 refresh token 轮换写入和 401 重试使用归一化 token，避免后端异常空白响应污染凭据链路。
- 红灯：`http-refresh.test.ts` 复现 refresh 成功后重试 header 为 `Bearer   new-access-token  `。
- 修复：`performRefresh()` 在通过响应结构校验后 trim `token` 与 `refreshToken`，再写 localStorage 并返回 retry token。
- 验证：`http-refresh.test.ts`、`auth-token.test.ts` 与 `auth.store.test.ts` 已通过；前端全量 `npm run test:unit` `42 files / 200 tests passed`，`npm run lint` 通过，touched-file 审计待收尾执行。

## 6.6 Cached Refresh Token Whitespace Normalization 切片

- 目标：保证旧 refresh token 缓存进入认证端点前归一化，避免本地状态污染 `/auth/refresh` 请求体。
- 红灯：`http-refresh.test.ts` 复现请求体发送 `"  refresh-token  "`。
- 修复：`performRefresh()` 对旧 `aimes_refresh_token` 执行 trim，并把空白旧 token 当作无 refresh token 处理。
- 验证：`http-refresh.test.ts`、`auth-token.test.ts` 与 `auth.store.test.ts` 已通过；前端全量 `npm run test:unit` `42 files / 201 tests passed`，`npm run lint` 通过，touched-file 审计待收尾执行。

## 6.6 Backend Login Token Persistence Normalization 切片

- 目标：保证后端登录响应进入浏览器登录态和本地 token 缓存前归一化，避免凭据链路从首次登录开始带边界空白。
- 红灯：`auth.store.test.ts` 复现 `useAuth().login()` 返回 `"  backend-access-token  "`，localStorage 也保存带空白 token pair。
- 修复：登录成功构造 `AuthUser` 时 trim access token；`saveUser()` 写入 access token / refresh token 前统一 trim。
- 验证：`auth.store.test.ts`、`http-refresh.test.ts` 与 `auth-token.test.ts` 已通过；前端全量 `npm run test:unit` `42 files / 202 tests passed`，`npm run lint` 通过，touched-file 审计待收尾执行。

## 6.6 Frontend Unit Coverage CI Gate 切片

- 目标：把前端单测覆盖率纳入 npm 脚本和 CI frontend job，形成可复跑的最低覆盖率门禁。
- 红灯：`frontend-ci-coverage.test.ts` 复现 `package.json` 缺少 `test:unit:coverage`，CI workflow 也没有 coverage step。
- 修复：新增 `test:unit:coverage`、`@vitest/coverage-v8`、Vitest coverage 阈值配置，并在 CI frontend job 中追加 `Unit coverage` step。
- 修复：`.gitignore` 忽略 `src/frontend/coverage/`，让本地 coverage 报告保留为验证产物而非源码改动。
- 验证：`frontend-ci-coverage.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.05%`、branches `69.79%`、functions `60.77%`。
- 后续：逐步抬升 coverage threshold，并补 hosted CI、PostgreSQL/staging、灰度、安全签字和两周观察窗口等发布级证据。

## 6.6 Frontend Coverage Threshold Raise 切片

- 目标：把前端 coverage 门禁从初始 10% 安全线提升到当前本地基线可承受的 15%，增强 CI 防倒退能力。
- 红灯：`frontend-ci-coverage.test.ts` 复现 `vitest.config.ts` 未包含 `lines: 15` 等四个阈值，当前仍停留在 10%。
- 修复：`vitest.config.ts` 中 lines/branches/functions/statements threshold 统一提升到 `15`。
- 验证：`frontend-ci-coverage.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.05%`、branches `69.79%`、functions `60.77%`。
- 后续：继续补高价值页面/组件测试后再评估下一次 threshold 提升；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page Whitespace Credential Guard 切片

- 目标：把页面/组件测试推进到身份入口，阻止纯空白凭据进入 auth store 和后端登录链路，同时提升关键组件 coverage。
- 红灯：`login-page.test.ts` 复现空白用户名/密码提交时 `login('   ', '   ')` 被调用。
- 修复：`LoginPage.vue` 在提交入口 trim 用户名和密码；空白输入显示 `请输入用户名和密码` 并停止流程。
- 验证：`login-page.test.ts`、相邻 `auth.store.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.51%`，`LoginPage.vue` 行覆盖 `96.05%`。
- 后续：继续补登录页成功/失败/loading 状态，或转向其他 0 覆盖关键组件；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page Whitespace Submit Button Guard 切片

- 目标：让登录页视觉可提交状态与提交入口 trim 规则一致，避免空白凭据按钮可点击但逻辑拒绝的分叉体验。
- 红灯：`login-page.test.ts` 复现纯空白用户名/密码时 submit button 未禁用。
- 修复：`LoginPage.vue` 新增 `canSubmit` computed，按钮禁用条件使用 trim 后有效性。
- 验证：`login-page.test.ts`、相邻 `auth.store.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.51%`，`LoginPage.vue` 行覆盖 `96.06%`。
- 后续：继续补登录页成功/失败/loading 状态，或转向其他 0 覆盖关键组件；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Toast Container Alert Semantics 切片

- 目标：把全局通知组件纳入组件测试，保证错误反馈对辅助技术具备即时 alert 语义。
- 红灯：`toast-container.test.ts` 复现错误 toast 内容存在但找不到 `[role="alert"]`。
- 修复：`ToastContainer.vue` 按类型设置 `role` 和 `aria-live`；错误通知使用 alert/assertive，其他通知使用 status/polite。
- 验证：`toast-container.test.ts`、相邻 `notifications.store.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.70%`，`ToastContainer.vue` 行覆盖 `100%`。
- 后续：继续补非错误 toast 语义或转向其他 0 覆盖关键组件；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Toast Decorative Icon Semantics 切片

- 目标：补强全局 toast 的装饰性图标语义，避免辅助技术重复播报视觉符号。
- 红灯：`toast-container.test.ts` 复现 `.toast-icon` 缺少 `aria-hidden`，读取结果为 `undefined`。
- 修复：`ToastContainer.vue` 为 `.toast-icon` 设置 `aria-hidden="true"`，让标题、消息、role 和 live region 承担可访问语义。
- 验证：`toast-container.test.ts`、相邻 `notifications.store.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.70%`，`ToastContainer.vue` 行覆盖 `100%`。
- 后续：继续补 warning/info/success status 语义、多 toast 顺序或其他 0 覆盖关键组件；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Toast Atomic Live Region 切片

- 目标：补强 toast live region 的完整播报语义，避免动态通知只被辅助技术读出局部片段。
- 红灯：`toast-container.test.ts` 复现 warning toast 的 `aria-atomic` 缺失，读取结果为 `undefined`。
- 修复：`ToastContainer.vue` 为 `.toast-item` 设置 `aria-atomic="true"`，让标题和消息作为完整通知一起播报。
- 验证：`toast-container.test.ts`、相邻 `notifications.store.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.70%`，`ToastContainer.vue` 行覆盖 `100%`。
- 后续：继续补多 toast 顺序、自动移除语义或其他 0 覆盖关键组件；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page Error Alert Semantics 切片

- 目标：补强登录页校验错误的可访问性语义，避免身份入口错误只以视觉文本呈现。
- 红灯：`login-page.test.ts` 复现空白凭据错误文本存在，但无法通过 `[role="alert"]` 获取。
- 修复：`LoginPage.vue` 为 `.login-error` 设置 `role="alert"` 与 `aria-live="assertive"`。
- 附加锁定：成功路径测试确认带边界空白的有效凭据会 trim 后调用 auth store，并跳转 `/dashboard`；该断言立即通过，仅作为防回归。
- 验证：`login-page.test.ts`、相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.72%`，`LoginPage.vue` 行覆盖 `99.56%`。
- 后续：继续补登录页后端错误展示、loading 状态或其他 0 覆盖关键组件；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page Busy Submit Semantics 切片

- 目标：补强登录请求加载态的可访问性语义，避免身份入口 pending 状态只靠视觉文案表达。
- 红灯：`login-page.test.ts` 复现登录 pending 时按钮文案和禁用状态存在，但 `aria-busy` 缺失。
- 修复：`LoginPage.vue` 在 `loading` 为 true 时为 submit button 设置 `aria-busy="true"`。
- 验证：`login-page.test.ts`、相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.73%`，`LoginPage.vue` 行覆盖 `99.57%`。
- 后续：继续补登录页后端错误展示或其他 0 覆盖关键组件；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page Error Field Association 切片

- 目标：补强登录页错误提示与凭据字段的可访问性关联，让字段上下文能解释当前表单级错误。
- 红灯：`login-page.test.ts` 复现错误 alert 缺少 `id="login-error"`，输入框缺少 `aria-invalid` / `aria-describedby`。
- 修复：`LoginPage.vue` 为错误提示设置稳定 id，并在错误存在时让用户名/密码输入框指向该错误说明。
- 验证：`login-page.test.ts`、相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.74%`，`LoginPage.vue` 行覆盖 `99.58%`。
- 后续：继续补后端登录失败错误展示或其他 0 覆盖关键组件；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page Failed Login Password Clear 切片

- 目标：补强登录失败后的敏感输入状态处理，避免失败密码继续保留在页面状态中。
- 红灯：`login-page.test.ts` 复现登录失败后错误已显示、用户名保留、无跳转，但密码仍为 `wrong-password`。
- 修复：`LoginPage.vue` 在登录失败 catch 分支清空 `password`。
- 验证：`login-page.test.ts`、相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.74%`，`LoginPage.vue` 行覆盖 `100%`。
- 后续：评估失败后焦点管理或其他 0 覆盖关键组件；发布级外部 CI 与灰度观察证据仍不完整。

## 6.6 Login Page Failed Login Focus Recovery 切片

- 目标：补强登录失败后的键盘重试体验，让清空密码后的焦点回到密码输入框。
- 红灯：`login-page.test.ts` 复现登录失败后密码已清空，但 `document.activeElement` 仍是 `body`。
- 修复：`LoginPage.vue` 为密码输入框增加 `passwordInput` ref，失败路径设置焦点恢复标记，在 `finally` 结束后 `await nextTick()` 并聚焦密码框。
- 验证：`login-page.test.ts`、相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts`、`npm run test:unit:coverage`、全量 `npm run test:unit` 与 `npm run lint` 已通过；coverage total lines/statements `17.75%`，`LoginPage.vue` 行覆盖 `100%`。
- 后续：继续补其他 0 覆盖关键组件或登录页字段级错误策略；发布级外部 CI 与灰度观察证据仍不完整。
