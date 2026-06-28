# Backend unit current-worktree baseline - 2026-06-22

## Scope

Sprint 0 task 0.0 current-worktree backend unit baseline.

This run verifies the current local backend unit test project. It is not a staged-only proof and does not replace integration, architecture, frontend, hosted CI, or release-gate evidence.

## Command

```text
cd C:\AIWorks\AIMes\v1
dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore
```

## Result

PASS.

```text
Failed: 0
Passed: 452
Skipped: 0
Total: 452
Duration: 1 s
Target: MES.Tests.Unit.dll (net10.0)
```

## Boundary

- Covers backend unit tests in `MES.Tests.Unit`.
- Does not prove integration tests.
- Does not prove architecture tests.
- Does not prove frontend tests.
- Does not prove hosted CI or release readiness.
