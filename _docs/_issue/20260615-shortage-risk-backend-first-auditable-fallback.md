# 2026-06-15 Shortage Risk Backend-First Auditable Fallback Issue

## Issue

The backend-first readers for shortage evidence returned backend payloads whenever the API call succeeded, even if the payload was incomplete and not auditable.

## Risk

That allowed stale or partial backend records to replace local browser evidence in shortage, supply-risk, and supplier-network panels.

## Resolution

- Added a regression test that proved the old behavior was wrong.
- Changed each backend-first reader to validate the backend payload shape before returning it.
- Confirmed the full frontend unit suite still passes.

## Boundary

This closes the specific auditable-fallback issue. It does not expand the shortage feature set.
