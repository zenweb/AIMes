# 2026-06-20 Issue: Quality Rework Backend Fail Loud

## Issue
Quality rework latest backend reads silently fell back to null/local evidence even when the caller needed fail-loud audit behavior.

## Impact
- Backend evidence failures could look like merely missing optional records.
- Quality rework, report OTD review, and schedule rework-window paths could lose the distinction between "no latest evidence" and "backend unavailable".

## Resolution
- Added fail-loud options to the quality rework latest API read.
- Propagated fail-loud through the backend-first sync reader.
- Preserved existing incomplete-backend fallback and newest-record selection behavior.

## Evidence
- Targeted and adjacent unit tests passed on 2026-06-20.
