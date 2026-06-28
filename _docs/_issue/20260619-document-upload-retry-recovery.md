# Issue — Failed Document Uploads Could Not Be Retried In Place

## Problem
When a knowledge document upload failed or received a malformed backend response, the queue row moved to `error`. The global upload button only enabled for `pending` files, so the operator could not retry the same file in place.

## Impact
Operators had to delete the row and select the same file again. For knowledge ingestion, that weakens recovery ergonomics and can interrupt category/evidence-scope review during a complex operation.

## Resolution
Failed rows now keep the original file, show bilingual recovery guidance, link to knowledge upload help, and expose `重试上传`. Clicking it resets the row to `pending`, allowing the normal upload path to run again and record successful history.

## Evidence
See `_docs/_changelog/20260619-document-upload-retry-recovery.md`.
