# 2026-06-22 Report: Schedule Compare Apply Success Close

## Scope
- Hardened the existing ScheduleBoard batch comparison apply workflow.
- Added regression evidence that applying a compared plan closes the comparison panel, syncs adoption feedback, and triggers optimization with the selected objective.
- No production code changed in this slice.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "closes the comparison panel"`: PASS, 1 selected test.
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: PASS, 41 tests.
- `npm run test:unit`: PASS, 118 files / 1235 tests.

## Result
- Operators see the comparison panel close after applying a plan.
- Audit feedback is submitted with `reasonCategory=batch_optimize_apply` and the selected objective.
- The optimizer is called with the selected objective so the visible plan reflects the applied comparison choice.

## Boundary
- This is a frontend unit evidence slice for an existing scheduling workflow.
- It does not close the full CC remediation objective or release gates.
