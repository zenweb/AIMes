# V1.5 Agent Permission Policy

> 任务：T-13A Agent Permission Policy  
> 日期：2026-05-24  
> 原则：AI 能建议，但不能越权执行。

## 动作分级

| 等级 | 动作 | 示例 | 权限要求 |
|---|---|---|---|
| SuggestOnly | 只生成建议 | 排产多方案、缺料风险解释、质量返工影响说明 | 登录用户可读，按模块权限过滤 |
| PendingApproval | 写入待审批 | 客户承诺包、工程约束复核包、MRB 补料处置包 | Planner/Quality/Purchase/Maintenance 按域提交，Admin 可提交 |
| AutoCloseLowRisk | 自动闭环低风险动作 | 生成证据链接、标记已读、追加审计摘要 | Service/Agent 可执行，但必须审计 |
| ExecuteBusinessChange | 改变业务状态 | adopt 排产方案、释放锁定期、采购确认、设备停机、质量放行 | Admin 或对应业务负责人审批 |

## 角色矩阵

| API/动作 | Admin | Planner | Quality | Purchase | Maintenance |
|---|---|---|---|---|---|
| 查看 Agent 建议 | 允许 | 允许排产域 | 允许质量域 | 允许采购域 | 允许设备域 |
| `recommend` | 允许 | 允许 | 允许质量触发 | 允许缺料触发 | 允许设备触发 |
| `adopt scheduling scenario` | 允许 | 允许 | 禁止 | 禁止 | 禁止 |
| `execute quality disposition` | 允许 | 禁止 | 允许 | 禁止 | 禁止 |
| `execute purchase action` | 允许 | 禁止 | 禁止 | 允许 | 禁止 |
| `execute maintenance action` | 允许 | 禁止 | 禁止 | 禁止 | 允许 |
| 修改 Agent 配置/策略 | 允许 | 禁止 | 禁止 | 禁止 | 禁止 |

## 审计字段

所有 Agent 写操作必须生成 `AuditLog`，至少包含：

- `actor`：当前登录用户或 service account。
- `initiatedBy`：`User` / `System` / `Agent` / `Service`。
- `businessKey`：例如 `WorkOrder:WO-DEMO-0012`。
- `traceId`：关联 `AiDecisionTraceEntity.TraceId`。
- `promptHash`、`contextHash`：来自 `AiDecisionTrace`。
- `decisionId`、`scenarioId`：采纳/拒绝时必填。
- `resultStatus`：成功、拒绝、失败、待审批。

## 拒绝也要留痕

非 Admin 用户调用 adopt/execute 类 API 被拒绝时，API 返回 403，同时写入 `AuditLog`：

- `Action = AgentPolicyRejected`
- `Resource = scheduling-agent` 或对应业务域
- `NewValues` 记录请求摘要、角色、拒绝原因、业务键、trace/hash

验收用例必须覆盖：权限拒绝、审计留痕、成功写入、重启后可查询。
