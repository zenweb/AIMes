# 2026-06-20 Issue - POC Latest Seed Evidence

## Problem

Real browser scans showed repeated 404s for POC latest endpoints across dashboard, production, report, audit logs, admin, and scheduling pages.

## Root Cause

The backend already supported POC evidence persistence via `agent_evidence_links`, but current seeded data did not include a complete auditable POC latest chain.

## Resolution

- Added deterministic POC seed records for integration tests.
- Added the same POC records to the Docker recovery SQL.
- Executed the SQL against the current Docker PostgreSQL volume.

## Verification

- POC latest endpoints returned 200 in direct API checks.
- Real browser scans showed POC requests returning 200 and no request-error toast.

