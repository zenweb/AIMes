# 2026-06-20 Plan: Equipment Evidence Backend Fail Loud

## Objective

Align equipment downtime and customer equipment fault evidence reads with the backend-first fail-loud pattern: normal reads may fall back, but audit refresh reads must surface backend outages and incomplete backend records.

## Steps

1. Add API RED coverage for `getLatestEquipmentDowntime(..., { failLoud: true })` and `getLatestCustomerEquipmentFault(..., { failLoud: true })`.
2. Add sync RED coverage for backend failures under `readEquipmentDowntimeEventBackendFirst({ failLoud: true })` and `readCustomerEquipmentFaultEvidenceBackendFirst({ failLoud: true })`.
3. Add sync RED coverage for incomplete latest backend records.
4. Implement the minimal API/sync changes.
5. Verify target tests, adjacent filtered callers, POC governance sync, lint, and diff hygiene.

## Status

Completed for this slice on 2026-06-20.

## Boundaries

- No new UI scope.
- No change to ordinary local/demo fallback behavior.
- No Docker/PostgreSQL live runtime claim.
