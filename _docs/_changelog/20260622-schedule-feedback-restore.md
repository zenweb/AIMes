# 2026-06-22 Schedule Feedback Restore

- Added startup restoration for the latest schedule adoption feedback.
- Prefer backend latest adoption feedback when complete.
- Fall back to local feedback snapshot and fail loud when backend latest feedback is unavailable or missing required audit fields.
- Added focused unit coverage for local restore, backend preference, and incomplete backend fallback.

Verification:
- `npm run test:unit -- tests/unit/schedule-board.test.ts`: PASS, 1 file / 76 tests.
- `git diff --cached --check`: PASS.
