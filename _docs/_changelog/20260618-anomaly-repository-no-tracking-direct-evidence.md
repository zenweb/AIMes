# 2026-06-18 Anomaly Repository No-Tracking Direct Evidence Changelog

## Change

- Extended `RepositoryAsNoTrackingTests.CoreRepositoryReads_ShouldNotTrackEntitiesInQueryContext` with direct `AnomalyRepository.GetAllAsync()` evidence.
- The test now proves anomaly dashboard/report reads do not leave tracked EF entities in the query context.
- No production code changed in this slice.

## Verification

- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj -c Release`
  - Result: PASS, `203 passed`
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj -c Release`
  - Result: PASS, `116 passed`

## Notes

- This closes the missing direct evidence gap for anomaly repository read tracking.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
