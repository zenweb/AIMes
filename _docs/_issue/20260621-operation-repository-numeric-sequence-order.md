# Issue: Operation Repository Numeric Sequence Order

## Problem
`OperationRepository` still exposed lexical operation-code ordering after higher layers were hardened.

## Impact
Any future caller using repository order directly could receive `OP-10` before `OP-2`, causing first-operation lookup and handoff evidence to disagree with the numeric route sequence.

## Resolution
- `GetExecutionsByWorkOrderIdAsync` now filters in the database and sorts the materialized result by extracted numeric sequence.
- `GetFirstExecutionByWorkOrderIdAsync` now delegates to the ordered list.

## Verification
- Repository regression failed before the fix and passed after the fix.
- Production scan and scheduling context focused checks remained green after rerun.

