# 2026-06-14 Architecture Audit Sync

## Changed
- Updated architecture audit expectations to match the current signed security signoff packet.
- Added explicit `output/` evidence-reference wording to attack-chain and release-gate scripts, preserving existing repo-local evidence validation behavior.
- Re-ran architecture tests and release gate audit after the commitment persistence schema fix.

## Verification
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj` -> 114 passed.
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260614-after-architecture-audit-sync.md -HostedCiReportPath _docs/_reports/hosted-ci-20260611-v1-pass.md -StagingReportPath _docs/_reports/staging-rehearsal-20260614-commitment-persistence-current.md -AttackChainReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md -SecuritySignoffPath _docs/_review/20260607-security-signoff.md -GrayObservationReportPath _docs/_reports/gray-observation-20260611-observing.md -DeferGrayObservation` -> PASS_WITH_DEFERRED_GRAY_OBSERVATION.

## Notes
- No product behavior changed.
- Gray observation remains owner-deferred/skipped, not strict final PASS.
