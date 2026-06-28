# Plan: DocumentUpload knowledge intake guidance links

Date: 2026-06-19
Status: Completed

## Success criteria

- DocumentUpload shows Simplified Chinese and English guidance for knowledge intake.
- Related points are clickable contextual links.
- Complex upload/governance work has a help/support affordance.
- Existing upload and governance tests remain green.

## Implementation

- Added `.upload-guidance` above the drop zone.
- Added links to knowledge governance, quality evidence, report evidence, and help support.
- Added a focused unit test covering the user-facing contract.

## Verification

- Target RED/GREEN cycle completed.
- `npx vitest run tests/unit/document-upload.test.ts --coverage.enabled=false`: 30 passed.
- `npm run test:unit:coverage`: 111 files / 1069 tests passed.
- `npm run lint`: passed.
