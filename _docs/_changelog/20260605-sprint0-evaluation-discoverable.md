# 2026-06-05 Sprint 0 Evaluation Discoverable Changelog

## Change

- 复核 Sprint 0 待办中的 P1 项：`MES.Tests.Evaluation` 现已明确为 eval 门禁，并具备可发现测试。
- 依据当前验证结果，`dotnet test .\src\tests\MES.Tests.Evaluation\MES.Tests.Evaluation.csproj -c Debug` 已稳定返回 `2 passed`，不再是空门禁。

## Validation

- `dotnet test .\src\tests\MES.Tests.Evaluation\MES.Tests.Evaluation.csproj -c Debug`：2 passed。
- 该结论与 `20260530-sprint0-baseline.md` 中“Evaluation 测试项目没有形成有效测试门”的旧状态不同，计划文档已同步修正。

## Release Boundary

- 这只是 Sprint 0 文档收口，不关闭 hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察闸门。
