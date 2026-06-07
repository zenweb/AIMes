# V1.5 Capability: Demo State Backend Migration

## Scope

- Migration matrix: `_docs/_design/20260524-v15-localstorage-to-backend-map.md`.
- First backendized slice: Scheduling Agent decision read/write path.
- Frontend fallback remains in place when API or report JSON is unavailable.

## Current Backendized Keys

- Scheduling Agent recent decisions are read from `/api/v1/scheduling/agent/decisions`.
- OTD A/B report is read from `/reports/latest-ab-report.json`.

## Remaining Migration Batches

- OTD evidence chain.
- Equipment downtime package.
- Material kitting/shortage package.
- Quality rework package.
- Customer commitment package.

The matrix remains the source of truth; new frontend API migration should not scatter direct ad hoc calls outside the planned batches.
