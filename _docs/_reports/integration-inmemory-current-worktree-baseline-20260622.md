# Integration InMemory current-worktree baseline - 2026-06-22

## Scope

Sprint 0 task 0.0 current-worktree integration baseline for the InMemory-safe subset.

This run excludes PostgreSQL-dependent repository and persistence recovery tests because Docker Desktop Linux Engine was not reachable at the time of execution.

## Environment Check

```text
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine;
The system cannot find the file specified.
```

## Command

```text
cd C:\AIWorks\AIMes\v1
dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --filter "FullyQualifiedName!~Repositories&FullyQualifiedName!~CoreModulePersistenceRecoveryTests&FullyQualifiedName!~AnomalyTransactionTests"
```

## Result

PASS for the filtered InMemory-safe subset.

```text
Failed: 0
Passed: 196
Skipped: 0
Total: 196
Duration: 1 m 52 s
Target: MES.Tests.Integration.dll (net10.0)
```

## Boundary

- Covers current-worktree integration tests outside repository/PostgreSQL-dependent scopes.
- Does not prove PostgreSQL repository tests.
- Does not prove full integration baseline.
- Does not prove hosted CI or release readiness.

## Follow-Up Required

Restore Docker/PostgreSQL availability, then run the full integration project or the PostgreSQL-dependent repository subset separately.
