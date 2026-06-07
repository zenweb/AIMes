# 2026-06-05 QualityAgent Fail-closed Next Actions

## 目标

- 将 `QualityAgent.InspectWithAIAsync()` 的 retrieval / LLM 失败语义从 fail-open 改为 fail-closed。
- 同步补齐单测，锁定失败时必须返回人工复核建议，不能继续标记为通过。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter FullyQualifiedName~QualityAgentTests --no-restore`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`

## 状态

- 已完成并验证通过。
