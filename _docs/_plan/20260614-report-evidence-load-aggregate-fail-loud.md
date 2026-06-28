# 2026-06-14 Plan - Report Evidence Load Aggregate Fail Loud

## Success Criteria
- Multiple optional ReportBoard evidence load failures are all visible to the user.
- The failures are shown as one clear fail-loud alert rather than competing alerts.
- Report dashboard entry and local demo review context remain available.
- Existing interactive report error behavior is unchanged.
- Unit, real Chromium e2e, and coverage regressions pass.

## Execution
1. Reproduce the overwrite behavior with a focused unit test.
2. Reproduce the missing aggregated alert in Chromium with a focused e2e test.
3. Collect optional evidence load failures during startup.
4. Flush collected failures once after optional reads complete.
5. Run focused and full ReportBoard/report test suites.
6. Document verification and residual boundaries.

## Outcome
- Criteria met.
- Gray observation remains skipped/deferred by owner instruction and does not block this slice.
