# 2026-06-16 Knowledge Governance Reopened Gray Citation Coverage

- Added focused unit evidence for `KnowledgeGovernancePanel.vue` without changing production code.
- Covered AI assistant citation trace rendering, including governed source names, blocked-source audit evidence, and review-status styling.
- Covered rolled-back retraining versions showing the corrected reapproval note instead of another rollback action.
- Covered reopened R3 gray decisions:
  - gray-published R3 with reopened issue and no republish evidence routes to `重新运行灰度前校验`;
  - validation-passed R3 with republish evidence routes to `重新灰度发布 R3`.
- Updated `.omx/state/task-hold-on.json` to keep the resumed task `active` and record the latest evidence.

## Verification

- `npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts -t "reopened R3" --reporter=dot`: `2 passed`.
- `npm run test:unit -- tests/unit/knowledge-governance-panel.test.ts --reporter=dot`: `9 passed`.
- `npm run test:unit:coverage -- tests/unit/knowledge-governance-panel.test.ts --reporter=dot --coverage.reporter=text`: test file `9 passed`; `KnowledgeGovernancePanel.vue` statements `91.26%`, branches `86.04%`, functions `98.3%`, lines `100%`; command returned exit `1` only because single-file imported global coverage stayed below the global threshold.
- `npm run test:unit:coverage -- --reporter=dot`: `111 files / 1050 tests passed`; statements `89.19%`, branches `76.38%`, functions `89.17%`, lines `92.36%`.
