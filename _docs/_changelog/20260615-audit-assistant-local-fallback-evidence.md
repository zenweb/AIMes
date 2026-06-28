# 2026-06-15 Audit assistant local fallback evidence

## Changed

- Added regression coverage for assistant action audit replay when the backend returns an invalid payload.
- Exposed the local `readAssistantActionAudits` mock in the audit replay unit test so fallback behavior is asserted directly.
- Updated `AuditDecisionReplayPanel` so invalid backend assistant-audit payloads still fail loud while preserving local assistant action replay evidence.
- Added the assistant execution feedback text to the customer commitment replay detail steps.

## Verification

- RED: `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot` failed because the replay detail fell back to the base AI suggestion instead of local assistant evidence.
- GREEN: `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot` passed 1 file / 31 tests.
- Full coverage: `npm run test:unit:coverage -- --reporter=dot` passed 111 files / 964 tests.

## Coverage

- Total after this slice: statements 87.18%, branches 73.66%, functions 86.45%, lines 90.46%.
- `AuditDecisionReplayPanel.vue`: statements 82.88%, branches 50.56%, functions 88.78%, lines 84.95%.

## Notes

- This keeps the audit replay experience fail-loud without dropping local evidence when backend assistant audit data is malformed.
- PostgreSQL/staging release evidence remains outside this frontend unit slice.
