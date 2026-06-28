# Changelog: DocumentUpload browser evidence

Date: 2026-06-19

## Changed

- Captured real Chromium evidence for `DocumentUpload.vue` in production preview.
- Verified the bilingual upload guidance panel is visible on `/scheduling/knowledge/documents`.
- Verified contextual links for `知识治理队列`, `质量证据复核`, `报表证据中心`, and `帮助：知识入库支持`.
- Verified `#knowledge-governance` and `#knowledge-upload-help` anchors render in the live page contract.
- Stored browser artifacts in:
  - `_docs/_reports/document-upload-guidance-browser-20260619.json`
  - `_docs/_reports/document-upload-guidance-browser-20260619.png`

## Verification

- `npm run build` passed.
- Production preview served at `http://127.0.0.1:4173/scheduling/knowledge/documents`.
- Real browser evidence confirmed the guidance block, links, and help section.
- Preview also exposed backend-missing fallback alerts, which were recorded as environment boundaries rather than hidden.
