# 2026-06-20 Assistant Recovery Package Backend Partial Fallback

## Changed
- Added backend payload validation for assistant recovery package refresh.
- `readAssistantRecoveryPackagesBackendFirst()` now rejects non-array backend audit payloads in fail-loud mode with `后端返回非数组执行包审计载荷`.
- Backend recovery package records are filtered through the existing complete `AssistantRecoveryPackage` guard before merging with local evidence.
- Incomplete backend records no longer replace complete local recovery package evidence.

## Validation
- `npm run test:unit -- tests/unit/assistant-action-package-sync.test.ts` -> 9 passed.
- `npm run test:unit -- tests/unit/assistant-evidence-api.test.ts` -> 4 passed.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "assistant|助手|recovery|恢复|执行包|采购|质量"` -> 8 passed, 61 skipped.
- `npm run test:unit -- tests/unit/purchase-board.test.ts -t "assistant|助手|recovery|恢复|采购"` -> 2 passed, 35 skipped.
- `npm run test:unit -- tests/unit/chat-panel.test.ts -t "recovery|恢复|执行包|采购|质量|交期"` -> 4 passed, 67 skipped.
- `npm run lint -- src/utils/assistant-action-package-sync.ts tests/unit/assistant-action-package-sync.test.ts tests/unit/assistant-evidence-api.test.ts` -> passed.
- `git diff --check -- src/frontend/src/utils/assistant-action-package-sync.ts src/frontend/tests/unit/assistant-action-package-sync.test.ts` -> passed with CRLF warnings only.
