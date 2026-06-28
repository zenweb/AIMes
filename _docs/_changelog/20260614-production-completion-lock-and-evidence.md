# 2026-06-14 Production Completion Lock and Evidence

## Change
- Locked production operation completion confirmation after a completion is already submitting or completed.
- Added a handler-level guard so repeated confirmation cannot call `completeOperation` twice or duplicate OTD completion / closeout evidence.
- Kept API failure retry behavior intact by releasing the submitting guard when backend completion fails.
- Extended Chromium evidence to confirm a completed OP-20 operation no longer exposes the `完工` action.

## Evidence
- RED first: `npm run test:unit -- tests/unit/production-board.test.ts -t "locks a completed operation confirmation"`
  - Failed because `completeOperation` was called 2 times.
- GREEN: `npm run test:unit -- tests/unit/production-board.test.ts -t "locks a completed operation confirmation"`
  - 1 focused test passed.
- `npm run test:unit -- tests/unit/production-board.test.ts`
  - 26 tests passed.
- `npm run test:unit -- tests/unit/production-board.test.ts -t "keeps in-progress operation state when completion api fails"`
  - 1 focused regression test passed.
- `npm run test:e2e -- tests/e2e/production.spec.ts -g "完工后生成排产与质量回写记录" --project=chromium`
  - Chromium: 1 test passed.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 765 tests passed.
  - Global lines: 84.01%.
  - `ProductionBoard.vue` lines: 79.16%.

## Notes
- This is existing production-reporting path hardening, not new scope.
- Gray observation / 15-day monitoring remains skipped by owner direction and is not counted as a current blocker.
