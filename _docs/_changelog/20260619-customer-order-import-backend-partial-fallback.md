# 2026-06-19 Changelog: Customer order import backend partial fallback

## Changed
- Hardened customer order import backend-first evidence reads.
- Backend POC import records now must include complete customer batch, source file, source system, imported/high-risk counts, mapped field lineage, and prepared timestamp before replacing local evidence.
- Partial backend mapping payloads fall back to local complete POC sample evidence.

## Evidence
- RED: `npm run test:unit -- tests/unit/customer-order-import-sync.test.ts` failed because a partial backend record with empty `mappedFields` was returned directly.
- GREEN: `npm run test:unit -- tests/unit/customer-order-import-sync.test.ts` passed, 9 tests.
- Adjacent checks:
  - `npm run test:unit -- tests/unit/document-upload.test.ts -t "customer|客户|import|导入|POC"` passed, 6 tests and 31 skipped by filter.
  - `npm run test:unit -- tests/unit/poc-evidence-api.test.ts` passed, 2 tests.

## Release Gate Note
- Strict v1.0.0 remains gated by first gray observation and the two-week no P0/P1 window.
