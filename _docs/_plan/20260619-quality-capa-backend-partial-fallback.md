# 2026-06-19 Plan - Quality CAPA Backend Partial Fallback

## Goal
Keep quality CAPA closure ownership, audit action, verification, OTD impact, and review evidence intact when backend latest-record reads receive partial payloads.

## Steps
1. Confirm local CAPA read path already has runtime validation.
2. Add a failing test where backend returns a partial latest CAPA closure.
3. Apply the same guard to backend-first reads before returning the record.
4. Run focused CAPA sync tests plus execution API, report, audit replay, and CAPA task regressions.

## Stop Condition
- Partial backend CAPA closures cannot replace local complete closure evidence.
- Complete backend CAPA closures remain valid.
- Targeted tests pass and filtered verification scope is explicit.
