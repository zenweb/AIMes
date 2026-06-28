# Plan - Admin startup config fallback fail loud

## Success Criteria
- Governance startup failures remain visible with config fallback failures.
- System config fallback still renders local demo rows.
- Notification config fallback still renders local demo rows.
- Real Chromium evidence proves the Admin startup path fails loud in the browser.

## Execution
- RED: add AdminBoard unit test for governance, system config, and notification config startup failures.
- GREEN: aggregate startup failures and prioritize config fallback failures in the alert summary.
- Browser: add Chromium test for the same Admin startup path.
- Verify: run Admin unit suite, Admin Chromium suite, and full unit coverage.

## Result
- Completed.
- Global unit coverage: 84.24% lines.
- `AdminBoard.vue`: 80.10% lines.
