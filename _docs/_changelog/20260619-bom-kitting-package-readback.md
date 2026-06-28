# 2026-06-19 Changelog: BOM kitting package readback

## Changed
- Added backend-authoritative readback after publishing the BOM kitting package.
- If package readback fails after local publish and OTD evidence sync, `BomBoard` now keeps the local package locked and shows a fail-loud alert with the readback reason.

## Evidence
- RED: `npm run test:unit -- tests/unit/bom-board.test.ts -t "fails loud but keeps the BOM kitting package locked when package readback fails after publishing"` failed because `readBomKittingPackageBackendFirst` was only called during startup/selection, not after publish.
- GREEN: targeted test passed.
- Component suite: `npm run test:unit -- tests/unit/bom-board.test.ts` passed, 24 tests.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1106 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.

## Release Gate Note
- Strict v1.0.0 still depends on first gray observation and the two-week no P0/P1 window.
