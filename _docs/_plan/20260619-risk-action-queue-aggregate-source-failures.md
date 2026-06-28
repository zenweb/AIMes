# Plan: Risk action queue aggregate source failures

Date: 2026-06-19

## Success criteria

- Multiple startup risk source failures render together in the assertive alert.
- Base risk cards remain visible when optional risk sources fail.
- Existing risk action behavior remains unchanged.
- Targeted test, component test suite, full frontend unit coverage, and lint pass.

## Execution

1. Add a RED test for simultaneous anomaly dispatch and assistant recovery startup failures.
2. Confirm the RED test fails because the first source failure is overwritten.
3. Implement the smallest production fix by appending startup source failures.
4. Run targeted, component, full coverage, and lint verification.
5. Record changelog, review, todo, issue, and plan artifacts.

## Result

All success criteria passed. This is a quality hardening slice for the existing risk queue, not a new feature expansion.
