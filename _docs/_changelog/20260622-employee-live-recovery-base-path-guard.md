# 2026-06-22 Employee live recovery base-path guard

- Added `EmployeeLiveBackendRecoveryLink_ShouldUseConfiguredAppBasePath`.
- The guard checks `EmployeeBoard.vue` uses `appAssetPath` and that `employee-board.test.ts` covers `/factory/scheduling/`.
- Verified the focused architecture guard and Employee unit suite pass.
