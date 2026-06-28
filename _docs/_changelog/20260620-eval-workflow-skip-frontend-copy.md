# 2026-06-20 Agent Evaluation 工作流跳过前端静态拷贝

## 变更
- `.github/workflows/eval.yml`
  - Build 命令增加 `/p:SkipFrontendBuildCopy=true`。
  - Unit Tests / Evaluation Tests 命令增加 `/p:SkipFrontendBuildCopy=true`。
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`
  - `BackendTestEntrypoints_ShouldSkipFrontendStaticCopy` 扩展到 `eval.yml`。

## 验证
- RED：
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~BackendTestEntrypoints_ShouldSkipFrontendStaticCopy" --no-restore /p:SkipFrontendBuildCopy=true`
  - 先失败，指出 `.github/workflows/eval.yml` 缺少 `SkipFrontendBuildCopy`。
- GREEN：
  - 同一架构测试复跑：1 passed。
  - `dotnet test src/tests/MES.Tests.Evaluation/MES.Tests.Evaluation.csproj --no-build /p:SkipFrontendBuildCopy=true --verbosity quiet`：2 passed。
  - `rg -n "SkipFrontendBuildCopy|dotnet build|dotnet test" .github\workflows\eval.yml src\tests\MES.ArchitectureTests\ArchitectureRuleTests.cs` 确认命令和约束都在。
  - `git diff --check -- .github/workflows/eval.yml src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`：仅 LF/CRLF 提示。

## 影响
- Agent Evaluation 远端工作流与主 CI 后端测试入口保持同一稳定性策略，避免解决方案 build/test 因前端静态目录锁影响评估证据。
