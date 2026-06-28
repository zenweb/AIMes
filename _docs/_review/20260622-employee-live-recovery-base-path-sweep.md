# Employee live recovery base-path sweep review - 2026-06-22

## Findings

- No blocking findings.
- Runtime frontend scan found no remaining hardcoded `/scheduling` recovery href.
- The only runtime Employee recovery path now uses `liveBackendRecoveryHref` from `appAssetPath(...)`.

## Validation

- Runtime grep sweep: PASS.
- Existing guard `EmployeeLiveBackendRecoveryLink_ShouldUseConfiguredAppBasePath`: PASS from the previous focused run.

## Residual Risk

- This sweep only covers `src/frontend/src` and `src/frontend/middleware`; docs and tests intentionally still contain literal paths as evidence tokens.
