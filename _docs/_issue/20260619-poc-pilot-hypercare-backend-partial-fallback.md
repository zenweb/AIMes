# 2026-06-19 Issue - POC Pilot/Hypercare Backend Partial Fallback

## Symptom
Backend-first POC pilot and Hypercare readers could return incomplete latest backend records instead of complete local evidence.

## Root Cause
- Pilot run used `record ?? local` without validating backend record shape.
- Hypercare acceptance compared backend/local `createdAt` after only checking truthiness, so a newer partial backend payload could win.

## Impact
- POC pilot evidence could lose the real work order batch, checkpoints, acceptance criteria, OTD result, owners, audit ID, trace ID, and summary.
- Hypercare evidence could lose the formal acceptance gate, monitors, checkpoints, OEE/OTD metrics, incident count, owner chain, audit ID, trace ID, and summary.

## Resolution
- Backend latest pilot run must pass `isPocPilotRunRecord`.
- Backend latest Hypercare acceptance must pass `isPocHypercareAcceptanceRecord` before local/newer comparison.

## Status
Resolved for POC pilot run and Hypercare acceptance readers.
