# BOM stale startup evidence clear next actions

Date: 2026-06-19

## Next actions

- Continue selecting slices by coverage leverage plus existing user-critical workflow value.
- Do not keep polishing `BomBoard.vue` unless the next issue protects BOM correctness, operator guidance, evidence freshness, or release/audit traceability.
- Candidate next areas from the current coverage profile: `ProductionBoard.vue`, `PurchaseBoard.vue`, `QualityBoard.vue`, or another proven low-coverage user-critical path.
- Keep Vitest coverage runs serial because `src/frontend/coverage/.tmp` is shared.
- Keep backend/staging work on `5003`, not `5000`.
- Do not claim strict v1.0.0 release readiness until gray observation is no longer deferred.
