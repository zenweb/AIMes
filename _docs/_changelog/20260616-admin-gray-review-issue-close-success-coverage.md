# 2026-06-16 Admin Gray Review Issue Close Success Coverage

- Added unit regression coverage for `AdminBoard.vue` quality gray rollback review issue closure.
- Locked the governance intent that closing a rollback review issue with negative samples must:
  - call `closeQualityKnowledgeGrayReviewIssueWithNegativeSample`;
  - refresh gray release decision records from backend authority;
  - clear the admin alert on success;
  - show the closed review issue label;
  - show the validation audit id;
  - remove follow-up action buttons after the issue is closed.
- No production component code was changed; the existing governance behavior was made auditable by regression evidence.

## Verification

- `npm run test:unit -- tests/unit/admin-board.test.ts -t "negative samples close" --reporter=dot`
  - `1 passed | 22 skipped`
- `npm run test:unit:coverage -- tests/unit/admin-board.test.ts --reporter=dot --coverage.reporter=text`
  - `1 file / 23 tests passed`
  - `AdminBoard.vue`: statements `83.35%`, branches `51.18%`, functions `69.51%`, lines `86%`
- `npm run test:unit:coverage -- --reporter=dot`
  - `111 files / 1038 tests passed`
  - all files: statements `88.92%`, branches `76.16%`, functions `88.57%`, lines `92.11%`

## Notes

- This slice does not claim the 14-day gray observation gate is complete.
- It only strengthens the Admin governance evidence loop for quality gray rollback issue closure.
