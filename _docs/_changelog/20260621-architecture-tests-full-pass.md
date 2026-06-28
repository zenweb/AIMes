# 2026-06-21 Changelog - Architecture Tests Full Pass

## Changed

- Updated three brittle architecture guards to match current stronger PostgreSQL-based evidence:
  - Core module persistence restart-recovery.
  - Inventory StockOut atomic transaction evidence.
  - Concurrency stale-update evidence.
- Added `_docs/_reports/architecture-tests-20260621-full-pass.md`.

## Verification

```text
dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --no-restore /p:SkipFrontendBuildCopy=true
```

Result: PASS, 125/125.

## Boundary

- This is an architecture audit consistency slice.
- It does not close dirty-worktree hosted CI coverage or gray observation.
