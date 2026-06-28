# 2026-06-15 Auth Router Real Browser Evidence

- Resumed from `_docs/_review/20260615-task-hold-on-archival.md`.
- Ran the focused real-browser login/router regression slice in Chromium.
- Verified login page rendering, demo hints, form disabled/enabled state, backend login failure, backend login success, first-login password-change redirect, authenticated login redirect, and unauthenticated protected-route redirect.
- No production code changes were needed in this slice.

## Verification

From `src/frontend`:

```powershell
npm run test:e2e -- tests/e2e/login.spec.ts --project=chromium
```

Result: `11 passed`.

