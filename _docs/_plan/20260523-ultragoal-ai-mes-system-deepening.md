# AIMes V1.5 Ultragoal 系统深化计划

> 日期：2026-05-23  
> 来源：`$ultragoal` 审计消化与续跑基线  
> 目标：把中断多次的 V1.5 功能切片收束成一套可验证、可演示、可继续后端化的 AI MES。

## 1. 审计消化结论

Claude Code 的主要落地是真的：后端 Agent 五表、EF 配置/迁移、排产 Agent API、权限矩阵、A/B runner、Monte Carlo、报告生成、前端报告读取都存在。不能成立的是“全部完成、全部验证通过”。

当前必须以真实验证为准：

| 项目 | 当前事实 | 处理口径 |
|---|---|---|
| 后端全量测试 | `PerformanceTests.GetAllPlans_Performance` 曾因冷启动/本机波动超过 1000ms | 性能测试先 warm-up 再计时，验证目标改为稳定请求耗时 |
| 前端 e2e | `purchase.spec.ts` 仍写死“延期减少 5 单”，外协释放流程中页面可显示 4 单 | 断言动态口径，避免旧硬编码阻断全量 e2e |
| A/B 数字 | 审计时曾确认为 40.00% -> 56.67%，后续真实 runner 刷新为 26.67% -> 30.00%，+3.33pt，p=0.7745 | README、复盘、脚本、字幕、能力文档统一采用当前 runner 输出 |
| 旧 OTD 文案 | 前端仍有 83.33% / 96.67% 话术 | 主演示链路和助手引用改为当前真实口径 |

## 2. Baseline

本计划以三份文档为基线，不再从零设计：

- `_docs/_plan/20260519-function-deepening-brainstorm.md`：V1.5 当前主线，定义“老板问题”：用了 AIMes 后 OTD 到底改善多少、为什么。
- `_docs/_plan/20260523-CC-v15-ai-deepening-audit.md`：T-00 到 T-28 的后端化、真实量化、测试稳定和演示资产任务框架。
- `_docs/_plan/20260523-v15-goal-continuation-ledger.md`：旧 `/goal` 中断后的恢复台账，标出 Done/Partial/Open 与风险。
- `_docs/_capability/*.md`：已实现能力的模块分册，用作“不重复造功能”的事实地图。

## 3. 收束后的产品主线

下一阶段不再把每个菜单平均加厚，而是把已完成能力压成一条可讲、可跑、可审计的演示路径：

```text
生产概览指挥中心
  -> 风险/异常/设备/缺料进入行动队列
  -> 调度员 Agent 生成多方案与执行包
  -> 人按权限采纳/拒绝/执行
  -> 生产/采购/设备/质量回写结果
  -> 审计回放串起输入、建议、动作、证据
  -> 报表中心读取真实 A/B 结果与 OTD 证据链
```

## 4. 系统深化工作包

| 工作包 | 目标 | 验收 |
|---|---|---|
| G1 审计红点清零 | 后端全量测试、前端全量 e2e、A/B 数字、旧 OTD 文案先收口 | `dotnet test src/backend/AIMes.slnx --no-build` 与 `npm run test:e2e` 不再因已知审计点失败 |
| G2 真实量化统一 | 所有销售/演示主口径只读 `latest-ab-report.json` 或同源 .NET runner 输出 | grep 不再命中主链路旧 `83.33% / 96.67% / 46.67% / p=0.4383` 口径 |
| G3 Agent 后端化加深 | 从排产 Agent 扩展到质量、采购、设备 execute 类动作的统一 policy/audit handler | 非授权执行被拒绝并写 `AgentPolicyRejected`；授权执行写 action result + audit log |
| G4 localStorage 分批迁移 | 按 `_docs/_design/20260524-v15-localstorage-to-backend-map.md` 迁移主线状态 | API 可用时优先后端；API 不可用时 fallback demo 仍可演示 |
| G5 可演示资产闭环 | 5 分钟 demo 脚本、字幕、截图和页面真实数字一致 | `demo-asset-capture.spec.ts` 通过；脚本数字与报告一致 |

