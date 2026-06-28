# Next Actions - Anomaly API contract coverage

## Done
- Added anomaly API helper contract coverage.
- Verified `AnomalyBoard` unit regression remains green.
- Ran full frontend unit coverage: 106 files / 791 tests passed; global line coverage 84.31%.

## Next
- Continue routing by coverage increment and user-criticality.
- Candidate next targets from the latest full coverage:
  - `ReportBoard.vue`: 78.54% lines, release-facing evidence/export flows.
  - `ProductionBoard.vue`: 79.16% lines, shop-floor execution path.
  - `BomBoard.vue`: 79.66% lines, material readiness and kitting path.
- Prefer a slice with a concrete continuity, fail-loud, auditability, or API contract gap.

## Deferred
- Do not immediately polish `AnomalyBoard.vue` again unless a new real defect appears; its main startup/detail/dispatch fail-loud paths already have direct evidence.
