# 2026-06-14 Audit Log API Contract Evidence

## Changed
- Added unit contract coverage for `src/frontend/src/api/auditLog.ts`.
- Covered paged audit log reads with and without an action filter.
- Covered audit log detail lookup by selected audit id.

## Verification
- `npm run test:unit -- tests/unit/audit-log-api.test.ts` -> 1 file passed, 2 tests passed.
- `npm run test:unit -- tests/unit/audit-log-api.test.ts tests/unit/audit-decision-replay-panel.test.ts` -> 2 files passed, 22 tests passed.
- `npm run test:unit:coverage -- tests/unit/audit-log-api.test.ts` -> focused coverage 6/6 lines and 4/4 branches.

## Notes
- No production code changed. Existing implementation already matched the backend contract; this slice closes missing evidence for audit replay API plumbing.
