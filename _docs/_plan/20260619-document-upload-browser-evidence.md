# Plan: DocumentUpload browser evidence

Date: 2026-06-19
Status: Completed

## Success criteria

- Open the production-preview DocumentUpload page in a real browser.
- Confirm the bilingual upload guidance is visible.
- Confirm all four related links are present with the intended destinations.
- Confirm both `#knowledge-governance` and `#knowledge-upload-help` anchors exist in the live DOM.
- Save reproducible browser artifacts under `_docs/_reports`.

## Implementation

- Built the frontend with `npm run build`.
- Served the production preview on `127.0.0.1:4173`.
- Injected local preview auth state for the guarded route.
- Captured DOM-level verification data and a full-page screenshot with Chromium.

## Verification

- Real browser JSON artifact: `_docs/_reports/document-upload-guidance-browser-20260619.json`
- Real browser screenshot: `_docs/_reports/document-upload-guidance-browser-20260619.png`
- Verified page heading: `文档上传`
- Verified guidance text includes:
  - `上传前请确认分类、有效期和引用范围`
  - `Before upload, confirm category, validity window, and citation scope`
