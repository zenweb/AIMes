# Issue - Nuxt Dev Rollup Input Hang - 2026-06-21

## Problem
- `npm run dev` fails in the current frontend workspace.
- Original failure:
  - `No entry found in rollupOptions.input`
  - Stack: `@nuxt/vite-builder/dist/index.mjs`, `resolveServerEntry`.

## Investigation
- Production build and e2e build continue to pass.
- Nuxt/Vite source shows `resolveServerEntry()` reads:
  - `config.environments.ssr?.build.rollupOptions.input`
  - then `config.build.rollupOptions.input`
- A dev-only `rollupOptions.input` experiment allowed Vite client/server to build, but `/scheduling/login` did not return HTTP 200 within 75 seconds.
- The experiment was reverted; no unverified Nuxt config change was retained.

## Current Safe Path
- Use production build + preview for real-browser verification.
- Current verified preview path from the previous slice:
  - `http://127.0.0.1:4176/scheduling/employee?offlineDemo=1`

## Status
- Open.
- Not blocking build/e2e evidence.
- Blocking fast Nuxt dev-server workflow.
