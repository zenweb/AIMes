# 2026-06-15 Review: Equipment audit focus current work order coverage

## Findings

- Fixed a real auditability gap: audit replay could deep-link to a synthetic equipment object, but the selected detail panel did not show the trace/current-work-order reference.
- The production change is narrow: one overview row renders `selectedEq.currentWorkOrderId || '—'`.
- No unrelated refactor or behavior expansion was introduced.

## Evidence

- Target regression test failed before the production change and passed after it.
- Full frontend coverage passed 962/962 tests.
- EquipmentBoard line coverage rose to 90.27%.

## Residual Risk

- This is frontend component evidence. It does not replace real browser or PostgreSQL/staging release evidence.
- The current release gate remains red until Docker/staging can produce PASS evidence.
