# 2026-06-19 Changelog: Document upload quality publish readback

## Changed
- Added backend-authoritative readback after quality knowledge retraining formal publish.
- If readback fails after a successful local publish, `DocumentUpload` now keeps the local publish history and shows a fail-loud alert with the readback reason.

## Evidence
- RED: `npm run test:unit -- tests/unit/document-upload.test.ts -t "fails loud but keeps local publish history when quality publish readback fails"` failed because the backend retraining-version reader was only called during initial load.
- GREEN: targeted test passed.
- Component suite: `npm run test:unit -- tests/unit/document-upload.test.ts` passed, 36 tests.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1107 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.

## Release Gate Note
- Strict v1.0.0 still depends on first gray observation and the two-week no P0/P1 window.
