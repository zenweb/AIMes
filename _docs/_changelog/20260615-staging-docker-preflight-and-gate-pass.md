# 2026-06-15 staging Docker preflight and gate pass

- 修复 `scripts/run-staging-rehearsal.ps1` 的 Docker engine preflight：从 PowerShell `Wait-Process`/`Start-Process.ExitCode` 组合改为 `System.Diagnostics.ProcessStartInfo` + `WaitForExit(timeout)` + 真实 `ExitCode`，避免把已完成且可用的 `docker info` 误判为超时或 daemon 不可用。
- 新增架构回归测试 `StagingRehearsal_ShouldNotMisclassifyCompletedDockerInfoAsTimeout`，要求 staging preflight 使用带超时的进程模型并检查真实退出码。
- 重新运行 5003 staging rehearsal，生成 `_docs/_reports/staging-rehearsal-20260615-5003-docker-restored-pass-candidate.md`，结果 `PASS`；包含 Docker、外部依赖、EF migrations、API startup、`/live`、`/ready`、重排持久化探针和承诺包持久化探针。
- 重新运行 release gate audit，生成 `_docs/_reports/release-gate-audit-20260615-5003-docker-restored-pass-candidate.md`，结果 `PASS_WITH_DEFERRED_GRAY_OBSERVATION`。

验证：
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~StagingRehearsal_ShouldNotMisclassifyCompletedDockerInfoAsTimeout"`：PASS。
- PowerShell parser for `scripts/run-staging-rehearsal.ps1`：PASS。
- `run-staging-rehearsal.ps1 -ApiBaseUrl http://localhost:5003 -IncludeRescheduleProbe -IncludeCommitmentProbe`：PASS。
- `run-release-gate-audit.ps1 -DeferGrayObservation`：exit 0，报告 `PASS_WITH_DEFERRED_GRAY_OBSERVATION`。
