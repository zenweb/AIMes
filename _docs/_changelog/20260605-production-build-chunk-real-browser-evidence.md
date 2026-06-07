# 2026-06-05 Production Build Chunk Real Browser Evidence

## Changed

- Adjusted Nuxt production manual chunk routing in `src/frontend/nuxt.config.ts`.
- Split Vue core dependencies into a dedicated `vue` chunk.
- Left PrimeVue in `vendor` after direct PrimeVue chunking produced circular chunk warnings.
- Added a real-browser evidence report for the accepted build and E2E result.

## Verification

- `npm run build`
  - Result: PASS
  - Largest JS chunk: `817.49 kB`
  - No `Some chunks are larger than 900 kB after minification` warning observed.
  - No circular chunk warning observed.
- `npm run test:e2e -- production.spec.ts`
  - Result: PASS
  - Browser: Chromium
  - Tests: `21 passed`

## Release Gate Impact

- Improves frontend production-build and real-browser evidence for the production execution route.
- Does not close hosted CI, PostgreSQL/staging, attack-chain A/B/C, security signoff, or gray observation gates.
