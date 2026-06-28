# Employee preview stale output recurrence review

## Review Result

No new EmployeeBoard code change was made in this pass.

## Evidence Reviewed

- `EmployeeBoard` already clears notifications for `isOfflineDemoError(error)`.
- `offline-demo-mode.ts` recognizes direct, wrapped, and nested offline-demo skip errors.
- Focused unit tests passed: 35/35.
- Focused Employee E2E passed: 2/2.
- Real browser on `4173` after rebuild/restart showed 8 cards and 0 alerts.

## Residual Risk

The remaining risk is operational: a long-running preview process can serve stale build output. Future recurrence should be handled by rebuilding/restarting preview first, then only reopening code if current-bundle tests fail.
