# 2026-06-15 Plan: Equipment audit focus current work order coverage

## Success Criteria

- EquipmentBoard audit replay deep-linking is covered by a unit regression test.
- Missing equipment objects from audit replay still create a selected synthetic equipment detail.
- The selected detail panel exposes the current work order / trace reference.
- Target tests and full frontend coverage pass.

## Steps

1. Inspect EquipmentBoard and current unit tests.
2. Make the route query mock controllable.
3. Add a regression test for an audit-focused missing equipment object.
4. Confirm the test fails for the missing trace reference.
5. Add the current work order row to the overview detail panel.
6. Re-run target and full coverage verification.
7. Record changelog, review, todo, issue, and plan.

## Stop Condition

Stop after one verified EquipmentBoard slice. Do not retry Docker again in this slice because the current blocker is already captured as Docker Desktop Linux engine API 500.
