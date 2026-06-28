# 2026-06-12 Schedule Drag Refresh Readback Review

## Scope
- Reviewed the real dhtmlx drag-save E2E path for evidence completeness.
- Product code was not changed in this slice.

## Findings
- No blocking issue found in this slice after verification.
- The previous real dhtmlx failure-path test was flaky because a real mouse gesture could be interpreted as task selection instead of a persisted drag. The helper now treats the reschedule request as the completion signal and retries once before failing loud.

## Verified
- The new readback test proves that the UI does not rely only on local in-memory task mutation after save.
- The full real dhtmlx subset passed once without retry after the helper hardening.

## Residual Risk
- This is still a mocked browser backend read model, not the Docker/PostgreSQL staging probe. PostgreSQL persistence was covered by the separate staging rehearsal slice.
