# 2026-06-15 Chat restricted action denial lock

## Changed

- Added regression coverage for restricted assistant actions after a denial audit is written.
- Updated `ChatPanel` so a restricted action is locked after denial audit succeeds.
- This prevents repeated clicks from writing duplicate denial audit evidence for the same action.

## Verification

- RED: `npm run test:unit -- tests/unit/chat-panel.test.ts --reporter=dot` failed because the denied action button was not disabled.
- GREEN: `npm run test:unit -- tests/unit/chat-panel.test.ts --reporter=dot` passed 1 file / 65 tests.
- Full coverage: `npm run test:unit:coverage -- --reporter=dot` passed 111 files / 967 tests.

## Coverage

- Total after this slice: statements 87.20%, branches 73.71%, functions 86.50%, lines 90.47%.
- `ChatPanel.vue`: statements 84.86%, branches 77.06%, functions 83.76%, lines 85.36%.

## Notes

- If denial audit writing fails, the action remains retryable so the user can attempt to record the denial evidence again.
- PostgreSQL/staging release evidence remains outside this frontend unit slice.
