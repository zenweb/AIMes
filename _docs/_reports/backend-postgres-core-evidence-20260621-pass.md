# Backend PostgreSQL Core Evidence

- GeneratedAt: 2026-06-21T14:45:00+08:00
- Scope: Focused backend integration evidence for PostgreSQL-backed core persistence, inventory transaction atomicity, and concurrency conflict behavior.

## Command

```text
dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~CoreModulePersistenceRecoveryTests|FullyQualifiedName~InventoryTransactionRepositoryTests|FullyQualifiedName~ConcurrencyTokenTests" --no-restore /p:SkipFrontendBuildCopy=true
```

## Result

```text
Passed: 7
Failed: 0
Skipped: 0
Total: 7
Duration: 18 s
```

## Covered Evidence

- `CoreModulePersistenceRecoveryTests`: verifies Anomaly/BOM/Employee/Inventory/Purchase data survives a recreated PostgreSQL-backed API host.
- `InventoryTransactionRepositoryTests`: verifies StockOut commits material decrement, stock transaction, and audit together, and rolls all back when transaction write fails.
- `ConcurrencyTokenTests`: verifies stale updates throw `DbUpdateConcurrencyException` for WorkOrder, Equipment, Material, and SchedulePlan.

## Boundary

- This is a focused integration slice, not the full backend test suite.
- It supports the architecture guard evidence but does not replace hosted CI for uncommitted dirty worktree changes.
