# 2026-06-19 Issue: Audit Replay Scalar JSON Payload Was Silently Dropped

## Status
Closed for frontend audit replay parsing.

## Problem
When audit-log `newValues` contained syntactically valid JSON that was not an object, the replay parser returned `null` without calling the fail-loud error sink. The damaged audit detail was excluded from replay, but the UI gave operators no reason.

## Impact
- Backend business-write audit replay could hide malformed records while still showing valid sibling records.
- Schedule adoption feedback replay could hide malformed records and leave the operator with only base replay cards.
- This violated the audit console's fail-loud expectation.

## Fix
Both audit replay payload parsers now emit `${record.id} 审计载荷不是对象` when parsed JSON is a scalar or `null`.

## Evidence
- Two RED tests reproduced the missing `.replay-sync-alert` under old behavior.
- Two GREEN tests now assert the visible alert text and preserved valid replay/base cards.
- Full regression and browser evidence passed on 2026-06-19.
