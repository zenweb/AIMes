# 2026-06-15 Staging Rehearsal Docker Engine Timeout Next Actions

- Fix Docker Desktop Linux engine responsiveness so `docker info` returns within the configured timeout.
- Keep using `http://localhost:5003` while host `5002` is occupied by another local service.
- Re-run staging rehearsal with `-ApiBaseUrl http://localhost:5003` after Docker engine recovers.
- Only after rehearsal is green, run `AIMES_RUN_LIVE_STAGING_E2E=true AIMES_LIVE_API_BASE_URL=http://localhost:5003 npm run test:e2e -- scheduling-live-staging.spec.ts --reporter=line --retries=0`.
- Do not use host `localhost:5000` for new staging/browser evidence.
