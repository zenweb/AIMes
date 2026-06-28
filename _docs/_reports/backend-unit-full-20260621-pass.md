# Backend Unit Full Evidence

- GeneratedAt: 2026-06-21T14:55:00+08:00
- Scope: Full `MES.Tests.Unit` suite.

## Command

```text
dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore /p:SkipFrontendBuildCopy=true
```

## Result

```text
Passed: 452
Failed: 0
Skipped: 0
Total: 452
```

## Boundary

- This proves the full backend unit test project only.
- It does not replace integration tests, frontend tests, staging, or hosted CI evidence.
