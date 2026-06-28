# 2026-06-15 Plan: anomaly dispatch write failure guard

Success criteria:

- Failed anomaly dispatch evidence writes must not lock a lane.
- Failed writes must not render a confirmed dispatch trace.
- The UI must explain the failure through the existing alert surface.

Execution:

1. Read existing anomaly board tests and dispatch implementation.
2. Add a focused unit test for the `null` write result path.
3. Run focused and file-level tests.
4. Capture focused coverage for `AnomalyBoard.vue`.

Outcome:

- All checks passed and no production code change was needed.
