# 2026-06-20 Review: Live token runtime gates

## Findings

- Root cause: several runtime gates still used `isOfflineDemoMode()` directly. A stale demo flag could therefore keep production commands local or prevent realtime connections even after backend login was live.
- Production risk: start/complete/exception commands could return local demo success instead of writing the backend when stale demo storage remained.
- Monitoring risk: Dashboard and Monitoring realtime hubs could be skipped, leaving live pages disconnected while API auth was valid.
- Governance empty state: missing latest POC Hypercare acceptance returned `404`, which is valid when the package has not been generated yet; treating it as a page initialization failure was too noisy.

## Verification

- Focused frontend unit suite passed: 8 files, 80 tests.
- Frontend production build passed.
- Real browser evidence confirmed Dashboard and Monitoring live requests still run with stale offline storage and real backend token.

## Residual Risk

- `GanttChart.vue` still uses `isOfflineDemoMode()` for lightweight rendering selection. It was intentionally left untouched because this slice focused on backend writes and realtime connections; a separate visual/drag evidence slice should decide whether Gantt should use the token-aware rule.
