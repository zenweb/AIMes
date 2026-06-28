# 2026-06-21 Operation Code Numeric Sequence Shared Rule

## Change
- Added `OperationCode.NumericSequence` as the shared operation ordering rule.
- Replaced duplicated private numeric extraction helpers in:
  - `OperationService`
  - `OperationRepository`
  - `SchedulingContextProvider`
- Added unit coverage for `OperationCode` numeric sequence extraction.

## Evidence
- RED: `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~OperationCodeTests"` failed before implementation because `OperationCode.NumericSequence` did not exist.
- GREEN:
  - `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~OperationCodeTests"` passed 4/4.
  - `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~OperationServiceTests"` passed 6/6.
  - `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~OperationRepositoryTests"` passed 2/2.
  - `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingContextProviderTests"` passed 1/1.

## Verification Boundary
- A previous full `MES.Tests.Integration` run timed out after 123 seconds and was interrupted by the owner; it is not counted as passing evidence.
- A transient Roslyn file lock was resolved with `dotnet build-server shutdown`, then focused tests were rerun serially.

