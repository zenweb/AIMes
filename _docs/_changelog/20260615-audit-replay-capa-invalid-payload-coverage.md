# 2026-06-15 audit replay CAPA invalid payload coverage

## Changed

- Added a focused unit test for `AuditDecisionReplayPanel.vue` covering incomplete backend payloads from the quality CAPA closure replay source.
- The test verifies the panel keeps base replay cards visible and raises an assertive sync alert instead of silently accepting incomplete audit evidence.

## Verification

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts --reporter=dot` => 29 tests passed.
- `npm run test:unit:coverage -- --reporter=dot` => 111 files / 959 tests passed.
- Overall frontend coverage: statements 87.02%, branches 73.18%, functions 86.34%, lines 90.31%.
- `AuditDecisionReplayPanel.vue`: statements 82.26%, branches 49.42%, functions 87.73%, lines 84.59%.

## Rationale

`AuditDecisionReplayPanel.vue` was the lowest line-covered current component after the previous Skill Matrix slice and is part of the phase-one auditability/compliance path.
