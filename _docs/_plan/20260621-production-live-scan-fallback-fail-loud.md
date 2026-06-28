# 2026-06-21 Plan - Production live scan fallback fail-loud

## Goal

Ensure ProductionBoard does not hide live backend scan failures behind local demo operation fallback, while preserving explicit offline demo behavior.

## Success Criteria

- Live `scanOperation` failure with a local work-order match shows a fail-loud error and does not render local demo operations.
- Manual work-order selection behaves the same for live backend failures.
- Offline demo skip remains allowed to use local demo operations.
- Unit tests cover failure, success, duplicate completion, quality-fail freeze, and scanned exception paths.
- Real browser evidence confirms WO-013 renders from backend-backed context without offline/fallback warnings.

## Execution

1. Add/keep failing unit coverage for live scan API failure masking.
2. Update ProductionBoard error handling to distinguish live failure from offline demo skip.
3. Replace implicit rejected-scan test defaults with explicit backend operation fixtures.
4. Run focused and adjacent tests.
5. Build frontend and gather real browser evidence.

## Status

Completed for this slice.
