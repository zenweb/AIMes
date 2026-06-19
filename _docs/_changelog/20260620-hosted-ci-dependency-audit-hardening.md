# 2026-06-20 Hosted CI Dependency Audit Hardening

## Changed

- Removed the Integration test project's SQLite dependency path that pulled `SQLitePCLRaw.lib.e_sqlite3 2.1.11` with advisory `GHSA-2m69-gcr7-jv3q`.
- Added `PostgreSqlIntegrationTestScope` so repository, transaction, concurrency, and persistence-recovery integration tests run on PostgreSQL instead of SQLite.
- Added a tracked material read path for inventory write operations, preserving no-tracking reads for query paths while avoiding PostgreSQL `xmin` concurrency failures during stock mutations.
- Added PostgreSQL service wiring to GitHub CI backend job so integration tests have the same relational provider expected by the hardened tests.

## Evidence

- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --no-restore --configuration Release /p:SkipFrontendBuildCopy=true`: 203 passed.
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore --configuration Release /p:SkipFrontendBuildCopy=true`: passed with 0 warnings.
- `dotnet list src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj package --include-transitive --vulnerable`: no vulnerable packages.
- `dotnet list src/backend/MES.Api/MES.Api.csproj package --include-transitive --vulnerable`: no vulnerable packages.
- `npm audit --registry=https://registry.npmjs.org`: found 0 vulnerabilities.
- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts`: 44 passed.
