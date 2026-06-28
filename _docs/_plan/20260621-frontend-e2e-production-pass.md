# 2026-06-21 Plan - Frontend Production E2E Recovery

## Success Criteria

- Production E2E no longer loops between login/dashboard.
- Cross-module production evidence flows stay in offline demo mode.
- Anomaly cards are clickable in real Chromium.
- Full `production.spec.ts` passes.

## Execution

1. Inspect failing Playwright contexts.
2. Align E2E auth setup with the current offline demo route guard.
3. Convert production cross-module `page.goto()` calls to explicit offline demo entries.
4. Fix anomaly board layout click interception.
5. Re-run targeted and full production E2E.

## Outcome

- Completed.
- Full production E2E: `25 passed (29.5s)`.
