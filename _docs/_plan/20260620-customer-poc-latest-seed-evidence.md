# 2026-06-20 Plan - Customer POC Latest Seed Evidence

## Goal

Remove customer POC latest background 404s from report, audit, admin, and equipment routes by seeding auditable customer import and customer equipment fault records.

## Steps

1. Inspect current DTOs, API contracts, and storage pattern.
2. Add a failing integration test for seeded latest customer POC evidence.
3. Seed deterministic records in `TestDataSeedFilter`.
4. Add equivalent records to Docker recovery SQL and execute it against local PostgreSQL.
5. Verify with integration tests, direct API calls, frontend build, and real browser route scans.

## Done Criteria

- `customer-order-import/latest` returns 200 in Docker-backed API and browser scans.
- `customer-equipment-fault/latest` returns 200 in Docker-backed API and browser scans.
- Seed records contain customer source data suitable for report/audit POC evidence.

