# 2026-06-20 Issue: 残缺后端审批记录可误放宽质量实验门禁

## 现象

`readAgentConfigApprovalsBackendFirst()` 旧逻辑会把后端返回的 partial approval 与默认记录合并。若后端只返回：

```json
{
  "id": "cfg-quality-experiment-gate",
  "status": "approved",
  "decidedBy": "backend",
  "decidedAt": "2026-06-15T10:00:00.000Z",
  "submittedAt": "2026-06-15T08:00:00.000Z"
}
```

则默认记录的完整策略字段会被保留，同时状态变为 approved，导致质量实验扩大门禁 `effective: true`。

## 影响

这会制造审计假阳性：页面/回放看起来拥有完整门禁说明，但真正来自后端的审批证据并没有携带策略指标、控制摘要、责任人与风险说明。

## 修复

- 后端审批记录进入 merge 前必须通过完整字段校验。
- 质量实验门禁额外要求 `policyMetrics` 和 `controlSummary`。
- 无完整后端记录时回退本地/默认完整记录。

## 结果

残缺后端 approved 被忽略，质量实验门禁保持 reviewing；完整后端审批仍可覆盖旧本地状态。
