# 2026-05-31 Sprint 3 H20 CI workflow 合并 Review

## 结论

- H20 的核心问题是根 `.github/workflows` 与 `v1/.github/workflows` 双套定义冲突，其中子目录 workflow 不会被 GitHub Actions 生效。
- 现已保留一套根 CI，并将子目录 CI 中更完整的后端、前端、format、测试与安全门禁合并到根入口。

## 风险

- 当前环境无法实际触发 GitHub Actions，只做了静态架构门和本地 dotnet 验证。
- `container` job 依赖 GitHub hosted runner 的 Docker 能力；本机没有 Docker，真实 build 需要 CI 运行后确认。
- `npm audit --audit-level=high` 现在会阻塞 CI，可能暴露既有前端依赖漏洞；这是质量门的预期行为，但需要后续按审计结果处理。

## 已验证

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --filter H20GitHubActions_ShouldUseSingleRootCiWorkflowWithRequiredQualityGates`
