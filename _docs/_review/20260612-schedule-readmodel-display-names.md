# 2026-06-12 Schedule Read Model Display Names Review

## Scope
- Reviewed the scheduling read model used by the real dhtmlx gantt board.
- Product change is limited to application-layer DTO mapping and tests.

## Findings
- Fixed: schedule item DTOs were created without `WorkOrderNumber` and `EquipmentName`, which could make live backend gantt task labels empty even while mocked E2E looked correct.
- No new blocking issue found after targeted unit, integration, and architecture validation.

## Risk Notes
- The current implementation resolves related work orders/equipment per distinct id. This is acceptable for the current boutique slice and keeps repository boundaries intact. If plans grow large, a future optimization can add batch read-model queries.
- Live staging browser evidence is still a separate next slice; this fix removes a prerequisite display-data gap for that evidence.
