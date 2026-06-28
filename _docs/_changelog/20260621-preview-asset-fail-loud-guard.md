# 2026-06-21 Preview Asset Fail-Loud Guard

- Added a startup guard to `src/frontend/scripts/preview.mjs`.
- Extracted the guard to `src/frontend/scripts/preview-asset-check.mjs` so it can be tested without starting the preview server.
- The guard imports Nitro's `client.precomputed.mjs` and verifies every referenced `_nuxt` asset exists in `.output/public/_nuxt` before starting the preview server.
- This prevents stale or partial `.output` builds from silently serving HTML that points at missing chunks.

## Verification
- Unit: `npm run test:unit -- tests/unit/preview-asset-check.test.ts` passed, 2/2.
- Normal current `.output`: `node ./scripts/preview.mjs` reached the listen step, then failed only because `127.0.0.1:4173` was already in use by the active preview.
- Missing asset probe: temporarily renamed `.output/public/_nuxt/D91iPFlu.js`; `PORT=4199 node ./scripts/preview.mjs` failed before listen with `Preview build asset check failed`.
- Runtime smoke: real Chromium opened `http://127.0.0.1:4173/scheduling/employee?offlineDemo=1`, logged in with `admin/admin123`, and confirmed 8 employee cards, 0 alerts, no `员工列表加载失败`, and no `Offline demo mode skipped backend request`.

## 2026-06-21 Nested Asset Refresh
- Strengthened `preview-asset-check.mjs` from top-level `modules[*].file` scanning to recursive manifest scanning for every nested `{ file: "..." }` reference.
- Added unit coverage for nested preload/style/font asset references so missing CSS or font assets fail loud before preview starts.
- Verification:
  - `npm run test:unit -- tests/unit/preview-asset-check.test.ts`: 3/3 passed.
  - `npm run build`: passed.
  - `PORT=4174 node ./scripts/preview.mjs`: reached `Listening on http://127.0.0.1:4174/scheduling`; temporary process was stopped after smoke.
