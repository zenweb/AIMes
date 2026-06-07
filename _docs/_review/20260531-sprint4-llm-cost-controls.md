# 2026-05-31 Sprint 4 LLM Cost Controls Review

## 结论

- 本地审计未发现 Sprint 4 LLM 成本项的剩余代码缺口。
- `SchedulingAgent` prompt token 预算已在 Sprint 1 完成，本轮复核并用架构门禁继续锁住。
- 全局并发闸门已放在 `ILlmGateway` 实现层，覆盖所有 Agent 共享的 text/json/embedding 出站调用。

## 覆盖点

- 闸门行为：最大并发占满时后续 LLM 请求排队等待。
- 取消行为：等待闸门期间取消会抛出 `OperationCanceledException`。
- 配置行为：`AI:Llm:MaxConcurrency` 有范围校验，默认值为 2。

## 剩余风险

- 尚未在真实 provider 上观测队列等待时间、吞吐和用户侧超时，需要 staging/灰度 telemetry 验证。
- 当前 gate 是进程内 singleton；多副本部署时仍是“每实例限流”，不是跨实例全局限流。
