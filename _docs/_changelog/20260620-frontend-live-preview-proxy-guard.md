# 2026-06-20 Frontend live preview proxy guard

## Changed
- Extracted the Nuxt backend proxy contract into `src/frontend/src/config/backend-proxy.ts`.
- Updated `src/frontend/nuxt.config.ts` to consume the shared proxy contract for:
  - production preview `routeRules`
  - Vite dev proxy
  - Nitro dev proxy
- Added `src/frontend/tests/unit/nuxt-config.test.ts` to lock the default backend target to `http://localhost:5003` and preserve `/api/**` plus `/hubs/**` live routing.

## Verified
- `npm run test:unit -- tests/unit/nuxt-config.test.ts tests/unit/employee-board.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/auth.store.test.ts`
- `npm run build`
