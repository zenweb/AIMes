# Review: Operation Repository Numeric Sequence Order

## Scope
- Audited remaining operation-code ordering surfaces after the scheduling context fix.
- Selected `OperationRepository` because it is the shared read boundary for production scan handoff and future scheduling callers.

## Findings
- `GetExecutionsByWorkOrderIdAsync` sorted directly by `OperationCode`, so `OP-10` preceded `OP-2`.
- `GetFirstExecutionByWorkOrderIdAsync` also returned `OP-10` first for non-padded codes.
- The repository now materializes the filtered work-order operations and applies numeric sequence ordering in memory, matching the application-layer handoff rule.

## Residual Risk
- Numeric sequence extraction now exists in `OperationRepository`, `OperationService`, and `SchedulingContextProvider`. A shared helper is a good cleanup once this rule appears in one more production surface, but extracting it now would broaden the slice.
- Full integration suite was not run; focused repository and affected upper-layer tests passed.

