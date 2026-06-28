# 2026-06-20 Plan: Risk Action Trace Backend Fail Loud

## Objective

Bring risk action trace backend-first evidence reads in line with the current CC remediation pattern: ordinary demo/local reads may fall back, but audit refresh paths must fail loud on backend read failure or malformed backend payloads.

## Steps

1. Add RED coverage for `queryRiskActionTraces(..., { failLoud: true })`.
2. Add RED coverage for `readRiskActionTracesBackendFirst({ failLoud: true })` when the backend request fails.
3. Add RED coverage for non-array backend trace payloads.
4. Implement the minimal API and sync changes.
5. Verify with target tests, adjacent filtered tests, OTD evidence-chain sync, lint, and diff hygiene.

## Status

Completed for this slice on 2026-06-20.

## Boundaries

- No new user-facing feature scope.
- No Docker/PostgreSQL live runtime claim.
- No broad refactor of risk/report/audit components.
