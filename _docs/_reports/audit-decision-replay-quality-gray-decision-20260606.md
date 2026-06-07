# 2026-06-06 Audit Decision Replay Quality Gray Decision

## Scope

- Target: `AuditDecisionReplayPanel.vue` quality gray release decision replay.
- User path verified: audit decision replay opens the compliance-critical quality gray rollback decision chain when that evidence exists.
- Boundary: frontend quality evidence only; this does not close release B-track gates.

## Change

- Added unit coverage for quality gray release rollback decision priority.
- Verified the default replay detail selects the quality gray rollback chain instead of falling back to the base rush-order demo chain.
- Verified malformed quality gray decision payloads fail loud and do not pollute the replay list.
- No production application code changed.

## Verification

- Command: `npm run test:unit -- tests/unit/audit-decision-replay-panel.test.ts`
  - Result: PASS
  - Tests: `15 passed`
- Command: `npm run test:unit:coverage`
  - Result: PASS
  - Test files: `84 passed`
  - Tests: `515 passed`
- Command: `npm run test:e2e -- tests/e2e/audit.spec.ts`
  - Result: PASS
  - Browser: Chromium
  - Tests: `12 passed`
  - Production build: PASS before browser run
  - Largest JS chunk observed: `817.50 kB`

## Coverage Delta

- Global lines: `77.48% -> 77.50%`
- Global statements: `73.86% -> 73.89%`
- Global functions: `66.83% -> 66.91%`
- Global branches: `56.83% -> 56.93%`
- `AuditDecisionReplayPanel.vue` lines: `63.98% -> 64.68%`
- `AuditDecisionReplayPanel.vue` statements: `61.46% -> 62.38%`
- `AuditDecisionReplayPanel.vue` functions: `77.08% -> 79.16%`
- `AuditDecisionReplayPanel.vue` branches: `14.86% -> 16.91%`

## Release Gate Impact

- Improves audit replay evidence for quality gray rollback decisions.
- Does not close hosted CI, PostgreSQL/staging, attack-chain A/B/C, security signoff, first gray deployment, or observation-window gates.
