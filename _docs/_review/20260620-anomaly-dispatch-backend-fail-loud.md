# 2026-06-20 Review: Anomaly Dispatch Backend Fail Loud

## Scope

Reviewed the anomaly dispatch backend-first evidence path:

- `src/frontend/src/api/riskEvidence.ts`
- `src/frontend/src/utils/anomaly-dispatch-sync.ts`
- `src/frontend/tests/unit/anomaly-dispatch-sync.test.ts`
- `src/frontend/tests/unit/risk-evidence-api.test.ts`

## Findings

- No blocking issue found in this slice.
- `failLoud` is opt-in, so existing startup and demo fallback behavior remains quiet unless the caller explicitly requests audit-grade failure propagation.
- Non-array backend anomaly dispatch payloads now produce a domain-specific error before record filtering.
- Incomplete backend records remain excluded so owner action, affected orders, and audit trace stay explainable.

## Residual Risk

- Verification was frontend unit/component focused. It does not prove live Docker/PostgreSQL readback.
- Adjacent checks were filtered and include skipped tests; they are not a full frontend regression.
- The current worktree contains many pre-existing dirty files. This review only covers the anomaly dispatch slice and directly touched risk evidence API test.

## Evidence

- `anomaly-dispatch-sync.test.ts`: 8 passed.
- `risk-evidence-api.test.ts`: 6 passed.
- `anomaly-board.test.ts` filtered: 11 passed, 11 skipped.
- `risk-action-queue-panel.test.ts` filtered: 9 passed, 7 skipped.
- `schedule-board.test.ts` filtered: 8 passed, 61 skipped.
- `chat-panel.test.ts` filtered: 9 passed, 62 skipped.
- Targeted lint passed.
- Targeted `git diff --check` exited 0 with LF/CRLF normalization warnings only.
