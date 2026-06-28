# 2026-06-21 Production operation sequence numeric order

## Changed

- Updated `OperationService` to order work-order operations by numeric sequence extracted from `OperationCode`.
- Work-order scan now selects the first existing operation through the same numeric ordering used for downstream `NextOperation`.
- Added regression coverage for non-padded operation codes where repository readback returns `OP-10` before `OP-2`; service now returns `OP-2` first and `OP-10` as next operation.

## Evidence

- `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~OperationServiceTests"` -> 6 passed.
- `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~ProductionControllerTests"` -> 6 passed.

## Notes

- A first parallel test attempt hit a transient Windows file lock on `MES.Application.dll`, reported as held by Microsoft Defender. The same unit command was rerun serially and passed.
