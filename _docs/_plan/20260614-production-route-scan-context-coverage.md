# Production route scan context coverage plan

## Success criteria

- ProductionBoard test harness can control route query state without leaking across tests.
- Route `scanCode` startup behavior is covered end to end at unit level.
- Targeted ProductionBoard and Production API tests remain green.
- Full frontend coverage remains green.

## Execution

1. Inspect `ProductionBoard.vue` route scan-code implementation and existing tests.
2. Add a mutable route-query mock with before-each reset.
3. Add route scan-code startup context coverage.
4. Run targeted tests and coverage.
5. Record changelog, review, todo, issue, and plan evidence.

## Result

Completed for this slice.
