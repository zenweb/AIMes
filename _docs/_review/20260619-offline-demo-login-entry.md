# 2026-06-19 Review: Offline demo login entry

## Scope
- Reviewed the frontend auth store demo-login path used by production preview links with `offlineDemo=1`.

## Finding
- The production preview does not run in dev mode, so `admin / admin123` only works when `offlineDemo=1` explicitly enables demo mode.
- After demo login, the auth store marked the demo user as `mustChangePassword: true`.
- That redirected the user to the password-change flow, which requires backend support and blocks the promised local demo entry.

## Resolution
- Kept backend login behavior unchanged.
- Changed demo-login users to persist `mustChangePassword: false`, so offline demo mode enters the workbench directly.
- Added regression coverage for demo login persistence.

## Verification
- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/login-page.test.ts tests/unit/router-auth.test.ts`: 38 passed.
- `npm run build`: passed.
- Real browser login verified against `http://127.0.0.1:4173/scheduling/login?offlineDemo=1`.

## Residual Risk
- Real backend login can still fail if the backend service is offline, the database is not seeded, or a seeded password has changed.
- For local preview without backend, users should use the explicit `offlineDemo=1` entry.
