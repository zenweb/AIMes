# 2026-06-06 Staging Rehearsal Registry Diagnostics

## Changed

- `scripts/run-staging-rehearsal.ps1` 增加 `DockerPullTimeoutSeconds` 参数。
- staging rehearsal 报告新增 Docker registry/proxy diagnostics。
- 刷新 staging evidence packet：`_docs/_reports/staging-rehearsal-20260606-registry-diagnostics.md`。
- 刷新 release gate audit：`_docs/_reports/release-gate-audit-20260606-registry-diagnostics.md`。

## Tests

- PowerShell parser：PASS，`parse ok`。
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "StagingRehearsal|ReleaseGateAudit" --no-restore`：12/12 passed。
- `scripts/run-staging-rehearsal.ps1 -DockerPullTimeoutSeconds 25`：FAIL，失败点为 `docker pull postgres:16-alpine` 超时。
- `scripts/run-release-gate-audit.ps1 ... registry-diagnostics`：FAIL，5 个 B 轨道发布闸门仍未关闭。

## Release Gate Note

- 本次只提升 staging 阻断诊断质量。
- 不关闭 hosted CI、PostgreSQL/staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。
