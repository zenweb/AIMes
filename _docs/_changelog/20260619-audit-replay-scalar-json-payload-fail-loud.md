# 2026-06-19 Audit Replay Scalar JSON Payload Fail-Loud

## Summary
- Hardened `AuditDecisionReplayPanel` audit payload parsing so valid JSON scalar payloads are no longer silently dropped.
- Added fail-loud alerts for both backend business-write audits and schedule adoption feedback audits when `newValues` parses successfully but is not a JSON object.
- Added regression tests for the two user-critical audit replay paths.

## Evidence
- RED: `npm run test:unit -- audit-decision-replay-panel.test.ts -t "schedule adoption feedback payload is valid JSON but not an object"` failed because `.replay-sync-alert` was missing.
- RED: temporarily restored old business-write parser behavior; `npm run test:unit -- audit-decision-replay-panel.test.ts -t "business-write replay entries and alerts when one audit detail payload is valid JSON but not an object"` failed because `.replay-sync-alert` was missing.
- GREEN: `npm run test:unit -- audit-decision-replay-panel.test.ts -t "valid JSON but not an object"` passed, 2 tests.
- Suite: `npm run test:unit -- audit-decision-replay-panel.test.ts` passed, 58 tests.
- Coverage: `npm run test:unit:coverage` passed, 111 files / 1088 tests. Total coverage: statements 89.74%, branches 77.19%, functions 89.96%, lines 92.84%.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `http://127.0.0.1:4173/audit-logs/` rendered the audit log page, guidance/help links, replay cards, and fail-loud alert region. Screenshot captured as `audit-replay-scalar-payload-real-browser-20260619`.

## Files
- `src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue`
- `src/frontend/tests/unit/audit-decision-replay-panel.test.ts`
