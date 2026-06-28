# Plan: Purchase expedite assistant closure fail loud

Date: 2026-06-19

## Success criteria

- Expedited purchase receipt still closes the shortage risk and writes OTD evidence.
- Assistant recovery package lookup failure after receipt does not roll back the completed receipt state.
- Assistant closure failure is visible in the assertive purchase alert.
- Targeted test, PurchaseBoard suite, full frontend unit coverage, and lint pass.

## Execution

1. Add a RED test for expedited receipt followed by assistant recovery backend failure.
2. Confirm the RED test fails due to unhandled assistant recovery rejection.
3. Isolate assistant recovery lookup/closure as a secondary fail-loud boundary.
4. Run targeted, component, full coverage, and lint verification.
5. Record changelog, review, todo, issue, and plan artifacts.

## Result

All success criteria passed. This is a boutique hardening slice for an existing purchase receipt workflow, not a new feature expansion.
