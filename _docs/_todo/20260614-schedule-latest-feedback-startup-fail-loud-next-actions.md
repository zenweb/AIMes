# Next Actions - Schedule latest feedback startup fail loud

## Done
- Added API unit coverage proving latest adoption feedback backend failures are visible to callers.
- Added `ScheduleBoard` unit coverage proving startup continues to load the current plan after latest feedback restore failure.
- Added Chromium coverage proving the real browser shows the fail-loud note while schedule metrics still render.
- Changed default staging/API host URLs from `localhost:5000` to `localhost:5002`.
- Ran the full `ScheduleBoard` unit suite: 41 passed.
- Ran full unit coverage: 106 files / 781 tests passed; global line coverage 84.01%.

## Next
- Free host port `5002` before the next Docker-backed staging rehearsal, or explicitly pass another `-ApiBaseUrl`.
- Continue deepening existing user-critical schedule paths before widening scope.
- Use the latest coverage report for the next slice; `src/api/scheduling.ts` remains artificially low in per-file coverage because the broad API file is only partially imported by focused API contract tests.

## Deferred
- Historical reports that already captured `localhost:5000` were not rewritten.
- Owner-deferred gray observation remains out of the current execution path.
- Investigate coverage `--localstorage-file` warning as a separate cleanup.
