# 2026-06-13 Plan: Router auth entry coverage

## Success criteria

- Use the refreshed frontend coverage report instead of intuition to select the next slice.
- Improve evidence for a low-coverage, user-critical existing path.
- Do not wait for gray observation and do not fake gray completion.

## Result

- Selected `src/router/index.ts` because it had low coverage and guards every user entry path.
- Added two focused router auth tests.
- Verified the focused test file and focused coverage run.

