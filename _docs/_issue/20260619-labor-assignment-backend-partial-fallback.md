# 2026-06-19 Issue - Labor Assignment Backend Partial Fallback

## Symptom
Labor assignment backend-first readers returned non-empty backend arrays without runtime shape validation.

## Impact
- Personnel governance, production start, schedule review, admin evidence, and chat evidence flows could lose replacement owner, blocked certification, reviewer, audit id, trace id, and operation coverage details.

## Root Cause
The backend-first readers trusted typed API responses and did not reuse the complete-record guards already applied to local storage.

## Status
Resolved for labor reassignment and labor qualification block backend-first array paths.
