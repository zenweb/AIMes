# 2026-06-19 Plan - Offline Demo Equipment Quiet Fallback

## Success Criteria
- `/scheduling/equipment?offlineDemo=1` does not show `Offline demo mode skipped backend request`.
- Offline-demo fallback equipment cards and statistics remain visible.
- Ordinary backend failures still show equipment list/statistics failure alerts.
- Unit tests, offline-demo regression package, build, and real browser DOM evidence all pass.

## Execution
1. Add failing tests for quiet offline-demo equipment list and statistics skips.
2. Add minimal `isOfflineDemoError` checks around the existing fallback-alert assignments.
3. Run focused GREEN tests and fail-loud protection tests.
4. Run EquipmentBoard full unit suite and the offline-demo regression package.
5. Build production frontend output.
6. Restart local preview on `127.0.0.1:4173`.
7. Verify the real browser DOM for Equipment offline demo.

## Stop Condition
- Stop this slice once EquipmentBoard passes all listed criteria and document the remaining redirect/query issue separately.
