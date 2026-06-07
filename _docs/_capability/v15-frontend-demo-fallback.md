# V1.5 Capability: Frontend Demo Fallback

## Scope

- The frontend prefers backend/API/report data for the first migrated slices.
- Demo state remains available for offline demo continuity.

## Current Behavior

- `ScheduleAgentWorkbenchPanel.vue` reads recent backend Agent decisions first and falls back to local demo state.
- `ReportBoard.vue` and `DashboardBoard.vue` read `/reports/latest-ab-report.json` first and fall back to local demo OTD data.
- Production e2e uses isolated Nuxt/Nitro output directories to avoid Windows `.nuxt` lock conflicts.

## Verification

- `npm run build`: passed.
- `npm run test:e2e -- production.spec.ts`: 21 passed.
