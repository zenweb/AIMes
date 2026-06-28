# 2026-06-15 Engineering Constraint OTD Evidence Sync Issue

## Issue

`EngineeringConstraintPanel.vue` already had failure alert coverage, but the success path did not prove that BOM, route, and labor constraints were mapped to distinct OTD evidence statuses.

## Impact

- A regression could write labor qualification constraints as ready instead of active.
- A regression could lose trace ids or source object identity, weakening audit replay.

## Resolution

- Added a success-state test covering BOM, route, and labor constraints.
- Verified generated evidence ids, titles, source objects, trace ids, statuses, status labels, and success status announcement.

