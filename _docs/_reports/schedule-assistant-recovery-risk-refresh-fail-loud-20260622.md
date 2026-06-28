# Schedule assistant recovery risk refresh fail-loud evidence - 2026-06-22

## Scope
- Hardened the Scheduler Pro Workbench assistant recovery closure path.
- When an assistant recovery handoff is closed and the follow-up risk-event refresh fails, the UI must fail loud and keep the closed recovery suggestion visible for operator review.

## Root Cause
- `closeAssistantRecoveryHandoff` had a dedicated catch block for risk-event refresh failures.
- `loadRiskTriggeredEvents` swallowed risk dashboard failures internally, so that dedicated closure catch was unreachable in practice.
- The regression test also set the risk dashboard rejection before mount, allowing startup risk loading to consume the mock before the closure action.

## Change
- Added an optional `failLoud` flag to `loadRiskTriggeredEvents`, preserving the existing quiet fallback behavior by default.
- Enabled `failLoud` only for the assistant recovery handoff closure risk refresh.
- Moved the focused test's mock setup after initial mount/flush so the failure belongs to the closure action.

## Evidence
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "risk events fail to refresh"` passed, 1 focused test.
- `npm run test:unit -- tests/unit/schedule-board.test.ts` passed, 42 tests.
- `npm run test:unit` passed, 118 files / 1242 tests.

## Result
- PASS. Assistant recovery closure now produces the specific fail-loud note when risk events cannot refresh after closure.
- PASS. The closed assistant recovery suggestion remains visible with `TRACE-AST-RECOVERY-CLOSED-001`.
