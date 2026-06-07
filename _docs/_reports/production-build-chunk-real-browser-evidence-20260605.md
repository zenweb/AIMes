# 2026-06-05 Production Build Chunk Real Browser Evidence

## Scope

- Target: frontend Nuxt production build chunk warning.
- User path verified: Production 生产看板.
- Boundary: quality/performance evidence only; this does not close release B-track gates.

## Change

- Updated `src/frontend/nuxt.config.ts` manual chunk routing.
- Kept `dhtmlx-gantt`, `@microsoft/signalr`, `html5-qrcode` / `qrcode`, and generic `vendor` chunks.
- Added a dedicated Vue chunk for `/node_modules/vue/` and `/node_modules/@vue/`.
- Kept PrimeVue in `vendor` because direct PrimeVue chunking produced circular chunk warnings.

## Build Evidence

- Command: `npm run build`
- Result: PASS
- Previous largest JS chunk: `911.05 kB`
- Current largest JS chunks:
  - `817.49 kB`
  - `734.51 kB`
  - `359.43 kB`
- `Some chunks are larger than 900 kB after minification`: not observed.
- `Circular chunk`: not observed in the accepted build.

## Rejected Attempts

- PrimeVue theme as a separate chunk reduced chunk size but produced:
  - `Circular chunk: primevue -> primevue-theme -> vendor -> primevue`
- PrimeVue and theme in one chunk still produced:
  - `Circular chunk: primevue -> vendor -> primevue`
- Accepted strategy: split Vue only; leave PrimeVue in `vendor`.

## Real Browser Evidence

- Command: `npm run test:e2e -- production.spec.ts`
- Browser: Chromium via Playwright.
- Result: PASS
- Tests: `21 passed`
- E2E production build largest JS chunks:
  - `817.50 kB`
  - `734.43 kB`
  - `359.42 kB`
- `Some chunks are larger than 900 kB after minification`: not observed.
- `Circular chunk`: not observed.

## Release Gate Impact

- Improves frontend production-build quality evidence for a user-critical production execution route.
- Does not close hosted CI, PostgreSQL/staging, attack-chain A/B/C, security signoff, first gray deployment, or observation-window gates.
