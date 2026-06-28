# Next Actions - Report API contract coverage

## Done
- Added report API helper contract coverage.
- Verified ReportBoard unit regression remains green.
- Ran full frontend unit coverage: 107 files / 793 tests passed; global line coverage 84.31%.

## Next
- Continue routing by coverage increment and user-criticality.
- Candidate next targets from the latest full coverage:
  - `ProductionBoard.vue`: 79.16% lines, shop-floor execution path.
  - `BomBoard.vue`: 79.66% lines, material readiness and kitting path.
  - `PurchaseBoard.vue`: 78.50% lines, supplier collaboration and outsourcing path.
- Prefer a slice with a concrete continuity, fail-loud, auditability, or API contract gap.

## Deferred
- Do not immediately polish `ReportBoard.vue` again unless a new real defect appears; its CSV/evidence/fail-loud paths already have direct and Chromium evidence.
