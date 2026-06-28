# 2026-06-21 Changelog - Worktree Inventory CI Boundary

## Changed

- Added `scripts/write-worktree-inventory-report.ps1` to size and bucket the local dirty worktree before making hosted CI coverage claims.
- Generated `_docs/_reports/worktree-inventory-20260621-current.md`.
- Ran `scripts/test-github-v1-push-readiness.ps1` and generated `_docs/_reports/github-v1-push-readiness-20260621-local-head.md`.
- Updated `_docs/_plan/20260514-cc-remediation-plan.md` to cite the worktree inventory boundary.
- Added `WorktreeInventory_ShouldExposeDirtyReviewSurfaceBeforeHostedCiClaims`.

## Verification

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\test-github-v1-push-readiness.ps1 -ReportPath _docs\_reports\github-v1-push-readiness-20260621-local-head.md
```

Result: PASS for committed local HEAD alignment with GitHub `V1` CI/Eval.

```text
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\write-worktree-inventory-report.ps1 -ReportPath _docs\_reports\worktree-inventory-20260621-current.md
```

Result: report generated.

```text
dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter "FullyQualifiedName~WorktreeInventory_ShouldExposeDirtyReviewSurfaceBeforeHostedCiClaims" --no-restore /p:SkipFrontendBuildCopy=true
```

Result: PASS, 1/1.

## Boundary

- GitHub `V1` matches committed local HEAD `47d65547557a8a6cf035327ae94455a1a1285daf`, and CI/Eval passed for that head.
- The dirty worktree is not covered by that hosted CI evidence.
- Transport checks in the readiness report did not prove reusable HTTPS or SSH push access.
