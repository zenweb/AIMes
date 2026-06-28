# Review: Test Project API Reference Skip Frontend Copy

## Scope
- Reviewed why broad and parallel backend test runs kept touching `wwwroot/scheduling`.
- Fixed test project references only; production build and publish frontend-copy behavior remain unchanged.

## Findings
- `MES.Api.csproj` already had a `SkipFrontendBuildCopy` switch.
- CI and scripts passed the switch, but direct test project references did not propagate it.
- Manual `dotnet test` therefore still risked deleting/copying frontend assets through the API project reference.

## Residual Risk
- Full integration suite remains too slow for this turn and was not claimed green.
- If a future test project references `MES.Api.csproj`, the new architecture rule should fail until it adds the same metadata.

