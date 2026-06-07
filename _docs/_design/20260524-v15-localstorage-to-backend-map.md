# V1.5 localStorage To Backend Migration Matrix

> 任务：T-05A Frontend Demo State Migration Matrix  
> 日期：2026-05-24  
> 口径：先迁移 OTD 主线，不一次性迁移全部 `aimes_*` key。API 不可用时保留 demo fallback；API 可用时优先读后端。

## 迁移批次

| Batch | 范围 | 目标 |
|---|---|---|
| 0 | `aimes_token`、`aimes_refresh_token`、`aimes_user`、`aimes_dark` | 保持现状，不纳入 Agent 后端化 |
| 1 | 排产建议、OTD 证据链、设备停机、缺料齐套、质量返工、客户承诺包 | V1.5 首批后端化 |
| 2 | 生产异常、风险 SLA、外协、采购供应风险、工程约束 | Batch 1 稳定后迁移 |
| 3 | POC、知识治理、R3-R7、助手动作包、条码证据 | 后续按业务域拆分 |

## Batch 1 主线矩阵

| localStorage key | 业务含义 | 写入页面/工具 | 读取页面 | 目标后端表/API | fallback |
|---|---|---|---|---|---|
| `aimes_schedule_feedback_snapshot` | 排产建议采纳/调整快照 | `src/frontend/src/utils/schedule-feedback-sync.ts`、AI 排产页 | 排产、报表、审计 | `AgentDecision`、`AgentDecisionScenario`、`ScheduleAdoptionFeedback`；`POST /api/v1/scheduling/agent/*` | 保留 |
| `aimes_otd_evidence_chain` | OTD 证据链统一归档 | 报表、质量、扫码、设备、助手等多个页面 | 报表、审计、系统管理、助手 | `AgentEvidenceLink` + OTD evidence API；关联 `AuditLog`、业务对象 | 保留 |
| `aimes_equipment_downtime_event` | 设备停机对排产/OTD 影响 | `src/frontend/src/utils/equipment-risk-sync.ts`、设备页 | 排产、风险、报表、审计 | `AgentTriggerEvent(EventType=EquipmentFailure)`、`AgentDecision(BoundedContext=Scheduling)` | 保留 |
| `aimes_customer_equipment_fault_evidence` | 客户 POC 设备故障证据 | 设备/POC 场景 | 报表、审计、治理 | `AgentEvidenceLink(EvidenceType=Equipment)`、`AuditLog` | 保留 |
| `aimes_shortage_kitting_event` | 缺料齐套事件 | 库存/BOM/工程数据 | 排产、风险、报表 | `AgentTriggerEvent(EventType=MaterialShortage)`、Material/Kitting API | 保留 |
| `aimes_shortage_risk_resolution` | 缺料风险处置闭环 | 库存/采购/风险 | 报表、审计、治理 | `AgentActionResult(ActionType=CloseLoop)`、`AuditLog` | 保留 |
| `aimes_quality_rework_impact` | 质量返工对排产/OTD 的影响 | 质量页、助手 | 排产、报表、审计、助手 | `AgentTriggerEvent(EventType=QualityRework)`、`AgentEvidenceLink(EvidenceType=Inspection)` | 保留 |
| `aimes_quality_mrb_disposition` | MRB 报废补料/重排处置 | 质量页 | 排产、报表、审计 | Batch 1.5：`AgentActionResult` + Quality disposition API | 保留 |
| `aimes_otd_kpi_commitment_packages` | 客户交付恢复承诺包 | 报表、助手 | 排产、报表、审计 | `AgentDecision(DecisionType=ReviewPackage)`、CommitmentPackage API | 保留 |
| `aimes_bom_kitting_package` | BOM 齐套复核包 | 工程数据、助手 | 排产、库存、审计 | Batch 1.5：`AgentEvidenceLink(EvidenceType=Material)` | 保留 |

## 其余 key 归档分组

| 分组 | keys | 处理 |
|---|---|---|
| Auth/UI | `aimes_token`、`aimes_refresh_token`、`aimes_user`、`aimes_dark`、`aimes_e2e_storage_reset` | 不迁移到 Agent 模型 |
| 助手动作/Agent 配置 | `aimes_assistant_action_audits`、`aimes_assistant_recovery_packages`、`aimes_assistant_anomaly_packages`、`aimes_assistant_engineering_constraint_packages`、`aimes_agent_config_approvals` | Batch 3，目标 `AgentDecision(ExecutionPackage)` + `AuditLog` |
| 异常/监控/风险 | `aimes_anomaly_dispatch_records`、`aimes_monitoring_situation_escalations`、`aimes_production_anomaly_event`、`aimes_risk_action_traces`、`aimes_risk_sla_review` | Batch 2，目标 `AgentTriggerEvent` + `AgentActionResult` |
| 工程约束 | `aimes_engineering_change_impact_analysis`、`aimes_alternate_material_approval`、`aimes_route_capability_validation` | Batch 2，目标 `AgentEvidenceLink` + 工程审批 API |
| 采购/外协/供应 | `aimes_supplier_network_decision`、`aimes_supply_risk_escalation`、`aimes_outsourcing_commitment_packages` | Batch 2，目标 Purchase/Supplier risk API |
| POC | `aimes_customer_order_import`、`aimes_poc_pilot_run`、`aimes_poc_review_signoff`、`aimes_poc_rollout_package`、`aimes_poc_hypercare_acceptance` | Batch 3，目标 POC evidence API |
| 知识治理 | `aimes_quality_knowledge_samples`、`aimes_quality_knowledge_review_queue`、`aimes_quality_knowledge_recommendation_feedback`、`aimes_quality_knowledge_retraining_versions`、`aimes_quality_knowledge_gray_release_decisions`、`aimes_quality_knowledge_reuse_drafts`、`aimes_quality_knowledge_reuse_closures`、`aimes_knowledge_governance_reviews` | Batch 3，目标 Knowledge governance API |
| 现场条码/人员 | `aimes_barcode_scan_evidence`、`aimes_labor_reassignment`、`aimes_labor_qualification_block`、`aimes_quality_capa_closure` | Batch 3，按执行域迁移 |

## T-15 前端接入规则

1. 新 API client 必须先查后端；失败时再读现有 localStorage fallback。
2. 写入路径必须同时支持“后端成功写入”和“demo fallback 写入”，但 UI 上要标明数据来源。
3. 不允许组件内临时拼 URL 散接；统一放在 `src/frontend/src/api/*` 或对应 sync adapter。
4. 每迁移一个 key，补四类验收：权限拒绝、审计留痕、成功写入、重启后可查询。
