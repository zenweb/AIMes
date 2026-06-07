# 2026-06-06 Audit Decision Replay Quality Gray Decision

## Changed

- Added `AuditDecisionReplayPanel` unit tests for quality gray release rollback decision replay priority.
- Verified malformed quality gray decision payloads fail loud and leave the base replay chain visible.
- Application code unchanged; this slice strengthens evidence for an existing audit replay path.

## Verification

- `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`
  - Result: PASS
  - Tests: `15 passed`
- `npm run test:unit:coverage`
  - Result: PASS
  - Test files: `84 passed`
  - Tests: `515 passed`
- `npm run test:e2e -- tests/e2e/audit.spec.ts`
  - Result: PASS
  - Browser: Chromium
  - Tests: `12 passed`
  - Largest JS chunk observed: `817.50 kB`

## Coverage Delta

- Global lines: `77.48% -> 77.50%`
- Global branches: `56.83% -> 56.93%`
- `AuditDecisionReplayPanel.vue` lines: `63.98% -> 64.68%`
- `AuditDecisionReplayPanel.vue` branches: `14.86% -> 16.91%`

## Release Gate Impact

- Improves frontend audit replay quality evidence.
- Does not close hosted CI, PostgreSQL/staging, attack-chain A/B/C, security signoff, or gray observation gates.
