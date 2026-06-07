# 2026-05-31 Sprint 3 H20 CI workflow 合并 Issue

## 已处理问题

- 根 CI 使用旧路径 `v1/src/...` / `v1/frontend/...`，与当前仓库真实结构不一致。
- 更完整的 CI 门禁留在 `v1/.github/workflows/ci.yml`，GitHub Actions 不会识别。
- 根 CI 缺少 `dotnet format --verify-no-changes`、ArchitectureTests、Docker build 等 Sprint 3 关键质量门。

## 剩余限制

- GitHub Actions 未在本地触发，无法确认 hosted runner 上的 Docker build 与 npm audit 结果。
- 若 `npm audit` 暴露前端传递漏洞，需要作为后续依赖治理项处理，不应再用 `|| true` 静默跳过。
