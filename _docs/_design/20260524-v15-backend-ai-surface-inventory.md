# V1.5 Backend AI Surface Inventory

> 任务：T-00 Backend AI Surface Inventory  
> 日期：2026-05-24  
> 结论：V1.5 后端化必须复用现有 `SchedulingAgent`、规则引擎、`AdoptionFeedbackService`、`AiDecisionTraceEntity`、`AuditLog` 和 `/api/v1/scheduling/*` 端点，不从零另起一套排产 Agent。

## 盘点范围

| Surface | 当前路径 | 现状 | V1.5 决策 |
|---|---|---|---|
| 调度 Agent | `src/backend/MES.AI/Agents/SchedulingAgent.cs` | 已实现“规则初排 → LLM 精调 → 约束验证 → 失败回退规则引擎”，并生成 `AiDecisionTrace` | **复用并扩展**。T-05 只在其外层增加通用 `AgentDecision` 聚合，不绕开 Agent |
| 规则引擎 | `src/backend/MES.AI/Scheduling/SchedulingRuleEngine.cs` | 已支持 EDD/SPT/CR/FCFS/WeightedComposite、瓶颈权重调整、齐套过滤、设备匹配、换线成本 | **作为 baseline 和 Agent 初排统一底座** |
| 优先级排序 | `src/backend/MES.AI/Scheduling/PriorityRuleEngine.cs` | 已有 EDD/SPT/CR/WeightedComposite，FCFS 由默认原序保留 | **复用**。T-17 不新增平行策略体系 |
| 目标函数 | `src/backend/MES.AI/Scheduling/DueDateObjective.cs`、`ChangeoverObjective.cs`、`UtilizationObjective.cs`、`BalancedObjective.cs` | 已有 OTD、换线、利用率、均衡目标函数 | **复用**。A/B 解释引用这些目标函数 |
| Agent 适配器 | `src/backend/MES.AI/Adapters/ScheduleOptimizationAdapter.cs` | `IScheduleOptimizationService` 到 `SchedulingAgent` 的应用层适配 | **复用**。后续 Agent API 从同一请求模型构建 |
| 应用服务 | `src/backend/MES.Application/Services/SchedulingAppService.cs` | 负责取工单、设备、BOM/物料、调用优化服务、保存 `SchedulePlan`、记录采纳反馈 | **扩展**。新增 Agent 决策服务时复用其数据装配逻辑或抽出 shared builder |
| 排产 API | `src/backend/MES.Api/Endpoints/SchedulingEndpoints.cs` | 已有 `/optimize`、`/rule-based`、`/optimize-compare`、`/adoption-feedback` 等端点 | **扩展同一 group**。新增 `/agent/*` 端点必须挂在现有 scheduling group |
| 采纳反馈 | `src/backend/MES.AI/Scheduling/AdoptionFeedbackService.cs`、`src/backend/MES.Domain/Entities/Scheduling/ScheduleAdoptionFeedback.cs` | 已记录原方案、修改方案、原因、操作人、`AiTraceId` | **扩展**。增加 Agent 决策关联字段，不替换 |
| 决策追踪 | `src/backend/MES.Domain/Entities/AiDecisionTraceEntity.cs`、`src/backend/MES.AI/Services/AiTraceFactory.cs` | 已包含 agent/model/prompt/context hash、输入输出摘要、业务键字符串 | **扩展**。补强结构化 business key 和 `LinkedAgentDecisionId` |
| 审计 | `src/backend/MES.Api/Filters/AuditEndpointFilter.cs`、`src/backend/MES.Domain/Entities/AuditLog.cs` | 写操作过滤器已写 `AuditLog`，但未区分 Agent/Service 触发主体，也未记录 trace/prompt hash | **扩展**。Agent 写接口必须审计 actor、initiatedBy、businessKey、traceId、hash |

## 不应重复建设

1. 不新增独立 `BaselineSchedulingStrategy` 平行计算核心；baseline runner 只封装现有 `SchedulingRuleEngine` 参数组合。
2. 不新增只面向排产的 `ScheduleAgentDecision` 聚合根；V1.5 需要统一承接缺料、设备、质量、外协、POC、知识治理等事件，所以命名为 `AgentDecision`。
3. 不绕开 `/api/v1/scheduling/*` 另建第二套路由；排产 Agent 作为 scheduling bounded context 的扩展端点。
4. 不让前端直接把 localStorage 状态散接到临时 API；必须先按 T-05A 迁移矩阵分批迁移。

## 复用 / 扩展 / 废弃清单

| 类型 | 项 | 处理 |
|---|---|---|
| 复用 | `SchedulingAgent.OptimizeScheduleAsync` | Agent 推荐路径的唯一排产智能入口 |
| 复用 | `SchedulingRuleEngine.GenerateInitialScheduleAsync` | baseline runners 与 Agent 初排共用 |
| 复用 | `PriorityRuleEngine` + `CapacitySelector` | FCFS/EDD/WeightedComposite/LeastLoaded 等对比方案共用 |
| 复用 | `ScheduleOptimizationAdapter` | 应用层仍依赖 `IScheduleOptimizationService` |
| 扩展 | `ScheduleAdoptionFeedback` | 增加 `InitiatedByAgent`、`AgentDecisionId`、`AgentVersion` |
| 扩展 | `AiDecisionTraceEntity` | 增加 `BusinessKeyType`、`BusinessKeyValue`、`LinkedAgentDecisionId` |
| 扩展 | `AuditLog` | 增加 `InitiatedBy`、`TraceId`、`BusinessKey`、`PromptHash`、`ContextHash` |
| 新增 | `AgentTriggerEvent`、`AgentDecision`、`AgentDecisionScenario`、`AgentEvidenceLink`、`AgentActionResult` | 作为跨模块事件/决策/证据模型 |
| 废弃 | 独立 `ScheduleAgentDecision` 命名 | 由通用 `AgentDecision` 取代，排产只是 first bounded context |

## T-05 约束

T-05 后端模型设计不得绕开现有 `SchedulingAgent` 与规则引擎；验收时检查：

- 文档明确 `SchedulingAgent` 是排产 Agent 的执行核心。
- baseline 和 agent 对比都从同一 `ScheduleRequest` 或同源 `ScheduleOptimizationRequest` 构建。
- 多方案候选只记录策略参数、结果和解释，不复制一套排产计算核心。
- 所有 adopt/execute 类 API 必须走权限与审计策略。
