# 2026-06-07 Hosted CI root workflow local validation

## 变更

- 将 GitHub Actions workflow 从旧的 `v1/` 工作目录模型调整为仓库根目录模型。
- Hosted CI 覆盖 backend、frontend、container、security 和 Agent Evaluation。
- 增加 Cobertura 覆盖率阈值脚本：`scripts/check-cobertura-threshold.ps1`。
- 稳定两个前端 unit 测试：
  - `audit-decision-replay-panel.test.ts` 隔离 localStorage。
  - `use-export.test.ts` 不再依赖真实 1 秒定时器。
- `.gitignore` 忽略 frontend coverage 和根目录 `TestResults/`。

## 本地验证

- `dotnet restore src/backend/AIMes.slnx`: PASS
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore --configuration Release`: PASS
- `dotnet format src/backend/AIMes.slnx --verify-no-changes --no-restore`: PASS
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore --configuration Release`: PASS, 85 tests
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --configuration Release`: PASS, 434 tests
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release`: PASS, 175 tests
- `pwsh scripts/check-cobertura-threshold.ps1 -CoverageGlob "TestResults/**/coverage.cobertura.xml" -LineThreshold 10 -BranchThreshold 20`: PASS, line 14.61%, branch 30.72%
- `npm ci`: PASS
- `npm run lint`: PASS
- `npm run test:unit`: PASS, 596 tests
- `npm run test:unit:coverage`: PASS
- `npm run build`: PASS
- `npm audit --audit-level=high --registry=https://registry.npmjs.org`: PASS, 0 vulnerabilities

## 边界

- 本地默认 `npm audit` 因用户级 registry 指向 `https://registry.npmmirror.com` 而失败；该 registry 不实现 npm audit API。
- Hosted CI 仍需要 GitHub Actions 新 run 证明，不能只用本地验证关闭 release gate。
- 本地提交 `53393d2` 已创建；首次 push 到 GitHub `main` 因 github.com 443 连接失败未完成。
