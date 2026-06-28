# 2026-06-14 Plan - Audit Log API Contract Evidence

## Success Criteria
- Audit log list helper calls `/audit-logs` with page and page size.
- Action filter is included only when provided.
- Detail helper calls `/audit-logs/{id}` with the selected audit id.
- Audit replay component regression remains green.

## Execution
1. Read `auditLog.ts` and immediate audit replay caller.
2. Add a focused API contract test.
3. Run focused test.
4. Run audit replay regression.
5. Run focused coverage for the new slice.
6. Document changelog, review, todo, issue, and plan entries.

## Outcome
- Criteria met by unit tests and focused coverage.
- No production code change required.
