# 2026-06-19 Assistant Action Audit Backend Partial Fallback

## Changed
- Hardened `readAssistantActionAuditsBackendFirst` so incomplete backend assistant action audit records cannot enter admin/audit replay evidence.
- Added regression coverage for partial backend assistant action audit arrays.

## Verification
- RED: `npm run test:unit -- tests/unit/assistant-action-audit.test.ts` failed on the partial backend audit case before implementation.
- GREEN: `npm run test:unit -- tests/unit/assistant-action-audit.test.ts` passed: 9 tests.
- GREEN: `npm run test:unit -- tests/unit/assistant-evidence-api.test.ts` passed: 4 tests.
- GREEN filtered adjacency: `admin-board.test.ts -t "assistant|助手|审计|audit"` passed: 1 selected, 31 skipped.
- GREEN filtered adjacency: `audit-decision-replay-panel.test.ts -t "assistant|助手|审计|audit"` passed: 18 selected, 42 skipped.
- GREEN filtered adjacency: `chat-panel.test.ts -t "assistant|助手|audit|审计|action"` passed: 30 selected, 41 skipped.
- GREEN: `npm run lint -- src/utils/assistant-action-audit.ts tests/unit/assistant-action-audit.test.ts tests/unit/assistant-evidence-api.test.ts`.
- GREEN: `git diff --check -- src/frontend/src/utils/assistant-action-audit.ts src/frontend/tests/unit/assistant-action-audit.test.ts` reported only CRLF normalization warnings.
