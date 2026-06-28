# 2026-06-19 Plan: Customer order import backend partial fallback

## Success Criteria
- Customer order import backend-first reads must not accept partial records that cannot explain mapped field lineage.
- Complete local POC import evidence must remain visible when backend readback is incomplete.
- Knowledge intake and POC evidence API adjacent checks must keep passing.

## Execution
- Add RED test for partial backend customer import payload.
- Apply minimal shape guard at the backend-first read boundary.
- Run targeted and adjacent unit tests.

## Result
- Completed.
- Verification:
  - `npm run test:unit -- tests/unit/customer-order-import-sync.test.ts`
  - `npm run test:unit -- tests/unit/document-upload.test.ts -t "customer|客户|import|导入|POC"`
  - `npm run test:unit -- tests/unit/poc-evidence-api.test.ts`
