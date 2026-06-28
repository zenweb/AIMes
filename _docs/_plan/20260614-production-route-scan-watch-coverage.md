# Production route scan watch coverage plan

## Success criteria

- Unit tests can trigger `watch(() => route.query.scanCode)` using a reactive route-query double.
- Post-load route scan-code changes refresh the production reporting context without discarding existing loaded work orders.
- Targeted ProductionBoard and Production API tests remain green.
- Full frontend coverage remains green.

## Execution

1. Inspect remaining uncovered ProductionBoard route watcher lines.
2. Make the route-query test double reactive.
3. Add a post-load route scan-code change test.
4. Run targeted tests and coverage.
5. Record changelog, review, todo, issue, and plan evidence.

## Result

Completed for this slice.
