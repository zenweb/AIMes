# 2026-06-20 Production Anomaly Latest Toast Cleanup

## Changed

- Updated the optional latest production anomaly event read to use `suppressErrorToast: true`.
- Kept `failLoud` behavior intact so explicit audit callers can still surface backend failures.
- Synchronized unit expectations for backend-first anomaly fallback reads.

## Evidence

- `npm run test:unit -- risk-evidence-api.test.ts production-anomaly-sync.test.ts anomaly-board.test.ts risk-action-sync.test.ts` PASS, 45 tests.
- `npm run build` PASS.
- Real browser preview on `http://127.0.0.1:4173/scheduling`:
  - `/scheduling/risk`: no `请求错误`, no offline skip, no fallback warning.
  - `/scheduling/anomaly`: no `请求错误`, no offline skip, no fallback warning.

