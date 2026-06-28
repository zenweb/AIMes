# 2026-06-15 Plan: anomaly dispatch write exception guard

Success criteria:

- Thrown evidence write errors must not lock an anomaly dispatch lane.
- Thrown errors must not render a confirmed dispatch trace.
- The UI must expose the thrown error reason through the existing alert surface.

Execution:

1. Read the adjacent anomaly dispatch failure tests and `dispatchEventLane` catch branch.
2. Add a focused unit test for the thrown write exception path.
3. Run focused and file-level tests.
4. Capture focused coverage for `AnomalyBoard.vue`.

Outcome:

- All checks passed and no production code change was needed.
