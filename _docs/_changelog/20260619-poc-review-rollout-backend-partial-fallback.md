# 2026-06-19 POC Review/Rollout Backend Partial Fallback

## Changed
- Hardened `readPocReviewSignoffRecordBackendFirst` so incomplete backend latest signoff records cannot replace a complete local POC review signoff.
- Hardened `readPocRolloutPackageRecordBackendFirst` so incomplete backend rollout packages cannot win timestamp comparison against complete local rollout evidence.
- Added regression coverage for partial backend review signoff and newer partial rollout package payloads.

## Verification
- RED: `npm run test:unit -- tests/unit/poc-review-signoff-sync.test.ts` failed on the partial backend review signoff case before implementation.
- RED: `npm run test:unit -- tests/unit/poc-rollout-package-sync.test.ts` failed on the newer partial backend rollout package case before implementation.
- GREEN: `npm run test:unit -- tests/unit/poc-review-signoff-sync.test.ts` passed: 5 tests.
- GREEN: `npm run test:unit -- tests/unit/poc-rollout-package-sync.test.ts` passed: 6 tests.
- GREEN: `npm run test:unit -- tests/unit/poc-evidence-api.test.ts` passed: 2 tests.
- GREEN filtered adjacency: `admin-board.test.ts -t "POC|上线|复盘|rollout|signoff"` passed: 1 selected, 31 skipped.
- GREEN filtered adjacency: `audit-decision-replay-panel.test.ts -t "POC|上线|复盘|rollout|signoff"` passed: 5 selected, 55 skipped.
- GREEN filtered adjacency: `report-board.test.ts -t "POC|上线|复盘|rollout|signoff"` passed: 7 selected, 21 skipped.
- GREEN: `npm run lint -- src/utils/poc-review-signoff-sync.ts src/utils/poc-rollout-package-sync.ts tests/unit/poc-review-signoff-sync.test.ts tests/unit/poc-rollout-package-sync.test.ts tests/unit/poc-evidence-api.test.ts`.
- GREEN: `git diff --check -- src/frontend/src/utils/poc-review-signoff-sync.ts src/frontend/src/utils/poc-rollout-package-sync.ts src/frontend/tests/unit/poc-review-signoff-sync.test.ts src/frontend/tests/unit/poc-rollout-package-sync.test.ts` reported only CRLF normalization warnings.
