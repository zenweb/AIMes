# Changelog: DocumentUpload knowledge intake guidance links

Date: 2026-06-19

## Changed

- Added a bilingual knowledge-intake guidance panel to `DocumentUpload.vue`.
- Added contextual links for:
  - `知识治理队列` -> `#knowledge-governance`
  - `质量证据复核` -> `/quality`
  - `报表证据中心` -> `/report`
  - `帮助：知识入库支持` -> `#knowledge-upload-help`
- Added unit coverage proving the guidance, related links, and help affordance are rendered.

## Verification

- RED: `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false -t "guides knowledge upload"` failed because `.upload-guidance` was missing.
- GREEN: target test passed.
- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false` passed: 30 tests.
- `npm run test:unit:coverage` passed: 111 files / 1069 tests.
- `npm run lint` passed.
