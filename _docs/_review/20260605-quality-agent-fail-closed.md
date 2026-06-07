# 2026-06-05 QualityAgent Fail-closed Review

## 审计结论

- `QualityAgent` 的视觉检索与 LLM 失败路径原先返回 `IsPassed = true`，会把 AI 不可用伪装成通过。
- 已将失败语义改为保守不通过，并把 recommendation 统一成人工复核提示。
- 单测已验证：LLM 空结果、LLM 异常、检索异常均返回 `IsPassed = false`。

## 验证

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter FullyQualifiedName~QualityAgentTests --no-restore`：8 passed。
- `dotnet test src/backend/AIMes.slnx --no-restore`：431 unit / 174 integration / 85 architecture / 2 evaluation passed。
