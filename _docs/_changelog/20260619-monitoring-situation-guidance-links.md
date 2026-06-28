# 2026-06-19 Changelog: Monitoring Situation Guidance Links

## Changed
- Added bilingual operation guidance to the shopfloor situation sync/escalation workflow.
- Added contextual links from situation escalation to scheduling, risk queue, and in-place help.
- Added `aria-describedby="shopfloor-situation-help"` to the situation action group.

## Verification
- RED: `npm run test:unit -- tests/unit/monitoring-board.test.ts -t "guides shopfloor situation escalation"` failed on missing `.situation-guidance`.
- GREEN: same targeted test passed.
- Component suite: `npm run test:unit -- tests/unit/monitoring-board.test.ts` passed 14/14.
- Full frontend coverage: `npm run test:unit:coverage` passed 111 files / 1100 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `127.0.0.1:4173`, screenshot `monitoring-shopfloor-situation-guidance-real-browser-20260619`.

