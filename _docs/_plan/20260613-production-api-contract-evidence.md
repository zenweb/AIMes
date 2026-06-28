# 2026-06-13 Plan: Production API contract evidence

## Success criteria

- Refresh full frontend coverage before selecting the next slice.
- Move off the already-hardened notification channel.
- Strengthen a low-coverage, user-critical existing path without expanding scope.

## Result

- Selected the production API helper because production reporting is user-critical and `src/api/production.ts` had weak coverage in the full report.
- Added normal backend contract evidence for all exported production API commands.
- Verified the production API test and production board regression.

