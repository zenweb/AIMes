# 2026-06-14 Plan - Report OTD KPI Commitment Lock and Evidence

## Objective
- Harden the existing Report OTD KPI commitment path so a generated commitment package cannot be duplicated by repeated user action.

## Success Criteria
- Unit test proves duplicate commitment generation is blocked.
- Real Chromium test proves both customer commitment and outsourcing commitment buttons are disabled after success.
- Full frontend unit coverage remains green.

## Execution
1. Add RED unit test for duplicate KPI commitment write prevention.
2. Implement the smallest production guard:
   - disabled button state,
   - handler-level early return.
3. Extend affected Chromium e2e paths with disabled assertions.
4. Run focused unit, focused Chromium e2e, and full unit coverage.
5. Record changelog, review, todo, issue, and plan documents.

## Stop Condition
- Stop this slice once the lock is verified. Continue next with a different existing core path, not more micro-polish on the same button.
