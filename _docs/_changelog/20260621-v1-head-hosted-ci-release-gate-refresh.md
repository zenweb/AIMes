# 2026-06-21 Changelog - V1 Head Hosted CI Release Gate Refresh

## Changed

- Generated `_docs/_reports/hosted-ci-20260621-v1-head-pass.md` pinned to GitHub `V1` head `47d65547557a8a6cf035327ae94455a1a1285daf`.
- Generated `_docs/_reports/release-gate-audit-20260621-v1-head-deferred-gray-recheck.md` using the refreshed hosted CI packet.
- Updated the phase-one matrix and repo-local CC plan bridge to cite the latest committed-head hosted CI and release-gate packets.
- Extended `PhaseOneMatrix_ShouldReflectCurrentReleaseBoundaryEvidence` with the latest head SHA and CI/Eval run IDs.

## Verification

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\run-hosted-ci-evidence.ps1 -ReportPath _docs\_reports\hosted-ci-20260621-v1-head-pass.md -RunUrl https://github.com/zenweb/AIMes/actions/runs/27848757617 -RunId 27848757617 -CommitSha 47d65547557a8a6cf035327ae94455a1a1285daf -RemoteName github -Repository zenweb/AIMes -Branch V1 -Evidence "GitHub Actions CI run 27848757617 completed success on V1 head 47d65547557a8a6cf035327ae94455a1a1285daf; Agent Evaluation run 27848757651 also completed success on the same branch and head."
```

Result: PASS.

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\run-release-gate-audit.ps1 -ReportPath _docs\_reports\release-gate-audit-20260621-v1-head-deferred-gray-recheck.md -HostedCiReportPath _docs\_reports\hosted-ci-20260621-v1-head-pass.md -StagingReportPath _docs\_reports\staging-rehearsal-20260615-5003-docker-restored-pass-candidate.md -AttackChainReportPath _docs\_reports\attack-chain-verification-20260611-manual-verified.md -SecuritySignoffPath _docs\_review\20260607-security-signoff.md -GrayObservationReportPath _docs\_reports\gray-observation-latest.md -DeferGrayObservation
```

Result: PASS_WITH_DEFERRED_GRAY_OBSERVATION.

```text
dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter "FullyQualifiedName~PhaseOneMatrix_ShouldReflectCurrentReleaseBoundaryEvidence" --no-restore /p:SkipFrontendBuildCopy=true
```

Result: PASS, 1/1.

## Boundary

- This refresh proves the committed GitHub `V1` head only.
- Local uncommitted worktree changes still require a selected release-candidate slice, push, and fresh hosted CI evidence.
- Strict final v1.0.0 PASS remains unclaimed because gray observation is deferred.
