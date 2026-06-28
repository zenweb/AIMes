# 2026-06-16 Chat Quality Knowledge Reuse Routing Coverage

- Fixed `ChatPanel.vue` offline/demo answer routing so quality knowledge reuse questions are not swallowed by the broader quality rework impact intent.
- Added `isQualityKnowledgeReuseIntent` and excluded that intent from the quality rework branch.
- Added focused unit evidence for the published quality knowledge reuse path:
  - reusable scan/rework CAPA sample;
  - same-defect draft disposition;
  - verified formal CAPA effect writeback;
  - R3 gray-published recommendation version;
  - accepted recommendation feedback entering R4 next-training.
- Updated `.omx/state/task-hold-on.json` with the latest active slice and coverage evidence.

## Verification

- Red first: `npm run test:unit -- tests/unit/chat-panel.test.ts -t "published quality knowledge reuse" --reporter=dot` failed because the question routed to `质量返工影响` instead of `扫码质量复用建议`.
- Green after fix: same command passed with `1 passed`.
- `npm run test:unit -- tests/unit/chat-panel.test.ts --reporter=dot`: `68 passed`.
- `npm run test:unit -- tests/unit/chat-panel.test.ts -t "quality rework impact" --reporter=dot`: `1 passed`.
- `npm run test:unit:coverage -- tests/unit/chat-panel.test.ts --reporter=dot --coverage.reporter=text`: `68 passed`; `ChatPanel.vue` statements `87.38%`, branches `79.71%`, functions `83.89%`, lines `87.96%`.
- `npm run test:unit:coverage -- --reporter=dot`: `111 files / 1051 tests passed`; statements `89.29%`, branches `76.53%`, functions `89.17%`, lines `92.47%`.
