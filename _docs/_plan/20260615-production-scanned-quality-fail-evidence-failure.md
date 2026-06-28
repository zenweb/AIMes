# Production scanned quality-fail evidence failure plan

## Success criteria

- Backend completion API is still called with failed inspection data.
- Handoff-freeze evidence archival failure is surfaced to the operator.
- Completion success and downstream quality-freeze success chips are not shown after archival failure.
- Existing ProductionBoard tests stay green.

## Steps

1. Inspect scanned quality-fail implementation and current tests.
2. Add a targeted evidence-failure test for the handoff-freeze write.
3. Keep production code unchanged if the current fail-loud path already satisfies the behavior.
4. Run targeted, component, API, and coverage validation.

## Result

Completed for this slice. Existing production code already met the behavior; regression coverage was added.
