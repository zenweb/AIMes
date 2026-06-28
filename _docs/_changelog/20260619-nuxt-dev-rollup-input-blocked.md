# Changelog: Nuxt dev rollup input blocker re-audited

Date: 2026-06-19

## Changed

- Re-audited the Nuxt local dev blocker with systematic HTTP probes.
- Reverted the temporary dev-entry hook because it changed the failure mode from startup error to all-route HTTP timeout.
- Preserved the local backend default port `5003`.

## Verification

- Baseline: `npm run dev` exits with `No entry found in rollupOptions.input`.
- Temporary `input.server = input.entry` and `input.server = entry-spa.js` probes both reached `Vite client built` / `Vite server built`, but `/scheduling/`, `/scheduling/login`, `/_tailwind/`, and `/_nuxt/@vite/client` all timed out.
- `experimental.viteEnvironmentApi: false` alone returned to the original `No entry found in rollupOptions.input` failure.
- `experimental.viteEnvironmentApi: false` plus `entry-spa.js` also left all tested dev HTTP routes timing out.
- Production preview countercheck passed: `/scheduling/` returned 200 in 131 ms and `/scheduling/login` returned 200 in 5 ms on port `4173`.
- `npm run build` passed.
- `npm run lint` passed.
- `npm run test:unit:coverage` passed: 111 files / 1086 tests.

## Current state

- `npm run dev` remains blocked as browser-evidence infrastructure.
- No Nuxt dev workaround is currently accepted in code.
- Production preview remains the reliable route for real Chromium validation.
