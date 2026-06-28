# 2026-06-15 Frontend Key E2E Regression: Login, Report, Scheduling

- Ran the key real-browser Chromium e2e regression for existing user-critical frontend paths.
- Covered login, report, and scheduling slices, including fail-loud/browser scheduling paths, dhtmlx rendering, and drag-save behavior.
- No production code change was made in this sealing turn.

## Verification

From `src/frontend`:

```powershell
npm run test:e2e -- tests/e2e/login.spec.ts tests/e2e/report.spec.ts tests/e2e/scheduling.spec.ts --project=chromium
```

Result:

- 111 Chromium tests passed.
- 0 failed.

## Boundary

This is a key local real-browser regression, not the full e2e suite, hosted CI, staging rehearsal, gray observation, or v1.0.0 release readiness.
