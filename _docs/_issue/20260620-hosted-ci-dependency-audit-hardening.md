# Issue: Integration SQLite Dependency Vulnerability

## Problem

`MES.Tests.Integration` resolved transitive package `SQLitePCLRaw.lib.e_sqlite3 2.1.11`, which NuGet audit reported as High severity under `GHSA-2m69-gcr7-jv3q`.

## Root Cause

Integration tests used `Microsoft.EntityFrameworkCore.Sqlite` for in-memory or temporary relational testing. Even after production/API dependency audit was clean, the integration test project still carried the vulnerable SQLite native dependency.

## Resolution

- Removed the SQLite package from the Integration test project.
- Migrated SQLite-backed integration tests to PostgreSQL through a shared test scope.
- Added CI PostgreSQL service support.
- Fixed inventory write-path tracking so PostgreSQL `xmin` concurrency behavior works under real relational testing.

## Verification

Local audit and tests are green. Hosted CI evidence still needs to be refreshed after push.
