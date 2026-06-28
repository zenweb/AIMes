# 2026-06-19 Issue: Production anomaly backend partial fallback

## Problem
- Production anomaly backend-first reads trusted partial backend payloads.
- A payload with only anomaly id, work order, and title could replace a complete local production anomaly.

## Impact
- Anomaly and risk-action views could lose operation context, detection metadata, severity, and suggested action.
- Operators might route a production exception without enough evidence to decide recovery actions.

## Root Cause
- `isProductionAnomalyEvent` guarded local storage reads but was not applied to backend-first reads.

## Fix
- Applied the existing completeness guard to backend-first records before returning them.
- Incomplete backend results now fall back to complete local evidence.

## Evidence
- RED test reproduced direct partial backend return.
- GREEN and adjacent anomaly/risk/production checks passed after the fix.
