# 2026-06-14 Shortage Risk Sync Supplier Network Evidence

## Change
- Added focused evidence for existing shortage risk sync behavior.
- Covered:
  - supply risk escalation local persistence, backend sync, and backend-first fallback;
  - supplier network decision local persistence, candidate scoring evidence, backend sync, and backend-first fallback.

## Evidence
- `npm run test:unit -- tests/unit/shortage-risk-sync.test.ts`
  - 1 file passed.
  - 11 tests passed.
- `npm run test:unit:coverage -- tests/unit/shortage-risk-sync.test.ts`
  - `src/utils/shortage-risk-sync.ts`: statements 70.18%, branches 78.65%, functions 87.50%, lines 81.61%.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 666 tests passed.
  - global statements 78.11%, branches 63.03%, functions 73.84%, lines 81.72%.
- `npm run test:e2e -- tests/e2e/purchase.spec.ts -g "供应商绩效 SLA 选优进入排产复核和 OTD 审计"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Notes
- No production code change was required; existing sync behavior already supported the covered paths.
- The value of this slice is direct evidence on a low-coverage, user-critical shortage and supplier network path.
- Gray observation remains skipped/deferred by owner direction and is not used as a blocker for this work item.