## 5. 第一批已执行修复

- 创建 `.omx/ultragoal/` durable 账本，将本轮工作收束为聚合目标。
- 重跑 `scripts/run-ab-comparison.ps1`，早期确认报告为 40.00% -> 56.67%，p=0.1965；G5 刷新后当前真实报告为 26.67% -> 30.00%，+3.33pt，p=0.7745。
- 修正性能测试冷启动计时问题。
- 修正采购 e2e 对“延期减少”单数的硬编码断言。
- 同步 README、复盘审计、demo 脚本/字幕、能力文档和前端助手/报表/知识引用中的主 OTD 口径。
- 进入 G3 第一刀：统一 `ScheduleAgentService` 的 Agent action result + audit log 写入路径，并将 `AgentActionResult.AuditLogId` 回填到对应审计日志，支撑审计回放一跳关联。
- 进入 G4 第一刀：为 `aimes_schedule_feedback_snapshot` 增加后端最近反馈查询 API，报表中心优先读取后端 `ScheduleAdoptionFeedback`，失败时保留 localStorage demo fallback。
- 进入 G3 第二刀：`execute-maintenance-action` 支持带 `equipmentId/targetStatus` 的真实设备状态写入；成功后 `AgentActionResult` 与 `AuditLog.NewValues` 都保留 `businessWrite` 证据，审计回放可追到设备表变更。
- 进入 G3 第三刀：`execute-purchase-action` 支持带 `purchaseOrderId/materialCode/quantity` 的真实采购收货写入，`execute-quality-disposition` 支持带 `inspectionId` 的真实质检缺陷记录写入，两者均保留 `businessWrite` 证据。
- 进入 G4 第二刀：`aimes_otd_evidence_chain` 增加后端 `GET/POST /api/v1/scheduling/otd-evidence`，以 `AgentEvidenceLink` + `AuditLog` 承载 OTD 证据链；报表中心改为后端优先读取，失败时 fallback localStorage。
- 进入 G3/G4 连接刀：审计回放页读取后端 Agent execute 审计详情，解析 `businessWrite` 为“业务落库动作”卡片，并提供采购协同、质量闭环、设备维护的跳转入口。
- 进入 G4 第三刀：`aimes_equipment_downtime_event` 与 `aimes_customer_equipment_fault_evidence` 增加后端 evidence API，报表/设备页读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第四刀：`aimes_shortage_kitting_event` 增加后端 evidence API，排产事件队列读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第五刀：`aimes_shortage_risk_resolution` 增加后端 evidence API，生产概览与排产事件队列读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第六刀：`aimes_bom_kitting_package` 增加后端 evidence API，BOM 展开齐套包以 `AgentEvidenceLink` + `AuditLog` 持久化；BOM 页、库存齐套闭环页和排产事件队列读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第七刀：`aimes_supply_risk_escalation` 与 `aimes_supplier_network_decision` 增加后端 evidence API，供应延期升级、替代到货和供应商 SLA 选优以 `AgentEvidenceLink` + `AuditLog` 持久化；采购页与排产事件队列读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第八刀：`aimes_outsourcing_commitment_packages` 增加后端 evidence API，外协承诺、到货确认、排产释放整包以 `AgentEvidenceLink` + `AuditLog` 持久化；报表、采购、排产主线读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第九刀：`aimes_quality_rework_impact` 与 `aimes_quality_mrb_disposition` 增加后端 evidence API，质量返工排产影响、MRB 报废补料/闭环证据以 `AgentEvidenceLink` + `AuditLog` 持久化；质量页、排产事件队列和报表中心读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十刀：`aimes_alternate_material_approval`、`aimes_engineering_change_impact_analysis`、`aimes_route_capability_validation` 增加后端 evidence API，替代料放行、ECN 影响/审批、路线能力验证以 `AgentEvidenceLink` + `AuditLog` 持久化；BOM、工艺路线、排产主线读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十一刀：`aimes_production_anomaly_event`、`aimes_anomaly_dispatch_records`、`aimes_monitoring_situation_escalations`、`aimes_risk_sla_review`、`aimes_risk_action_traces` 增加后端 evidence API，异常上报、异常分流、现场态势升级、风险 SLA 复核和风险处置留痕以 `AgentEvidenceLink` + `AuditLog` 持久化；风险队列、异常管理、实时监控、排产、报表、系统治理、AI 助手、采购/设备/库存相关面板读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十二刀：`aimes_assistant_action_audits`、`aimes_assistant_recovery_packages`、`aimes_assistant_anomaly_packages`、`aimes_assistant_engineering_constraint_packages` 增加后端 evidence API，助手动作审计、交期恢复执行包、异常处置包、工程约束执行包以 `AgentEvidenceLink` + `AuditLog` 持久化；系统治理、审计回放、排产、风险、采购、质量相关面板读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十三刀：`aimes_customer_order_import`、`aimes_poc_review_signoff`、`aimes_poc_rollout_package`、`aimes_poc_pilot_run`、`aimes_poc_hypercare_acceptance` 增加后端 evidence API，客户工单导入、POC 复盘签署、上线行动包、真实工单试点运行和 Hypercare 验收以 `AgentEvidenceLink` + `AuditLog` 持久化；报表中心、系统治理、审计回放、生产概览、实时监控、生产报工、AI 排产和知识上传入口读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十四刀：`aimes_knowledge_governance_reviews` 增加后端 evidence API，RAG 文档复核、版本升级、有效期、引用范围和重建索引动作以 `AgentEvidenceLink` + `AuditLog` 持久化；系统治理与审计回放读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十五刀：`aimes_labor_reassignment`、`aimes_labor_qualification_block`、`aimes_barcode_scan_evidence`、`aimes_quality_capa_closure` 增加后端 evidence API，人员替班、资质阻断/复核放行、扫码到站/点检/批次复核、质量 CAPA 验证闭环以 `AgentEvidenceLink` + `AuditLog` 持久化；系统治理、扫码页、报表中心和审计回放读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十六刀：`aimes_agent_config_approvals` 增加后端 evidence API，Agent 配置变更、审批状态、决策人、策略指标和控制摘要以 `AgentEvidenceLink` + `AuditLog` 持久化；系统治理与审计回放读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十七刀：`aimes_otd_kpi_commitment_packages` 增加后端 list/latest/upsert evidence API，客户/产品/工厂维度的交付恢复承诺包、OTD 提升、延期减少、责任动作以 `AgentEvidenceLink` + `AuditLog` 持久化；报表中心与 AI 排产事件队列读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十八刀：`aimes_quality_knowledge_samples`、`aimes_quality_knowledge_reuse_drafts`、`aimes_quality_knowledge_reuse_closures`、`aimes_quality_knowledge_review_queue`、`aimes_quality_knowledge_retraining_versions`、`aimes_quality_knowledge_recommendation_feedback`、`aimes_quality_knowledge_gray_release_decisions` 统一接入 `quality-knowledge-evidence` envelope API，质量知识样本、复用、低分复核、再训练、推荐反馈和灰度决策以 `AgentEvidenceLink` + `AuditLog` 持久化；系统治理、审计回放、报表、质量 CAPA 与知识上传入口读取改为后端优先，失败时 fallback localStorage。
- 进入 G4 第十九刀：`aimes_schedule_feedback_snapshot` 已有 `schedule_adoption_feedbacks` 真实后端表与 latest API；本轮补齐 `ScheduleAdoptionFeedback` evidence 归档与 `ScheduleAdoptionFeedbackUpsert` 审计日志，使 Agent 推荐采纳反馈可以从业务表、证据链和审计日志三处回放。
- 进入 G5 第一刀：重跑真实 .NET A/B runner 后，当前主口径变为 `26.67% -> 30.00%`、`+3.33pt`、`p=0.7745`，Monte Carlo mean `+7.67pt`；README、前端报表/助手/知识引用、demo 脚本、字幕、截图说明和能力文档已同步，旧 `83.3% -> 96.7% / +13.3pt` 等演示口径 grep 清零。
- G5 截图 e2e 已增强：`demo-asset-capture.spec.ts` 从 `latest-ab-report.json` 读取预期值并断言 Dashboard/Report 页面数字，再刷新 5 张 demo 截图，避免截图和报告数字漂移。
- 进入 G5 第二刀：审计回放 e2e 的后端 Agent execute 用例扩展为采购收货、质量处置、设备状态三类真实业务落库动作，逐一验证回放卡、业务写入详情、归档文案和跳转入口。
- 进入 G5 第三刀：审计回放的业务落库跳转从“模块入口”推进到“具体业务对象定位”。采购、质量、设备三类 `businessWrite` 路由均携带 `auditObjectType/auditObjectId/auditObjectLabel/auditTraceId`，业务页显示审计定位横幅，并自动选中或注入对应对象详情。
- 进入 G5 第四刀：新增 `demo-smoke.spec.ts`，把 Dashboard -> Scheduling -> Audit -> Report 串成单条 5 分钟演示主链路烟测，覆盖首页 OTD 同源数字、后端 Agent 建议/采纳、审计回放和报表复盘。
- 进入最终质量门补漏：Dashboard、Report e2e 不再硬编码旧 A/B 数字，改为读取 `latest-ab-report.json`；Scheduling mock projection 同步当前 runner 口径，避免全量 e2e 被旧测试口径误杀。
- 最终前端 e2e 稳定化：Audit 回放定位、Chat 回放卡片、Report CSV 捕获和 Equipment 详情面板用例均已改为显式等待/精确定位；先验证 `npm run test:e2e` 为 `259 passed / 1 skipped / 0 failed / 0 flaky`，随后 Equipment 定向补漏为 `19/19 passed`，最终全量重跑为 `260 passed`，0 skipped / 0 failed / 0 flaky。
- 最终质量门复核：`dotnet test src\backend\AIMes.slnx --no-build -p:UseSharedCompilation=false` 已通过 `446/446`，`git diff --check` 无 whitespace error，final review 文档结论为 `APPROVE` / `CLEAR`；仅因 Codex App 会话缺少 goal snapshot 工具，OMX 外壳仍不能正式写入 complete checkpoint。

