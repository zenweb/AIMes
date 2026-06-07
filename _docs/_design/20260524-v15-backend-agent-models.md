# V1.5 Backend Agent Models

> 任务：T-05 Backend Agent Model Design  
> 日期：2026-05-24  
> 前置约束：以 T-00 inventory 为准，排产 Agent 复用 `SchedulingAgent` + `SchedulingRuleEngine`。本文定义“事件 + 决策 + 证据”三层模型，排产只是第一个 bounded context。

## 目标

把 5/19-5/23 前端 `aimes_*` demo 状态机逐步后端化，让 Agent 触发、推荐、多方案、采纳/拒绝、执行结果、OTD 证据和审计回放都能持久化、可查询、可重放。

## 三层模型

### 1. AgentTriggerEvent

统一触发源，不把触发器写死为“排产事件”。

| 字段 | 含义 |
|---|---|
| `Id` | 事件 ID |
| `EventType` | `NewWorkOrder` / `RushOrder` / `EquipmentFailure` / `MaterialShortage` / `QualityRework` / `OutsourcingArrival` / `PocReview` / `KnowledgeGovernance` |
| `SourceModule` | `Scheduling` / `Risk` / `Equipment` / `Inventory` / `Quality` / `Purchase` / `Report` / `Knowledge` |
| `BusinessKeyType`、`BusinessKeyValue` | 工单、设备、物料、检验批、客户承诺包等业务键 |
| `Severity` | `Info` / `Warning` / `Critical` |
| `PayloadJson` | 触发上下文快照 |
| `OccurredAt`、`CreatedAt` | 业务发生时间与入库时间 |

### 2. AgentDecision

统一推荐、执行包、复核包和多方案决策。

| 字段 | 含义 |
|---|---|
| `Id` | 决策 ID |
| `TriggerEventId` | 关联 `AgentTriggerEvent` |
| `BoundedContext` | 首批为 `Scheduling`，后续扩展 `Quality`、`Inventory`、`Maintenance` |
| `DecisionType` | `Recommendation` / `ExecutionPackage` / `ReviewPackage` / `MultiScenario` |
| `Status` | `PendingReview` / `Adopted` / `Rejected` / `Executed` / `Closed` |
| `RecommendedScenarioId`、`AdoptedScenarioId` | 多方案推荐与采纳 |
| `AgentName`、`AgentVersion` | 例如 `SchedulingAgent`、`2.1.0-hybrid` |
| `TraceId` | 关联 `AiDecisionTraceEntity.TraceId` |
| `PromptHash`、`ContextHash` | 审计与重放入口 |
| `InputSummary`、`OutputSummary` | 人可读摘要 |
| `BusinessKey` | 冗余索引字段，用于查询 |

### 3. AgentDecisionScenario

多方案候选，不复制策略引擎。

| 字段 | 含义 |
|---|---|
| `Id` | 方案 ID |
| `AgentDecisionId` | 父决策 |
| `StrategyName` | `FCFS` / `EDD` / `WeightedComposite` / `LeastLoaded` / `AgentHybrid` |
| `PriorityRule`、`CapacityStrategy`、`Objective` | 复用现有规则引擎参数 |
| `TasksJson` | 排产任务或执行包动作列表 |
| `OtdProjection`、`UtilizationProjection`、`ChangeoverProjection` | 核心指标 |
| `Explanation` | Agent/规则解释 |
| `SacrificedObjectives` | 被牺牲的目标，如“换线增加 2h 换 OTD 提升” |

### 4. AgentEvidenceLink

连接 OTD 证据、审计日志、业务对象。

| 字段 | 含义 |
|---|---|
| `Id` | 链接 ID |
| `AgentDecisionId` | 决策 |
| `EvidenceType` | `OtdEvidence` / `AuditLog` / `WorkOrder` / `Equipment` / `Material` / `Inspection` / `CommitmentPackage` |
| `EvidenceKey` | 对应业务 ID 或 trace ID |
| `EvidenceSummary` | 证据摘要 |
| `CreatedAt` | 创建时间 |

### 5. AgentActionResult

采纳、拒绝、闭环、回写结果。

| 字段 | 含义 |
|---|---|
| `Id` | 结果 ID |
| `AgentDecisionId` | 决策 |
| `ActionType` | `Adopt` / `Reject` / `Execute` / `CloseLoop` / `WriteBack` |
| `ResultStatus` | `Succeeded` / `RejectedByPolicy` / `Failed` / `PendingApproval` |
| `Actor`、`Role`、`InitiatedBy` | 操作人、角色、触发主体 |
| `Reason` | 采纳/拒绝/失败原因 |
| `ResultPayloadJson` | 回写结果 |
| `AuditLogId` | 关联审计 |

## Scheduling First Flow

1. 前端或后端事件产生 `AgentTriggerEvent`：急单、设备故障、缺料、质量返工。
2. `ScheduleAgentService.RecommendAsync` 从现有 `SchedulingAppService` 数据装配逻辑构建同源 `ScheduleRequest`。
3. baseline runners 使用同一个 `ScheduleRequest` 调用 `SchedulingRuleEngine`，生成 FCFS、EDD、WeightedComposite、LeastLoaded 候选。
4. Agent 方案调用现有 `SchedulingAgent`：规则初排 + LLM 精调 + 约束验证。
5. 结果写入 `AgentDecision` + N 个 `AgentDecisionScenario` + `AiDecisionTraceEntity`。
6. 用户 adopt/reject/execute 走权限策略，写 `AgentActionResult`、`ScheduleAdoptionFeedback` 和 `AuditLog`。

## T-06/T-07 命名修正

原计划 `ScheduleAgentDecision` / `ScheduleScenario` 调整为：

- `src/backend/MES.Domain/Entities/Agent/AgentDecision.cs`
- `src/backend/MES.Domain/Entities/Agent/AgentDecisionScenario.cs`
- `src/backend/MES.Domain/Entities/Agent/AgentTriggerEvent.cs`
- `src/backend/MES.Domain/Entities/Agent/AgentEvidenceLink.cs`
- `src/backend/MES.Domain/Entities/Agent/AgentActionResult.cs`

排产上下文字段通过 `BoundedContext = Scheduling`、`StrategyName`、`PriorityRule`、`CapacityStrategy` 表达。

## 安全和审计口径

- Agent 默认只能生成建议。
- 自动闭环仅限低风险、幂等、无需业务状态变更的动作。
- 写入排产计划、采纳方案、执行闭环必须经过角色授权。
- 所有 Agent 写操作必须记录 `AuditLog`，字段包含 `actor`、`initiatedBy`、`businessKey`、`traceId`、`promptHash`、`contextHash`。
- 非 Admin 调用 adopt/execute 类 API 被拒绝时，也必须留审计。
