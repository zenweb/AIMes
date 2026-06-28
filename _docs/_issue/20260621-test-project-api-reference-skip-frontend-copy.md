# Issue: Test Project API Reference Skip Frontend Copy

## Problem
Manual backend test runs could still trigger frontend static asset copy/clean because test project references to `MES.Api.csproj` did not propagate `SkipFrontendBuildCopy=true`.

## Impact
- `wwwroot/scheduling` could be deleted or copied while another test/build/dev server touched it.
- Sprint 0 baseline runs became slower and more fragile.
- The failure mode looked like business-test instability even when the real problem was build side effects.

## Resolution
- Added metadata to Unit, Integration, and Architecture test project references to `MES.Api.csproj`.
- Added architecture enforcement for future test projects.

## Verification
- New architecture rule failed before metadata and passed after metadata.
- Unit and Integration filtered tests passed without manually providing `/p:SkipFrontendBuildCopy=true`.

