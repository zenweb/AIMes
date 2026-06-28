# 2026-06-20 Issue: Production Anomaly Backend Fail Loud

## Issue
Production anomaly latest backend reads silently fell back to null/local evidence even when the caller needed fail-loud audit behavior.

## Impact
- Backend evidence failures could look like merely missing optional records.
- Production, anomaly center, schedule, and risk paths could lose the distinction between "no latest evidence" and "backend unavailable".

## Resolution
- Added fail-loud options to the production anomaly latest API read.
- Propagated fail-loud through the backend-first sync reader.
- Preserved existing incomplete-backend fallback behavior.

## Evidence
- Targeted and adjacent unit tests passed on 2026-06-20.
