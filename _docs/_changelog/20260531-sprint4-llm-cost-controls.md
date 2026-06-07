# 2026-05-31 Sprint 4 LLM Cost Controls

## 变更

- 新增 `LlmConcurrencyGate`，以 `SemaphoreSlim` 实现全局 LLM 并发闸门。
- `LlmConfig` 新增 `MaxConcurrency`，默认 2，使用 `[Range(1, 32)]` 启动校验。
- `LlmGatewayService` 的文本生成、JSON 生成、embedding 生成统一通过全局闸门执行。
- `AddAIServices` 注册 singleton `ILlmConcurrencyGate`，确保所有 Agent 共享同一闸门。
- 开源构建排除新增 Pro-only gate 文件。
- 新增单元测试覆盖排队等待和等待取消；新增架构测试守住全局闸门与 `SchedulingAgent` prompt 预算。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~LlmConcurrencyGateTests|FullyQualifiedName~SchedulingAgentTests"`
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter "FullyQualifiedName~Sprint4LlmCostControls"`
