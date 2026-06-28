# Nuxt dev rollup input blocker next actions

Date: 2026-06-19
Status: Open

## Recommended next actions

- [x] Reproduce the original `No entry found in rollupOptions.input` failure.
- [x] Inspect `@nuxt/vite-builder` input resolution and confirm it expects `input.server` for the SPA dev server path.
- [x] Test a dev-only config hook that supplies `server` from Nuxt's existing `entry`.
- [x] Test a dev-only config hook that supplies `server` from Nuxt's `entry-spa.js`.
- [x] Test `experimental.viteEnvironmentApi: false`.
- [x] Confirm these probes are not acceptable fixes because dev HTTP requests still time out or the original input error returns.
- [x] Revert temporary dev-server config probes from `src/frontend/nuxt.config.ts`.
- [x] Verify `npm run build`.
- [x] Verify `npm run lint`.
- [x] Verify `npm run test:unit:coverage`.
- [ ] Create or inspect a clean minimal reproduction before any further Nuxt dev config changes.
- [ ] Decide dependency strategy: pin/align Nuxt Vite dependencies or upgrade Nuxt/Nuxi together.
- [ ] Keep using production preview for browser evidence until dev HTTP 200 is proven:

```powershell
npm run build
npm run preview
```

## Stop rule

Do not spend more time changing AIMes UI code or local Nuxt config for this issue. The next pass must start from dependency strategy or a clean minimal reproduction.
