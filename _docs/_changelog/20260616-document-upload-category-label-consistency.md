# 2026-06-16 Document Upload Category Label Consistency

- Fixed `DocumentUpload.vue` successful upload history so the selected category is shown with the same user-facing label used by the governance review queue.
- `quality` now appears as `质量文档` in upload history, matching the governance document card for the same uploaded file.
- Kept the API request payload unchanged; `uploadDocument` still receives the backend category key such as `quality`.

## Verification

- Red test first:
  - `npm run test:unit -- tests/unit/document-upload.test.ts -t "adds successful uploads to the governance review queue with the selected category" --reporter=dot`
  - Expected failure observed: upload history contained raw `quality` and did not contain `质量文档`.
- Green targeted test:
  - Same command passed: `1 passed | 28 skipped`.
- Targeted coverage:
  - `npm run test:unit:coverage -- tests/unit/document-upload.test.ts --reporter=dot --coverage.reporter=text`
  - `29 passed`.
  - `DocumentUpload.vue`: statements `82.67%`, branches `66.32%`, functions `87.3%`, lines `87.23%`.
- Full frontend coverage:
  - `npm run test:unit:coverage -- --reporter=dot --coverage.reporter=text`
  - `111 files / 1059 tests passed`.
  - Totals: statements `89.5%`, branches `77.01%`, functions `89.5%`, lines `92.64%`.
