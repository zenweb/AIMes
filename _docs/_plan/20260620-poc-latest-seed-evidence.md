# 2026-06-20 Plan - POC Latest Seed Evidence

## Goal

Remove recurring POC latest backend 404s from user-critical routes by providing auditable seeded evidence instead of treating the POC chain as an empty optional state.

## Steps

1. Inspect POC API contracts, backend storage, and current real-browser 404 evidence.
2. Add a failing integration test for seeded POC latest evidence.
3. Seed deterministic `AgentEvidenceLink` records for review signoff, rollout package, pilot run, and hypercare acceptance.
4. Add equivalent Docker recovery SQL.
5. Run integration tests, execute SQL against Docker PostgreSQL, verify direct API reads, build frontend, and rescan real browser routes.

## Done Criteria

- All four POC latest endpoints return 200 in the Docker-backed API.
- Report/dashboard/production/audit/admin/scheduling routes no longer produce POC latest 404s.
- POC records include audit IDs and summaries suitable for release evidence review.

