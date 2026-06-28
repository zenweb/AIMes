# 2026-06-19 Outsourcing Commitment Backend Partial Fallback

## Changed
- Hardened `readOutsourcingCommitmentPackagesBackendFirst` so incomplete backend outsourcing commitment packages cannot replace complete local partner promise evidence.
- Hardened `readLatestOutsourcingCommitmentPackageBackendFirst` so incomplete backend latest records cannot hide complete customer-facing release evidence.
- Added regression coverage for partial backend list payloads and partial latest payloads.

## Verification
- RED: `npm run test:unit -- tests/unit/outsourcing-commitment-sync.test.ts` failed on both partial backend list/latest cases before implementation.
- GREEN: `npm run test:unit -- tests/unit/outsourcing-commitment-sync.test.ts` passed: 9 tests.
- GREEN: `npm run test:unit -- tests/unit/outsourcing-evidence-api.test.ts` passed: 2 tests.
- GREEN filtered adjacency: `report-board.test.ts -t "外协|outsourcing|承诺|release"` passed: 2 selected, 26 skipped.
- GREEN filtered adjacency: `schedule-board.test.ts -t "外协|outsourcing|承诺|release"` passed: 11 selected, 58 skipped.
- GREEN: `npm run lint -- src/utils/outsourcing-commitment-sync.ts tests/unit/outsourcing-commitment-sync.test.ts tests/unit/outsourcing-evidence-api.test.ts`.
- GREEN: `git diff --check -- src/frontend/src/utils/outsourcing-commitment-sync.ts src/frontend/tests/unit/outsourcing-commitment-sync.test.ts` reported only CRLF normalization warnings.
