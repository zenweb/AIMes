# 2026-06-20 Plan - Production Anomaly Latest Toast Cleanup

## Goal

Remove user-visible request-error noise from risk and anomaly pages when no latest production anomaly event exists, without hiding explicit fail-loud audit reads.

## Steps

1. Reproduce current browser behavior on `/scheduling/risk` and `/scheduling/anomaly`.
2. Add a failing unit expectation that production anomaly latest reads use the optional latest suppression contract.
3. Apply the minimal API-client fix.
4. Update affected unit expectations for backend-first fallback reads.
5. Verify with unit tests, frontend build, and real browser preview.

## Done Criteria

- `/scheduling/risk` has no global `请求错误` toast for missing production anomaly latest.
- `/scheduling/anomaly` has no global `请求错误` toast for missing production anomaly latest.
- Optional fallback behavior still returns local complete anomaly evidence where available.
- `failLoud` behavior remains available for explicit callers.

