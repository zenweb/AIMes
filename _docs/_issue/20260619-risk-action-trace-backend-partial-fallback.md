# 2026-06-19 Issue: Risk action trace backend partial fallback

## Problem
- Risk action trace reads accepted partial records.
- A record with only id, title, and trace could enter report center as responsibility-action evidence.

## Impact
- Report and OTD review evidence could lose owner, affected work orders, delivery impact, suggestion, status, and timestamp.
- That weakens accountability for risk closure and production recovery.

## Root Cause
- Local reads used a weak three-field filter.
- Backend-first reads trusted any non-empty backend list.

## Fix
- Added a full `RiskActionTrace` shape guard.
- Incomplete local records are removed.
- Incomplete backend records are ignored; if none are complete, local complete evidence is used.

## Evidence
- RED tests reproduced acceptance of partial local and backend records.
- GREEN and adjacent risk/report checks passed after the fix.
