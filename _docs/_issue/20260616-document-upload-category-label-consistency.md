# 2026-06-16 Document Upload Category Label Consistency Issue

## Status

Closed for this slice.

## Problem

The document upload workflow used inconsistent category labels after a successful upload:

- Governance review queue displayed the user-facing category label, such as `质量文档`.
- Upload history displayed the raw backend key, such as `quality`.

This was a user-visible polish and audit-trace consistency gap in an existing knowledge-management workflow.

## Resolution

`DocumentUpload.vue` now writes the upload history category with `categoryLabel(category.value)`, matching the governance review queue while preserving the backend upload request key.

## Evidence

- Regression test failed before the fix because history contained raw `quality` and lacked `质量文档`.
- Regression test passed after the fix: `1 passed | 28 skipped`.
- DocumentUpload targeted coverage passed with `29 passed`.
- Full frontend coverage passed with `111 files / 1059 tests passed`.

## Remaining Open Item

This does not close the whole CC remediation goal. Release strict readiness remains blocked by deferred gray observation.
