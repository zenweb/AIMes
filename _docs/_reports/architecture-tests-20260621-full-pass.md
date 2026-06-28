# Architecture Tests Full Pass

- GeneratedAt: 2026-06-21T14:40:00+08:00
- Scope: Full `MES.ArchitectureTests` suite after release-gate/staging evidence refresh and guard drift cleanup.

## Command

```text
dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --no-restore /p:SkipFrontendBuildCopy=true
```

## Result

```text
Passed: 125
Failed: 0
Skipped: 0
Total: 125
```

## Guard Drift Cleanup

- `Sprint0CoreModulePersistence_ShouldHaveRestartRecoveryEvidence` now expects the stronger PostgreSQL restart-recovery evidence (`PersistentPostgreSqlWebApplicationFactory` and `PostgreSqlIntegrationTestScope.RecreateDatabaseAsync`) instead of obsolete SQLite tokens.
- `Sprint2InventoryStockOutTransaction_ShouldHaveDirectAtomicEvidence` now expects `GetByCodeForUpdateAsync` and PostgreSQL integration scope evidence.
- `Sprint2ConcurrencyTokens_ShouldHaveDirectUpdateConflictEvidence` now expects PostgreSQL `updated_at = now()` version-bump evidence instead of obsolete `version = 1` SQL tokens.

## Boundary

- This proves architecture guard consistency only.
- It does not prove the full dirty worktree through hosted CI.
- Strict final v1.0.0 PASS remains unclaimed while gray observation is deferred.
