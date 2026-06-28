# 2026-06-20 API 前端静态拷贝支持测试构建跳过

## 变更
- `src/backend/MES.Api/MES.Api.csproj`
  - `CopyFrontendBuild` 和 `PublishFrontendBuild` 增加 `SkipFrontendBuildCopy` 条件。
  - 默认构建仍在 `../../frontend/.output/public` 存在时复制前端静态文件。
  - 显式传入 `/p:SkipFrontendBuildCopy=true` 时跳过删除/复制 `wwwroot/scheduling`。
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`
  - 新增 `ApiProjectFrontendStaticCopy_ShouldBeSkippableForBackendTestBuilds` 架构测试，防止后端测试构建重新被前端静态目录占用影响。

## 验证
- RED：
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~ApiProjectFrontendStaticCopy_ShouldBeSkippableForBackendTestBuilds" --no-restore`
  - 先失败：`MES.Api.csproj` 不包含 `SkipFrontendBuildCopy`。
- GREEN：
  - 同一架构测试复跑：1 passed。
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.ExecutionEvidenceApi" --no-restore /p:SkipFrontendBuildCopy=true`：1 passed。
  - `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore`：0 warnings / 0 errors。
  - 不带跳过开关的 `ExecutionEvidenceApi` 集成测试复跑：1 passed。
  - `git diff --check -- src/backend/MES.Api/MES.Api.csproj src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`：仅 LF/CRLF 提示。

## 注意
- 曾并行运行多个 `dotnet` 构建，触发同一 `MES.Api/obj` 文件锁；后续验证改为串行后通过。
