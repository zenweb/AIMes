# 2026-06-05 QualityAgent Fail-closed Changelog

## 已完成

- `QualityAgent.InspectWithAIAsync()` 的失败语义由 fail-open 改为 fail-closed。
- 检索失败、LLM 返回空结果、LLM 抛错时，均返回保守不通过结果，并提示人工复核。
- `AiDecisionTrace` 对 fallback 结果继续记录为 `QualityReasoningFallback`，保持审计可追踪。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter FullyQualifiedName~QualityAgentTests --no-restore`：8 passed。
- `dotnet test src/backend/AIMes.slnx --no-restore`：全量通过。
