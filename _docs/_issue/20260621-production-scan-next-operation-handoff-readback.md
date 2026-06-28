# 2026-06-21 Issue - Production scan next-operation handoff readback

## Issue

The live production scan API returned only the current operation. When the frontend was made fail-loud and stopped relying on local demo maps, quality-pass barcode completion could not generate downstream handoff evidence unless the backend provided route-next-operation context.

## Impact

- Barcode completion evidence was incomplete for live backend-backed flows.
- Tests had to avoid asserting handoff when scan returned a single operation.
- The Production chain was less boutique-quality than the old demo-only behavior.

## Resolution

- Added backend `NextOperation` readback on scan.
- Seeded WO-013 downstream heat-treatment operation.
- Expanded frontend scanned operation chains from backend data.
- Restored handoff evidence coverage to `OP-20`.

## Remaining Scope

The overall CC remediation goal remains active. This issue only closes the production scan next-operation handoff slice.
