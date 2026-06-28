# 2026-06-15 Audit replay assistant/CAPA/business-write coverage

## Changed

- Added audit replay coverage for AI assistant equipment downtime package audit records.
- Added quality CAPA closure replay coverage and default selection evidence.
- Added quality-inspection and equipment business-write replay coverage with object links and trace evidence.
- Production component code was not changed.

## Validation

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`
  - 1 file passed, 28 tests passed.
- `npm run test:unit:coverage -- tests/unit/audit-decision-replay-panel.test.ts --coverage.include=src/components/auditLog/AuditDecisionReplayPanel.vue`
  - AuditDecisionReplayPanel.vue: statements 81.77%, branches 49.26%, functions 87.73%, lines 84.03%.
- `npm run test:unit:coverage -- --reporter=dot`
  - 111 files passed, 900 tests passed.
  - Global coverage: statements 84.72%, branches 70.47%, functions 82.27%, lines 88.04%.

