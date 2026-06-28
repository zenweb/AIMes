# Nuxt dev startup blocked by rollupOptions input resolution

Date: 2026-06-19
Status: Blocked

## Symptom

`npm run dev` starts Nuxt and prints `http://127.0.0.1:5173/scheduling/`, then exits with:

```text
ERROR No entry found in rollupOptions.input
at resolveServerEntry (.../node_modules/@nuxt/vite-builder/dist/index.mjs:92:8)
```

## Evidence

- Reproduced with the current project config.
- Reproduced after moving custom `rollupOptions` into a client-only hook.
- Reproduced after removing the hook entirely.
- Reproduced after trying `vite.devBundler: 'legacy'`.
- Reproduced with a minimal Nuxt config containing only `ssr: false`, `baseURL`, and proxy settings.
- Root cause evidence: `@nuxt/vite-builder` resolves `server` input even when `ssr:false` uses the client server; Nuxt's client environment only produced `input.entry`.
- Re-audit evidence: adding a dev-only hook that supplies `input.server` allowed `npm run dev` to log both `Vite client built` and `Vite server built`, but every tested HTTP route timed out.
- Re-audit evidence: `experimental.viteEnvironmentApi: false` alone returns to the original missing-input error; combined with `entry-spa.js` still times out on HTTP.
- Countercheck evidence: production preview on port `4173` serves `/scheduling/` and `/scheduling/login` with HTTP 200.

## Current conclusion

The blocker remains in the Nuxt 3.21.7 / Vite 7.3.5 local dev-server path. Supplying a `server` input only masks the startup exception and leaves the dev HTTP pipeline hung, so no config workaround is accepted.

Stop condition: do not spend more turns changing AIMes UI/config for this issue without a clean minimal reproduction or an explicit Nuxt/Vite dependency strategy.

## Impact

- Local Nuxt hot-reload dev server remains blocked.
- Production build + preview remains usable for real browser evidence.
- Latest successful browser evidence for RoutingBoard was collected through `npm run build` + `scripts/preview.mjs` on port `4173`.
