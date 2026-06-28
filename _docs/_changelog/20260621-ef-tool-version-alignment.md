# 2026-06-21 Changelog - EF Tool Version Alignment

## Changed

- Updated repo-local `dotnet-ef` tool manifest from `9.0.0` to `10.0.9`.
- Added `EfToolManifest_ShouldMatchPinnedEfCoreRuntimeVersion` to keep `dotnet-ef` aligned with `Microsoft.EntityFrameworkCore`.

## Verification

```text
dotnet tool restore
```

Result: restored `dotnet-ef` `10.0.9`.

```text
dotnet ef --version
```

Result: `10.0.9`.

```text
dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter "FullyQualifiedName~EfToolManifest_ShouldMatchPinnedEfCoreRuntimeVersion" --no-restore /p:SkipFrontendBuildCopy=true
```

Result: PASS, 1/1.

```text
$env:ASPNETCORE_ENVIRONMENT='Production'; $env:ConnectionStrings__DefaultConnection='Host=localhost;Database=mes;Username=postgres;Password=postgres'; dotnet ef database update --project src/backend/MES.Infrastructure --startup-project src/backend/MES.Api
```

Result: PASS; no EF tools/runtime version skew warning.

## Boundary

- This is a DX/tooling consistency slice.
- It does not change migrations or production schema.
