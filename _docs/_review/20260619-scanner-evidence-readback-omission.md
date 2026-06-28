# 2026-06-19 Review: Scanner evidence readback omission

## Scope
- Reviewed `ScannerBoard` barcode evidence confirmation after write.
- Focused on the case where local write succeeds but backend readback returns an incomplete list.

## Finding
- Before this slice, a successful evidence write followed by a backend readback that omitted the just-written scan record replaced local state with the stale backend list.
- That could make the UI silently show the scan as unconfirmed even though the local evidence write had succeeded.

## Resolution
- Added readback containment logic that checks the refreshed records for the written `id` or normalized `code`.
- If the record is missing, the component keeps the local record, merges any returned backend records, and displays `扫码证据读回缺失`.

## Verification
- Targeted RED/GREEN test for backend omission.
- `npm run test:unit -- tests/unit/scanner-board.test.ts`: 14 passed.
- `npm run test:unit:coverage`: 111 files / 1108 tests passed.
- `npm run lint`: passed.
- `npm run build`: passed.

## Residual Risk
- This is frontend fail-loud containment. It does not prove backend persistence recovered the omitted record.
- Follow-up API-helper evidence is now added: `writeBarcodeScanEvidenceRecordAndReadBack` posts barcode scan evidence, queries backend evidence with fail-loud semantics, requires the written `id` to be present, and replaces local state with the backend-confirmed record.
- Existing backend integration coverage already exercises `POST /api/v1/scheduling/barcode-scan-evidence` followed by `GET /api/v1/scheduling/barcode-scan-evidence?take=5`.
- Remaining optional evidence is staging/real-browser proof against a live backend endpoint, not a frontend contract gap.

## Follow-up Verification
- `npm run test:unit -- tests/unit/barcode-scan-evidence-sync.test.ts`: 9 passed.
- `npm run test:unit -- tests/unit/scanner-board.test.ts`: 15 passed.
- `npm run test:unit -- tests/unit/execution-evidence-api.test.ts`: 2 passed.
- `npm run lint`: passed.
- `npm run build`: passed.

## Follow-up Review Note
- The helper test now asserts that the backend-confirmed barcode trace also updates the local OTD evidence-chain record, preventing a split-brain state where scanner evidence shows backend readback but OTD review still shows the pre-readback local trace.
