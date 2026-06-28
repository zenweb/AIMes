# 2026-06-21 Issue - Production live scan fallback fail-loud

## Issue

ProductionBoard could mask live backend scan failures by falling back to local demo operations when a work order existed locally.

## Impact

- A broken `/api/v1/production/scan` path could still render plausible local operations such as WO-013 heat-treatment or WO-RUSH barcode operations.
- Real browser evidence could appear green while not proving backend-backed execution.
- This violated fail-loud expectations for the Employee -> Production -> Scheduling boutique-quality path.

## Resolution

- Non-offline scan failures now stop the fallback path and show explicit error notifications.
- Offline demo skip remains the only accepted reason for local operation fallback.
- Unit tests now assert the live failure is not masked.

## Follow-up

If downstream handoff evidence is required after quality-pass completion, extend the backend scan/route API to return the next operation instead of relying on frontend demo maps.
