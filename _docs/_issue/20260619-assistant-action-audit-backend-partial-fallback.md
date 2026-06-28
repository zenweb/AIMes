# 2026-06-19 Issue - Assistant Action Audit Backend Partial Fallback

## Symptom
Assistant action audit backend-first reads could merge incomplete backend records into admin and audit replay evidence.

## Root Cause
The reader checked only that the backend payload was an array, then merged all array items without applying `isAssistantActionAuditRecord`.

## Impact
- Audit replay could show an assistant action without label, type, actor, role, result message, permission result, created time, or trace context.
- Admin governance evidence could look present while missing the fields needed to explain what the assistant did and whether it was permitted.

## Resolution
Backend assistant action audits are filtered through `isAssistantActionAuditRecord` before merging with local audit records.

## Status
Resolved for assistant action audit backend-first reads.
