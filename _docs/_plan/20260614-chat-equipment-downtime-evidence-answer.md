# 2026-06-14 Plan - Chat Equipment Downtime Evidence Answer

## Success Criteria
- Existing equipment-downtime assistant answer has direct unit evidence.
- Focused unit test passes.
- Focused component coverage increases without production code churn.
- Full frontend coverage remains green.
- A matching real Chromium chat workflow remains green.
- Sensitive scan for touched files is clean.

## Scope
- In scope: `src/frontend/tests/unit/chat-panel.test.ts` and required documentation.
- Out of scope: new chat behavior, release gray observation, unrelated refactors.

## Result
- Added the unit evidence.
- `ChatPanel.vue` focused line coverage reached 70.60%.
- Full frontend coverage passed with 673 tests.
- Real Chromium equipment-downtime question workflow passed.
