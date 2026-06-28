# Production invalid route scan guard coverage plan

## Success criteria

- Invalid route `scanCode` values do not disturb an existing selected work order.
- Invalid route scan-code changes do not insert demo work orders or render barcode production context.
- Targeted ProductionBoard and Production API tests remain green.
- Full frontend coverage remains green.

## Execution

1. Inspect route scan-code guard behavior.
2. Add an invalid scan-code unit test.
3. Run targeted tests and coverage.
4. Run full frontend coverage.
5. Record changelog, review, todo, issue, and plan evidence.

## Result

Completed for this slice.
