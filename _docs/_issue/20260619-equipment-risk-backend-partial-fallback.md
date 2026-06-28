# 2026-06-19 Issue: Equipment risk backend partial fallback

## Problem
- Equipment risk backend-first readers trusted partial backend payloads.
- A payload with only `equipmentCode` and `downtimeHours`, or a customer fault record without telemetry lineage, could replace a complete local record.

## Impact
- Scheduling and equipment views could show equipment risk without affected orders, mitigation strategy, maintenance window, or POC telemetry lineage.
- This weakens auditability and operator decision safety for production recovery.

## Root Cause
- Shape guards existed for local storage cleanup but were not applied to backend-first reads.

## Fix
- Applied the existing completeness guards to backend-first results before returning them.
- Incomplete backend results now fall back to local complete evidence.

## Evidence
- RED tests reproduced direct partial backend return.
- GREEN and adjacent equipment/scheduling tests passed after the fix.
