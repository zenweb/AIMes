# 2026-06-19 Plan - Labor Assignment Backend Partial Fallback

## Goal
Keep labor reassignment and qualification block evidence auditable when backend-first reads receive partial payloads.

## Steps
1. Confirm local labor storage already has runtime guards.
2. Add a failing test for partial backend reassignment and qualification block arrays.
3. Filter backend records through the existing guards and merge with local complete records.
4. Run focused labor assignment tests plus execution API and adjacent admin / production / schedule / chat regressions.

## Stop Condition
- Partial backend labor records cannot shadow complete local evidence.
- Complete backend labor records still participate in backend-first reads.
- Targeted tests pass and filtered verification scope is explicit.
