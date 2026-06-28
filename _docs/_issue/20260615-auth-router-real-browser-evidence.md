# 2026-06-15 Auth Router Real Browser Evidence Issue

## Issue

The prior hold packet identified a missing evidence layer: auth/router/local-user hardening had focused unit evidence, but real-browser login/router evidence had not yet been run.

## Risk

Without browser evidence, a router guard or persisted identity change could pass unit tests while failing in the built Nuxt app.

## Resolution

Ran the focused Chromium Playwright suite:

```powershell
npm run test:e2e -- tests/e2e/login.spec.ts --project=chromium
```

Result: `11 passed`.

No implementation defect appeared in this slice.

