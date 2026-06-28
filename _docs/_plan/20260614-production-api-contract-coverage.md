# Production API contract coverage plan

## Success criteria

- Production API helper tests cover scan payload passthrough, offline command isolation, and backend failure propagation.
- Existing ProductionBoard regression tests remain green.
- Full frontend coverage remains green.

## Execution

1. Read `production.ts` and existing production unit tests.
2. Add focused API contract tests without changing production behavior.
3. Run targeted production API and board tests.
4. Run targeted and full frontend coverage.
5. Record review, issue, todo, and changelog evidence.

## Result

Completed for this slice.
