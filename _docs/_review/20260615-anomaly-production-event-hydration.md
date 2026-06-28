# 2026-06-15 Review: anomaly production event hydration

Scope:

- Covered the backend production anomaly event hydration path in `AnomalyBoard`.
- The test exercises list ordering, duplicate replacement, and detail opening behavior.

Findings:

- No production code change was required.
- Existing `loadAnomalies` already prepends `toProductionAnomaly(event)` and filters duplicate ids from the API list.
- Existing `selectAnomaly` already uses `toProductionAnomalyDetail(event)` when the selected id matches the latest production anomaly event.

Residual risk:

- The backend-first reader fallback behavior lives in `production-anomaly-sync.ts`; this slice validates the board integration, not the utility's local-storage fallback.