## 6. 下一步顺序

1. G4 扫尾结论：业务 `aimes_*` key 均已有后端优先 + fallback 或真实后端表 + evidence/audit 归档；剩余非业务 key（token/user/theme）保持前端本地状态。
2. G5 审计深链结论：采购/质量/设备后端 Agent execute 业务落库动作已能从审计回放卡片一跳定位到具体业务对象；列表查不到对象时使用“审计回放来源”占位详情保持可演示。
3. 若后续测试失败，按失败归属补入本计划，避免再形成无台账碎片。
4. G5 smoke 结论：Dashboard -> Scheduling -> Audit -> Report 已有单条自动化烟测覆盖。旧 A/B 数字测试口径已清零，Equipment 条件跳过已清零；前端全量 e2e 最新结果为 `260 passed`，后端全量测试最新结果为 `446/446 passed`。
5. 最终质量门结论：`git diff --check` 通过且仅有 CRLF warning；`_docs/_review/20260526-ultragoal-final-quality-gate-review.md` 给出 `APPROVE` / `CLEAR`；`.omx/ultragoal/final-quality-gate-20260526.json` 已记录结构化 quality gate。
6. OMX 状态说明：`omx ultragoal status` 仍显示 G001 in_progress，因为当前 Codex App 会话没有可用的 Codex goal snapshot；已按 repo-native `.omx/ultragoal/ledger.jsonl` 记录所有验证证据，暂不强行修改 OMX 目标状态。
