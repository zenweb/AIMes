# Employee live backend evidence script review - 2026-06-22

## Findings

- No blocking findings.
- The e2e regression is opt-in through `AIMES_E2E_LIVE_BACKEND=true`, so ordinary offline-demo e2e runs do not require a live backend.
- The PowerShell script uses an ASCII Playwright grep marker (`employee-live-backend`) to avoid Windows PowerShell argument encoding issues.

## Validation

- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-employee-live-backend-evidence.ps1`: PASS.
- 2026-06-22 13:20 +08 rerun after Employee recovery base-path hardening: PASS.
- Script output report: `_docs/_reports/employee-live-backend-evidence-20260622-current.md`.

## Residual Risk

- This is a focused smoke check for employee live recovery, not a full frontend e2e sweep.
- It requires the backend to be available on `http://127.0.0.1:5003`.
