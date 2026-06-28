# 2026-06-20 Issue: OTD KPI Commitment Backend Fail Loud

## Issue
OTD KPI commitment list and latest backend reads silently fell back when backend requests failed, and the list reader did not explicitly reject non-array payloads in fail-loud mode.

## Impact
- Customer promise evidence could appear merely absent instead of surfacing backend evidence failure.
- A malformed list payload could fail with an implementation error like `records.filter is not a function`.
- Latest backend records needed a complete-package check before replacing local customer-facing OTD commitment evidence.

## Resolution
- Added fail-loud options to OTD KPI commitment API reads.
- Propagated fail-loud through backend-first sync reads.
- Added explicit non-array list payload handling.
- Required latest backend records to pass the complete commitment package guard.

## Evidence
- Targeted and adjacent unit tests passed on 2026-06-20.
