# Plan: Production completion evidence retry

Date: 2026-06-19

## Success criteria

- Backend completion failure still releases the completion guard.
- Evidence archival failure after backend completion shows a fail-loud alert.
- Evidence archival failure restores optimistic local operation and work-order state.
- Operators can retry completion from the same dialog after evidence archival failure.
- Targeted test, ProductionBoard suite, full frontend unit coverage, and lint pass.

## Execution

1. Add a RED test for completion evidence archival failure followed by retry.
2. Confirm the RED test fails because retry is blocked.
3. Implement scoped guard release and optimistic state rollback on evidence archival failure.
4. Run targeted, component, full coverage, and lint verification.
5. Record changelog, review, todo, issue, and plan artifacts.

## Result

All success criteria passed. This is a boutique hardening slice for an existing production reporting workflow, not a new feature expansion.
