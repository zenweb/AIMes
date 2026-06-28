# 2026-06-20 后端测试入口统一跳过前端静态拷贝

## 变更
- `.github/workflows/ci.yml`
  - Architecture / Unit / Integration 三个后端测试命令增加 `/p:SkipFrontendBuildCopy=true`。
- `scripts/run-attack-chain-automated-evidence.ps1`
  - Attack Chain A/B/C 自动支持证据中的 integration/unit/architecture 测试命令增加 `/p:SkipFrontendBuildCopy=true`。
- `scripts/run-security-self-assessment.ps1`
  - 安全自评中的 unit/integration/architecture 测试命令增加 `/p:SkipFrontendBuildCopy=true`。
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`
  - 新增 `BackendTestEntrypoints_ShouldSkipFrontendStaticCopy`，约束 CI 与发布安全证据入口必须使用该开关。

## 验证
- RED：
  - `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~BackendTestEntrypoints_ShouldSkipFrontendStaticCopy" --no-restore /p:SkipFrontendBuildCopy=true`
  - 先失败，报告 `.github/workflows/ci.yml` 缺少 `SkipFrontendBuildCopy` token。
- GREEN：
  - 同一架构测试复跑：1 passed。
  - `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~SchedulingControllerTests.ExecutionEvidenceApi"`：1 passed。
  - `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true --filter "FullyQualifiedName~AgentPermissionPolicyTests"`：37 passed。
  - `rg -n "SkipFrontendBuildCopy|dotnet test" ...` 确认 CI 与两个脚本入口均带开关。
  - `git diff --check -- .github/workflows/ci.yml scripts/run-attack-chain-automated-evidence.ps1 scripts/run-security-self-assessment.ps1 src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`：仅 LF/CRLF 提示。

## 影响
- 后端 CI 与安全/攻击链证据脚本不再依赖前端静态文件复制 target，降低 `wwwroot/scheduling` 文件锁导致基线测试失败的风险。
- 默认 API build/publish 行为不变，前端构建产物存在时仍可复制。
