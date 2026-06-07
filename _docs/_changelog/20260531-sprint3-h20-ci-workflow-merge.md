# 2026-05-31 Sprint 3 H20 CI workflow 合并

## 变更

- 将 CI 主入口收敛到计划根目录 `C:\AIWorks\AIMes\.github\workflows\ci.yml`。
- 删除 `v1/.github/workflows/ci.yml`，避免 GitHub Actions 不识别的子目录 workflow 继续制造“双套 CI”错觉。
- 根 CI 继承子目录版本的主要质量门：
  - 后端 `dotnet restore` / `dotnet build`
  - `dotnet format --verify-no-changes --no-restore`
  - `MES.ArchitectureTests`
  - Unit / Integration tests
  - 前端 `npm ci` / `npm run lint` / `npm run build`
  - H22 跟进的 `docker build`
  - NuGet vulnerable package audit 与 `npm audit --audit-level=high`
- 新增 H20 架构门，持续检查根 CI 是否包含关键质量门，并防止 `v1/.github/workflows/ci.yml` 回流。

## 验证

- H20 架构门先红：旧状态因 `v1/.github/workflows/ci.yml` 仍存在而失败。
- 修复后：`dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter H20GitHubActions_ShouldUseSingleRootCiWorkflowWithRequiredQualityGates` 通过。
