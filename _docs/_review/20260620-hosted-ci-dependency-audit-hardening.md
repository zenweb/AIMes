# Review: Hosted CI Dependency Audit Hardening

## Scope

- Integration test infrastructure moved from SQLite to PostgreSQL for tests that previously required relational behavior.
- Inventory stock mutation path now uses a tracked material lookup, while read-only material endpoints remain no-tracking.
- CI backend job now provisions PostgreSQL for integration tests.

## Findings

- No current NuGet vulnerability remains in `MES.Api` or `MES.Tests.Integration` under the verified package sources.
- PostgreSQL integration testing exposed a real `xmin` write-path issue in inventory stock mutations; this was fixed by separating read-only and write-intent material lookups.
- Full integration suite passed locally against PostgreSQL, so the SQLite removal is not only dependency-level cleanup.

## Residual Risk

- Hosted GitHub Actions still needs to be observed after push; local CI-equivalent evidence is green, but hosted evidence is not yet refreshed.
- Release completion remains unproven until the broader CC release gates are re-audited, including the user-deferred gray observation policy.
