# 2026-06-19 Risk SLA Guidance Links

## Changed
- Added bilingual guidance to the Risk SLA daily review workflow in `RiskActionQueuePanel`.
- Added contextual links to Scheduling, Reports, Audit trail, and Help.
- Associated the SLA review panel with the guidance through `aria-describedby="risk-sla-review-help"`.

## Evidence
- RED: `npm run test:unit -- risk-action-queue-panel.test.ts -t "shows bilingual SLA review guidance"` failed because `.risk-sla-guidance` did not exist.
- GREEN: same targeted test passed.
- Component suite: `npm run test:unit -- risk-action-queue-panel.test.ts` passed, 16/16.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1098 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `127.0.0.1:4173`, `/scheduling/risk`, screenshot `risk-sla-guidance-real-browser-20260619`.

## Notes
- This slice improves operator guidance before generating or closing cross-functional risk SLA review packages.
- Overall v1.0.0 completion remains unproven while gray observation is deferred/skipped.
