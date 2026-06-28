# 2026-06-22 Employee live recovery base path

- Made the Employee offline-demo `切换在线后端` link derive from the configured app base path.
- Added a unit regression for a non-default `/factory/scheduling/` deployment prefix.
- Verified `employee-board.test.ts` and `offline-demo-mode.test.ts` pass.
- Reran `scripts/run-employee-live-backend-evidence.ps1`; the default `/scheduling/` real-browser recovery path remains PASS.
- Added `EmployeeLiveBackendRecoveryLink_ShouldUseConfiguredAppBasePath` to prevent regression back to a hardcoded `/scheduling` recovery href.
