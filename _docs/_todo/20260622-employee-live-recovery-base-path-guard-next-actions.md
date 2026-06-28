# Employee live recovery base-path guard next actions - 2026-06-22

1. Keep `EmployeeLiveBackendRecoveryLink_ShouldUseConfiguredAppBasePath` paired with future Employee recovery-link changes.
2. If more modules add recovery links, consider extracting a shared unit fixture for base-path-safe recovery URLs.
3. Do not use this static guard as hosted CI/staging proof; it only prevents this specific hardcoded-link regression.
