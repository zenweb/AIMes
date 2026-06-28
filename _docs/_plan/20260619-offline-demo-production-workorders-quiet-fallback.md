# 2026-06-19 Plan - Offline Demo Production Workorders Quiet Fallback

## Success Criteria
- `/scheduling/production?offlineDemo=1` does not show `Offline demo mode skipped backend request`.
- Offline-demo fallback production work orders remain visible.
- Ordinary backend failures still show the production work-order fallback alert.
- Unit tests, offline-demo regression package, build, and real browser DOM evidence all pass.

## Execution
1. Run a real-browser offline-demo sweep to find remaining visible backend-skip leaks.
2. Add a failing test for quiet offline-demo initial production work-order loading skip.
3. Add a minimal `isOfflineDemoError` check around the existing production fallback-alert assignment.
4. Run the focused GREEN test and the fail-loud protection test.
5. Run ProductionBoard full unit suite and the offline-demo regression package.
6. Build production frontend output.
7. Restart local preview on `127.0.0.1:4173`.
8. Verify the real browser DOM for Production offline demo.

## Stop Condition
- Stop this slice once ProductionBoard passes all listed criteria and queue a corrected full-route offline-demo sweep.

