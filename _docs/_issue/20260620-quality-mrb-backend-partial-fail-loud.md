# 2026-06-20 Issue: Quality MRB Backend Partial Fail Loud

## Issue
Quality MRB latest backend reads silently fell back to null/local evidence when backend requests failed, and partial backend records could replace complete local MRB disposition evidence.

## Impact
- Backend evidence failures could look like merely missing optional records.
- A partial MRB record with only identifiers could hide full disposition, schedule impact, closure, and action evidence.
- Quality board, report OTD review, and MRB panel paths depend on this evidence for auditable context.

## Resolution
- Added fail-loud options to the quality MRB latest API read.
- Propagated fail-loud through the backend-first sync reader.
- Reused the complete MRB disposition guard before trusting backend latest records.

## Evidence
- Targeted and adjacent unit tests passed on 2026-06-20.
