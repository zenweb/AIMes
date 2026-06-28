# Architecture current-worktree baseline - 2026-06-22

## Scope

Sprint 0 task 0.0 current-worktree architecture baseline.

This run verifies architecture rules against the current local backend assemblies. It is not a staged-only proof and does not replace unit, integration, frontend, hosted CI, or release-gate evidence.

## Command

```text
cd C:\AIWorks\AIMes\v1
dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --no-restore
```

## Result

PASS.

```text
Failed: 0
Passed: 125
Skipped: 0
Total: 125
Duration: 5 s
Target: MES.ArchitectureTests.dll (net10.0)
```

## Boundary

- Covers architecture tests in `MES.ArchitectureTests`.
- Does not prove backend integration behavior.
- Does not prove frontend behavior.
- Does not prove hosted CI or release readiness.
