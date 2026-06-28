# 2026-06-19 Audit Replay Guidance Links

## Changed
- Added bilingual audit replay guidance to `AuditDecisionReplayPanel`.
- Added contextual links to Production, Reports, Config Approvals, and Help.
- Associated the selected replay detail region with the guidance through `aria-describedby="audit-replay-help"`.
- Added `#audit-config-approvals` anchor to the configuration approval lane.

## Evidence
- RED: `npm run test:unit -- audit-decision-replay-panel.test.ts -t "shows bilingual audit replay guidance"` failed because `.audit-replay-guidance` did not exist.
- GREEN: same targeted test passed.
- Component suite: `npm run test:unit -- audit-decision-replay-panel.test.ts` passed, 59/59.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1097 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `127.0.0.1:4173`, `/scheduling/audit-logs`, screenshot `audit-replay-guidance-real-browser-20260619`.

## Notes
- This slice strengthens the release evidence UI without changing replay mapping logic.
- Overall v1.0.0 completion remains unproven while gray observation is deferred/skipped.
