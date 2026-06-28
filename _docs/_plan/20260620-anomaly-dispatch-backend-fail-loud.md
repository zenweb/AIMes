# 2026-06-20 Plan: Anomaly Dispatch Backend Fail Loud

## Objective

Align anomaly dispatch backend-first reads with the CC remediation fail-loud evidence pattern: normal startup/demo reads may fall back, but audit refresh reads must surface backend outages and malformed backend payloads.

## Steps

1. Add RED API coverage for `queryAnomalyDispatchRecords(..., { failLoud: true })`.
2. Add RED sync coverage for backend failure under `readAnomalyDispatchRecordsBackendFirst({ failLoud: true })`.
3. Add RED sync coverage for non-array backend anomaly dispatch payloads.
4. Implement the minimal API/sync changes.
5. Verify target tests, filtered adjacent callers, lint, and diff hygiene.

## Status

Completed for this slice on 2026-06-20.

## Boundaries

- No new UI feature scope.
- No change to ordinary local/demo fallback semantics.
- No Docker/PostgreSQL live runtime claim.
