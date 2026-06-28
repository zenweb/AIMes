# 2026-06-21 Changelog - Backend Unit Core Evidence

## Changed

- Added `_docs/_reports/backend-unit-core-evidence-20260621-pass.md`.
- Captured focused backend unit evidence for inventory, operation sequencing, and domain state/rule behavior.

## Verification

```text
dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~InventoryAppServiceTests|FullyQualifiedName~OperationServiceTests|FullyQualifiedName~WorkOrderTests|FullyQualifiedName~EquipmentTests|FullyQualifiedName~MaterialTests|FullyQualifiedName~OperationExecutionStateMachineTests" --no-restore /p:SkipFrontendBuildCopy=true
```

Result: PASS, 105/105.

## Boundary

- This is a focused unit slice.
- It does not claim full unit suite or dirty-worktree hosted CI coverage.
