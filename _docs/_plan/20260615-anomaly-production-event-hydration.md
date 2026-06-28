# 2026-06-15 Plan: anomaly production event hydration

Success criteria:

- Latest backend production anomaly events must appear before API list anomalies.
- API list items with the same id must not duplicate or override the backend event.
- Opening a backend event must use mapped production anomaly detail and avoid unnecessary detail refetch.

Execution:

1. Read `AnomalyBoard` hydration/detail logic and `production-anomaly-sync` mappings.
2. Make the existing test mocks for `toProductionAnomaly` and `toProductionAnomalyDetail` configurable.
3. Add a focused unit test for backend event list ordering and detail mapping.
4. Run focused, file-level, and coverage commands.

Outcome:

- All checks passed and no production code change was needed.
