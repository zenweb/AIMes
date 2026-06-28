# 2026-06-21 Test Project API Reference Skip Frontend Copy

## Change
- Added `SkipFrontendBuildCopy=true` metadata to test project references that point at `MES.Api.csproj`.
- Added an architecture rule requiring future test projects to propagate the frontend static-copy opt-out when referencing the API project.

## Why
- Manual `dotnet test` runs without `/p:SkipFrontendBuildCopy=true` could still trigger `MES.Api.csproj` `AfterBuild` frontend static asset copy/clean.
- That made Sprint 0 baseline evidence vulnerable to `wwwroot/scheduling` directory races and Roslyn/build file locks.

## Evidence
- RED: `dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter "FullyQualifiedName~TestProjectReferencesToApi_ShouldPropagateFrontendCopyOptOut"` failed before adding metadata.
- GREEN:
  - Same architecture test passed 1/1.
  - `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~OperationRepositoryTests"` passed 2/2 without an explicit `/p:SkipFrontendBuildCopy=true`.
  - `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~OperationCodeTests"` passed 4/4 without an explicit `/p:SkipFrontendBuildCopy=true`.

