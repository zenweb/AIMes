# 2026-06-20 Issue: Shortage Supply Backend Fail Loud

## Issue
Shortage and supply latest backend reads silently fell back to null/local evidence even when the caller needed fail-loud audit behavior.

## Impact
- Backend evidence failures could look like merely missing optional records.
- Startup or refresh paths could lose the distinction between "no latest evidence" and "backend unavailable".
- Purchase, BOM, supplier network, and schedule release decisions depend on these records for auditable context.

## Resolution
- Added fail-loud options to five shortage/supply latest API reads.
- Propagated fail-loud through five backend-first sync readers.
- Preserved existing completeness guards and non-fail-loud local fallback behavior.

## Evidence
- Targeted and adjacent unit tests passed on 2026-06-20.
