# 2026-06-15 Audit config approval local fallback evidence

## Changed

- Added regression coverage for configuration approval replay when the backend returns an invalid payload.
- Verified local configuration approval records remain visible in the approval lane and replay cards while the backend error is still surfaced.
- Updated `AuditDecisionReplayPanel` so invalid backend configuration approval payloads preserve local approval evidence after recording the fail-loud alert.

## Verification

- RED: `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot` failed because the approval badge stayed `0 个配置待审批`.
- GREEN: `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot` passed 1 file / 32 tests.
- Full coverage: `npm run test:unit:coverage -- --reporter=dot` passed 111 files / 965 tests.

## Coverage

- Total after this slice: statements 87.20%, branches 73.70%, functions 86.49%, lines 90.47%.
- `AuditDecisionReplayPanel.vue`: statements 83.25%, branches 51.52%, functions 89.81%, lines 85.31%.

## Notes

- This keeps the configuration approval audit path fail-loud without losing local approval evidence during backend degradation.
- PostgreSQL/staging release evidence remains outside this frontend unit slice.
