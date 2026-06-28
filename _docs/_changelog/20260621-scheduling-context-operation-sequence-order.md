# 2026-06-21 Scheduling Context Operation Sequence Order

## Change
- Fixed `SchedulingContextProvider` operation execution ordering so scheduling WIP and current execution snapshots use numeric operation sequence order.
- Non-padded operation codes such as `OP-2` now sort before `OP-10` inside the same work order.

## Evidence
- RED: `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingContextProviderTests"` failed with `{"OP-10", "OP-2"}`.
- GREEN: same command passed with 1/1 tests.
- Related chain checks:
  - `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~OperationServiceTests"` passed 6/6.
  - `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~ProductionControllerTests"` passed 6/6.

