# 2026-06-12 Schedule Read Model Display Names

## Changed
- Fixed the scheduling read model so schedule items returned by `GET /api/v1/scheduling/current`, `GET /api/v1/scheduling/plans`, and `GET /api/v1/scheduling/plans/{id}` include `workOrderNumber` and `equipmentName`.
- Added unit coverage for `SchedulingAppService.GetPlanByIdAsync` to prove item display names are populated from work order and equipment repositories.
- Added controller integration coverage to prove the HTTP read model serializes the display fields needed by the real dhtmlx gantt task text.

## Why
- The real dhtmlx browser tests used route mocks with populated display names. A live backend read model could return empty task labels, which would make the real scheduling board less usable even though drag-save persistence worked.

## Evidence
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests.GetPlanByIdAsync_ShouldPopulateItemWorkOrderNumberAndEquipmentName"`: 1 passed.
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SchedulingAppServiceTests"`: 11 passed.
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests.GetPlanById_ShouldReturnItemDisplayNamesForRealGantt|FullyQualifiedName~SchedulingControllerTests.RescheduleItem_WhenSaved_ShouldPersistDraggedWindowToDatabaseAndPlanReadModel"`: 2 passed.
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~ArchitectureRuleTests"`: 113 passed.
