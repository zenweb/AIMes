# 2026-06-19 Review: Customer order import backend partial fallback

## Scope
- Reviewed `customer-order-import-sync.ts` backend-first reads for POC customer order import evidence.
- Focused on field-mapping lineage and batch completeness before evidence is used by knowledge intake and POC governance views.

## Finding
- Local reads already removed incomplete import evidence.
- Backend-first reads trusted the latest backend record directly, so partial records could override a complete local POC sample.

## Resolution
- Reused `isCustomerOrderImportEvidence` at the backend-first boundary.
- Backend records that fail the guard now fall back to local complete evidence.

## Verification
- `npm run test:unit -- tests/unit/customer-order-import-sync.test.ts`: 9 passed.
- `npm run test:unit -- tests/unit/document-upload.test.ts -t "customer|客户|import|导入|POC"`: 6 passed, 31 skipped by filter.
- `npm run test:unit -- tests/unit/poc-evidence-api.test.ts`: 2 passed.

## Residual Risk
- This is frontend evidence-shape containment. Live staging should still verify backend POC import records are complete.
