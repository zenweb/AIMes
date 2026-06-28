# Frontend Production E2E Pass - 2026-06-21

## Scope

- Production board real-browser E2E recovery.
- Offline demo protected-route navigation for production cross-module flows.
- Anomaly board clickability regression where the event-center section intercepted anomaly-card clicks.

## Changes Verified

- `tests/e2e/production.spec.ts`
  - Seeds a complete offline demo session tuple: `aimes_offline_demo`, access token, refresh token, and cached user.
  - Keeps cross-module navigation on explicit `?offlineDemo=1` entries.
  - Verifies the empty work-order state through a visible status filter path instead of mixing live API mocks into offline demo mode.
- `src/components/anomaly/AnomalyBoard.vue`
  - Stabilizes the anomaly page layout so the event-center block and event-bridge no longer intercept anomaly-card clicks in Chromium.
  - Keeps anomaly cards in a dedicated scrollable list area.

## Evidence

Command:

```powershell
cd C:\AIWorks\AIMes\v1\src\frontend
npm run test:e2e -- tests/e2e/production.spec.ts
```

Result:

```text
25 passed (29.5s)
```

Additional component regression:

```powershell
cd C:\AIWorks\AIMes\v1\src\frontend
npm run test:unit -- tests/unit/anomaly-board.test.ts --maxWorkers=1 --no-file-parallelism
```

Result:

```text
1 file passed, 22 tests passed
```

## Notes

- This closes the production E2E route-loop/click-interception regression found during the current Sprint 0 evidence refresh.
- The broader release gate is still not globally complete: hosted CI/worktree boundary and owner-deferred gray observation remain separate fail-loud items.
