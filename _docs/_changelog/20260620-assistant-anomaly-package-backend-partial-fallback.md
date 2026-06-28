# 2026-06-20 Assistant Anomaly Package Backend Partial Fallback

## Changed
- Added fail-loud support to assistant anomaly package backend reads.
- `readAssistantAnomalyDispositionPackagesBackendFirst()` now rejects non-array backend audit payloads in fail-loud mode with `后端返回非数组异常处置包审计载荷`.
- Backend anomaly disposition package records are filtered through the existing complete package guard before merging with local evidence.
- Incomplete backend records no longer replace complete local anomaly disposition evidence.

## Validation
- `npm run test:unit -- tests/unit/assistant-anomaly-card-sync.test.ts` -> 8 passed.
- `npm run test:unit -- tests/unit/assistant-evidence-api.test.ts` -> 5 passed.
- `npm run test:unit -- tests/unit/chat-panel.test.ts -t "异常处置|anomaly disposition|CNC-001 主轴温升|创建异常处置卡"` -> 3 passed, 68 skipped.
- `npm run test:unit -- tests/unit/anomaly-dispatch-sync.test.ts tests/unit/production-anomaly-sync.test.ts` -> 13 passed.
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "异常|anomaly|OTD|证据|回放|audit|审计"` -> 22 passed, 38 skipped.
- `npm run test:unit -- tests/unit/anomaly-board.test.ts -t "异常|anomaly|处置|dispatch"` -> 19 passed, 3 skipped.
- `npm run lint -- src/api/assistantEvidence.ts src/utils/assistant-anomaly-card-sync.ts tests/unit/assistant-anomaly-card-sync.test.ts tests/unit/assistant-evidence-api.test.ts` -> passed.
- `git diff --check -- src/frontend/src/api/assistantEvidence.ts src/frontend/src/utils/assistant-anomaly-card-sync.ts src/frontend/tests/unit/assistant-anomaly-card-sync.test.ts src/frontend/tests/unit/assistant-evidence-api.test.ts` -> passed with CRLF warnings only.
