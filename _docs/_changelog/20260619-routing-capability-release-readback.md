# 2026-06-19 Changelog: Routing capability release readback

## Changed
- Added backend-authoritative readback after route capability validation and split/batch release writes.
- If readback fails after a successful local write, `RoutingBoard` now keeps the local evidence visible and shows a fail-loud alert with the backend reason.

## Evidence
- RED: `npm run test:unit -- tests/unit/routing-board.test.ts -t "fails loud but keeps local release evidence when release readback fails"` first failed because no release readback alert was rendered.
- GREEN: targeted test passed.
- Component suite: `npm run test:unit -- tests/unit/routing-board.test.ts` passed, 14 tests.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1105 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.

## Release Gate Note
- Strict v1.0.0 still depends on first gray observation and the two-week no P0/P1 window.
