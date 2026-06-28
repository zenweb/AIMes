# 2026-06-20 Outsourcing Commitment Backend Fail Loud

## Changed
- Added fail-loud support to outsourcing commitment list and latest backend reads.
- `readOutsourcingCommitmentPackagesBackendFirst()` now rejects non-array backend audit payloads in fail-loud mode with `后端返回非数组外协承诺审计载荷`.
- Outsourcing commitment backend list records continue to be filtered through the complete commitment package guard before being trusted.
- Latest outsourcing commitment reads now require a complete package before replacing local customer-facing release evidence.

## Validation
- `npm run test:unit -- tests/unit/outsourcing-commitment-sync.test.ts` -> 12 passed.
- `npm run test:unit -- tests/unit/outsourcing-evidence-api.test.ts` -> 3 passed.
- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "外协|outsourcing|到货|承诺"` -> 4 passed, 33 skipped.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "外协|outsourcing|排产释放|到货"` -> 7 passed, 62 skipped.
- `npm run test:unit -- tests/unit/report-board.test.ts -t "外协|outsourcing|OTD|drilldown|钻取"` -> 11 passed, 17 skipped.
- `npm run test:unit -- tests/unit/otd-evidence-api.test.ts` -> 2 passed.
- `npm run lint -- src/api/outsourcingEvidence.ts src/utils/outsourcing-commitment-sync.ts tests/unit/outsourcing-commitment-sync.test.ts tests/unit/outsourcing-evidence-api.test.ts` -> passed.
- `git diff --check -- src/frontend/src/api/outsourcingEvidence.ts src/frontend/src/utils/outsourcing-commitment-sync.ts src/frontend/tests/unit/outsourcing-commitment-sync.test.ts src/frontend/tests/unit/outsourcing-evidence-api.test.ts` -> passed with CRLF warnings only.
