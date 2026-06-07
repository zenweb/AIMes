# 2026-05-31 Sprint 4 LLM Cost Controls Issue

## 已处理

- 问题：Sprint 4 要求全局 `SemaphoreSlim` 限制 LLM 并发，但代码中没有统一闸门。
  - 处理：新增 `LlmConcurrencyGate`，并在 `LlmGatewayService` 入口统一调用。
- 问题：并发闸门如果放在 Agent 层会漏掉 `KnowledgeAppService` 等直接使用 `ILlmGateway` 的路径。
  - 处理：闸门下沉到 `ILlmGateway` 实现层，覆盖所有 LLM 生成与 embedding。
- 问题：等待闸门期间取消语义需要明确。
  - 处理：`WaitAsync(ct)` 直接传播 `OperationCanceledException`，测试覆盖。

## 未关闭的外部验证

- 真实 LLM provider 队列等待、超时和 resilience 组合行为仍需 staging 验证。
- 多实例部署如需跨实例限流，需要 Redis/分布式令牌桶等后续设计。
