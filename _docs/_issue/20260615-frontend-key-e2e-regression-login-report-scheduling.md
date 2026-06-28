# 2026-06-15 Frontend Key E2E Regression Login Report Scheduling Issue

## Issue

Before sealing the current work state, the latest key browser-facing paths needed explicit local real-browser evidence.

## Risk

Without recording the login, report, and scheduling e2e regression, the handoff could overstate progress based only on unit/backend evidence or older browser runs.

## Resolution

Ran the selected Chromium e2e command from `src/frontend`:

```powershell
npm run test:e2e -- tests/e2e/login.spec.ts tests/e2e/report.spec.ts tests/e2e/scheduling.spec.ts --project=chromium
```

Result: 111 passed, 0 failed.

## Remaining Boundary

This does not close full release readiness. Hosted CI, staging evidence, full e2e scope, and any owner-defined release gates remain separate from this local evidence.
