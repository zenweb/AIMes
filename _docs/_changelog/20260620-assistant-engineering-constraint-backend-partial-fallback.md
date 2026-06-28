# 2026-06-20 Assistant Engineering Constraint Backend Partial Fallback

## Changed
- Added backend payload validation for assistant engineering constraint package refresh.
- `readAssistantEngineeringConstraintPackagesBackendFirst()` now rejects non-array backend audit payloads in fail-loud mode with `后端返回非数组工程约束包审计载荷`.
- Backend engineering constraint package records are filtered through the existing complete package guard before merging with local evidence.
- Incomplete backend records no longer replace complete local BOM, route, quality gate, scheduling, and OTD evidence.

## Validation
- `npm run test:unit -- tests/unit/assistant-engineering-constraint-package-sync.test.ts` -> 8 passed.
- `npm run test:unit -- tests/unit/assistant-evidence-api.test.ts` -> 4 passed.
- `npm run test:unit -- tests/unit/schedule-board.test.ts -t "工程约束|engineering constraint|Assistant 工程约束|constraint"` -> 1 passed, 68 skipped.
- `npm run test:unit -- tests/unit/chat-panel.test.ts -t "工程约束|engineering constraint|BOM-A100|R-B200"` -> 4 passed, 67 skipped.
- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "OTD|证据|回放|replay|audit|审计"` -> 57 passed, 3 skipped.
- `npm run test:unit -- tests/unit/engineering-constraint-panel.test.ts` -> 2 passed.
- `npm run lint -- src/utils/assistant-engineering-constraint-package-sync.ts tests/unit/assistant-engineering-constraint-package-sync.test.ts tests/unit/assistant-evidence-api.test.ts tests/unit/engineering-constraint-panel.test.ts` -> passed.
- `git diff --check -- src/frontend/src/utils/assistant-engineering-constraint-package-sync.ts src/frontend/tests/unit/assistant-engineering-constraint-package-sync.test.ts` -> passed with CRLF warnings only.
