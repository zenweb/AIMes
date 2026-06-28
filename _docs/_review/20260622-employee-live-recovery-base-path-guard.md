# Employee live recovery base-path guard review - 2026-06-22

## Findings

- No blocking findings.
- Added a static architecture guard requiring `EmployeeBoard.vue` to build the live-backend recovery href with `appAssetPath`.
- The guard also requires `employee-board.test.ts` to keep both default `/scheduling/` and custom `/factory/scheduling/` assertions.

## Validation

- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~EmployeeLiveBackendRecoveryLink_ShouldUseConfiguredAppBasePath" --no-restore /p:SkipFrontendBuildCopy=true`: PASS, 1/1.
- `npm run test:unit -- tests/unit/employee-board.test.ts`: PASS, 21/21.

## Residual Risk

- The guard is static plus unit evidence; non-default prefix real-browser proof remains a future optional deployment-specific check.
