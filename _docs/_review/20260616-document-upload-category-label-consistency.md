# 2026-06-16 Document Upload Category Label Consistency Review

## Finding

Successful document uploads used two different category vocabularies in the same workflow.

## Impact

After selecting `质量文档` and uploading a document, the governance review queue showed `质量文档`, while the upload history table showed the raw backend key `quality`. This made the knowledge upload audit trail look less polished and could confuse operators reviewing whether the correct category was applied.

## Fix

- Reused `categoryLabel(category.value)` when writing the upload history row.
- Left the backend upload request unchanged so API compatibility is preserved.

## Verification

- Red/green test cycle completed.
- DocumentUpload targeted suite passed: `29 passed`.
- Full frontend suite passed: `111 files / 1059 tests passed`.

## Remaining Risk

- `DocumentUpload.vue` remains a good future target by coverage leverage: statements `82.67%`, branches `66.32%`, functions `87.3%`, lines `87.23%`.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
