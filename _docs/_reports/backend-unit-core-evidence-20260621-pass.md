# Backend Unit Core Evidence

- GeneratedAt: 2026-06-21T14:50:00+08:00
- Scope: Focused backend unit evidence for inventory service behavior, operation service sequencing, and domain state/rule validation.

## Command

```text
dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~InventoryAppServiceTests|FullyQualifiedName~OperationServiceTests|FullyQualifiedName~WorkOrderTests|FullyQualifiedName~EquipmentTests|FullyQualifiedName~MaterialTests|FullyQualifiedName~OperationExecutionStateMachineTests" --no-restore /p:SkipFrontendBuildCopy=true
```

## Result

```text
Passed: 105
Failed: 0
Skipped: 0
Total: 105
```

## Covered Evidence

- `InventoryAppServiceTests`: inventory service stock-in/out, validation, and service-layer behavior.
- `OperationServiceTests`: operation scan and next-operation sequencing behavior.
- `WorkOrderTests`, `EquipmentTests`, `MaterialTests`, `OperationExecutionStateMachineTests`: domain state/rule validation.

## Boundary

- This is a focused unit slice, not the full unit suite.
- It complements, but does not replace, PostgreSQL-backed integration evidence or hosted CI for pushed heads.
