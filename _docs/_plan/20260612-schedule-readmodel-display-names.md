# 2026-06-12 Schedule Read Model Display Names Plan

## Objective
- Remove the live-backend display-data gap before pursuing live staging browser drag evidence.

## Success Criteria
- Schedule item DTOs returned from the application service include `workOrderNumber` and `equipmentName`.
- HTTP `GET /api/v1/scheduling/plans/{id}` serializes those fields.
- Existing drag-save persistence evidence remains green.
- Architecture rules remain green.

## Validation
- Unit read-model test passed after failing red first.
- Scheduling app service test group passed.
- Targeted scheduling controller integration tests passed.
- Architecture tests passed.

## Stop Condition
- Do not claim live staging browser evidence from this slice. That requires a dedicated run against rebuilt Docker API and PostgreSQL.
