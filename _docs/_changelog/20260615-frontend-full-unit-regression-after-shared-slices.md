# 2026-06-15 Frontend Full Unit Regression After Shared Slices

- Ran the full frontend unit suite after the recent shared-path hardening slices:
  - auth/router/local-user
  - HTTP refresh and fallback handling
  - notifications SignalR lifecycle
  - CSV export hook
  - knowledge citation routing
  - Agent config approval merge policy
- No production code change was made in this audit turn.

## Verification

From `src/frontend`:

```powershell
npm run test:unit -- --reporter=dot
```

Result: `111 passed (111)` test files, `992 passed (992)` tests.

