# 2026-06-15 Review: production anomaly sync backend fallback

Scope:

- Covered the backend exception fallback branch in `production-anomaly-sync.ts`.
- This utility underpins the `AnomalyBoard` latest production anomaly hydration path.

Findings:

- No production fix was required.
- `readProductionAnomalyEventBackendFirst` already catches backend/API failures and returns `readProductionAnomalyEvent()`.
- The existing test suite also covers backend null fallback, mapping contracts, corrupt JSON cleanup, and incomplete local event cleanup.

Residual risk:

- `riskEvidence.ts` API wrapper coverage remains low in this focused run because only the latest-event read path is exercised here.
