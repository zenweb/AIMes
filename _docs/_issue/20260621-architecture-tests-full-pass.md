# 2026-06-21 Issue - Architecture Tests Full Pass

## Problem

Full ArchitectureTests initially failed on three guards because the guards still expected obsolete evidence strings.

## Impact

The architecture audit suite could not serve as a clean full-suite gate while guard expectations lagged behind stronger PostgreSQL-based evidence.

## Resolution

- Updated guard expectations for current evidence:
  - PostgreSQL restart-recovery host evidence.
  - Inventory `GetByCodeForUpdateAsync` atomic StockOut evidence.
  - PostgreSQL `updated_at = now()` stale-update concurrency evidence.
- Reran full suite.

## Status

Closed. Full ArchitectureTests pass 125/125.
