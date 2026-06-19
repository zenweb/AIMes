# Plan: Hosted CI Dependency Audit Hardening

## Goal

Make dependency audit evidence clean without hiding vulnerable test dependencies, and keep integration tests meaningful on the production relational provider.

## Steps

1. Reproduce the failing vulnerability audit for `MES.Tests.Integration`.
2. Identify all SQLite usages in integration tests.
3. Replace SQLite-backed relational tests with PostgreSQL-backed test scopes.
4. Remove `Microsoft.EntityFrameworkCore.Sqlite` from Integration tests.
5. Add CI PostgreSQL service for backend integration tests.
6. Verify NuGet audit, npm audit, backend build, full integration tests, and focused frontend employee/auth regressions.

## Status

- Implementation: complete locally.
- Local verification: complete and green.
- Hosted verification: pending push and GitHub Actions observation.
