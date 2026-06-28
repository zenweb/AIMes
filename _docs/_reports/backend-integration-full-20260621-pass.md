# Backend Integration Full Evidence

- GeneratedAt: 2026-06-21T15:00:00+08:00
- Scope: Full `MES.Tests.Integration` suite.

## Command

```text
dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore /p:SkipFrontendBuildCopy=true
```

## Result

```text
Passed: 216
Failed: 0
Skipped: 0
Total: 216
Duration: 2 m 14 s
```

## Boundary

- This proves the full backend integration test project only.
- It does not replace frontend tests, staging, hosted CI, or gray observation evidence.
