# 2026-06-30 Scheduling E2E Offline Demo / Live Backend Closure

## Scope

- Module: `src/frontend/tests/e2e/scheduling.spec.ts`
- Goal: close the Scheduling real-browser red cluster without changing business UI behavior.

## Root Cause

Several fail-loud tests intended to mock backend error paths were still entering the page with `offlineDemo=1`.
The URL query has higher priority than `localStorage`, so setting `aimes_offline_demo=false` inside the test did not reliably re-enable mocked backend requests.

The batch optimize feedback test also used an older `optimize-compare` response contract. The UI now correctly requires recommendation score, score breakdown, and formula metadata before rendering the compare cards.

## Changes

- Added `FAIL_LOUD_BACKEND_EVIDENCE_TITLES` and routed those tests through `offlineDemo=0` in `beforeEach`.
- Kept demo-mode route navigation explicit for report/scheduling round-trips.
- Updated the batch compare mock with `recommendationScore`, `recommendationScoreBreakdown`, and `recommendationScoreFormula`.

## Verification

- `npm run test:e2e -- tests/e2e/scheduling.spec.ts -g "批量方案反馈同步失败"`: 1 passed.
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts`: 36 passed.

## Remaining Risk

Full frontend E2E has not been re-run after this Scheduling closure in this report. Previous full-suite run timed out before producing a complete pass/fail verdict.
