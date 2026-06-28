# Issue: DocumentUpload lacked real browser proof for guidance and help links

Date: 2026-06-19
Status: Resolved for this slice

## Problem

Unit coverage already proved the DocumentUpload guidance panel and help anchors in component tests, but this feature still lacked real browser evidence showing the rendered page contract in production preview.

## Resolution

Captured a production-preview Chromium run against `/scheduling/knowledge/documents` and recorded the rendered guidance text, related links, governance anchor, and help section.

## Evidence

- `_docs/_reports/document-upload-guidance-browser-20260619.json`
- `_docs/_reports/document-upload-guidance-browser-20260619.png`
- `npm run build` passed before preview verification.

## Boundary

The same browser pass surfaced backend HTML fallback alerts. Those alerts were preserved in the JSON evidence and are treated as preview-environment availability signals, not as UI test failures for this slice.
