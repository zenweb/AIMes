# Employee live recovery base-path review - 2026-06-22

## Findings

- No blocking findings.
- The Employee recovery link is now base-path-safe and remains compatible with the default `/scheduling/` base.
- The test demonstrates why this matters: alternate deployment prefixes must keep the recovery link inside the app.

## Validation

- RED observed before implementation: hardcoded `/scheduling` failed the custom base-path test.
- `employee-board.test.ts`: PASS, 21/21.
- `offline-demo-mode.test.ts`: PASS, 16/16.
- `scripts/run-employee-live-backend-evidence.ps1`: PASS after the base-path change, proving the default `/scheduling/` real-browser recovery path still works.
- `EmployeeLiveBackendRecoveryLink_ShouldUseConfiguredAppBasePath`: PASS, 1/1. This guard prevents the Employee recovery link from reverting to a hardcoded `/scheduling` href.

## Residual Risk

- Custom non-default deployment prefixes are covered by unit evidence; the real-browser script still covers the default `/scheduling/` deployment path.
