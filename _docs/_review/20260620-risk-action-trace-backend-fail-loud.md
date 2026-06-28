# 2026-06-20 Review: Risk Action Trace Backend Fail Loud

## Scope

Reviewed the risk action trace backend-first read path:

- `src/frontend/src/api/riskEvidence.ts`
- `src/frontend/src/utils/risk-action-sync.ts`
- `src/frontend/tests/unit/risk-action-sync.test.ts`
- `src/frontend/tests/unit/risk-evidence-api.test.ts`

## Findings

- No blocking issue found in this slice.
- The new `failLoud` option preserves existing quiet fallback semantics unless a caller explicitly requests audit-grade failure propagation.
- Non-array backend payloads are now rejected before trace filtering, preventing malformed backend envelopes from being treated like empty evidence.

## Residual Risk

- Verification was frontend unit/component focused. It does not prove a live Docker/PostgreSQL backend is currently reachable.
- The current shell still could not reach Docker Engine earlier in this session, so no live API browser readback was claimed for this slice.
- Filtered adjacent tests include skipped tests and are not a full frontend regression.

## Evidence

- `risk-action-sync.test.ts`: 9 passed.
- `risk-evidence-api.test.ts`: 5 passed.
- `risk-action-queue-panel.test.ts` filtered: 11 passed, 5 skipped.
- `audit-decision-replay-panel.test.ts` filtered: 4 passed, 56 skipped.
- `report-board.test.ts` filtered: 11 passed, 17 skipped.
- `otd-evidence-chain-sync.test.ts`: 6 passed.
- Targeted lint passed.
- Targeted `git diff --check` exited 0 with LF/CRLF normalization warnings only.
