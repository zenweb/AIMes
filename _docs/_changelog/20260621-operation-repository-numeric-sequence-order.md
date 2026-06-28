# 2026-06-21 Operation Repository Numeric Sequence Order

## Change
- Fixed `OperationRepository` so work-order operation reads return numeric operation sequence order.
- `GetFirstExecutionByWorkOrderIdAsync` now reuses the ordered list and returns `OP-2` before `OP-10` for non-padded operation codes.

## Evidence
- RED: `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~OperationRepositoryTests"` failed 2/2 with `OP-10` before `OP-2`.
- GREEN: same command passed 2/2 after the fix.
- Related checks:
  - `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~OperationServiceTests"` passed 6/6.
  - `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~ProductionControllerTests"` passed 6/6.
  - `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingContextProviderTests"` passed 1/1 after serial rerun.

## Note
- One parallel verification attempt hit a build-time `wwwroot/scheduling` directory cleanup race in `MES.Api.csproj`; the affected test was rerun serially and passed.

