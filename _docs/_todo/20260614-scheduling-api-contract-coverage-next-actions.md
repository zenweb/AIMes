# Next Actions - Scheduling API contract coverage

## Done
- Added direct contract coverage for the scheduling API helper surface.
- Verified related scheduling UI callers still pass.
- Ran full frontend unit coverage: 106 files / 786 tests passed; global line coverage 84.29%.

## Next
- Continue routing by coverage increment and user-criticality.
- Candidate next targets from the latest full coverage:
  - `AnomalyBoard.vue`: line coverage 77.64%, operationally critical dispatch/startup flows.
  - `ReportBoard.vue`: line coverage 78.54%, release-facing evidence/export flows.
  - `ProductionBoard.vue`: line coverage 79.16%, shop-floor execution path.
- Prefer slices with a real continuity, fail-loud, auditability, or user-decision gap.

## Deferred
- Do not immediately polish `scheduling.ts` further unless backend contract drift or missing endpoint evidence appears.
- Investigate `--localstorage-file` coverage warning separately.
