# Employee live recovery base-path next actions - 2026-06-22

1. If the app is deployed under a non-default prefix, run a preview/e2e pass with that `BASE_URL`.
2. Keep future recovery/help links on Employee pages built from shared base-path helpers instead of literal `/scheduling` strings.
3. Re-run `scripts/run-employee-live-backend-evidence.ps1` after future Employee auth/offline-demo changes.
4. Re-run `EmployeeLiveBackendRecoveryLink_ShouldUseConfiguredAppBasePath` after future Employee recovery-link edits.
