# 2026-06-14 Review - Chat Equipment Downtime Evidence Answer

## Review Result
- PASS for this slice.
- The new test exercises a user-facing assistant answer that depends on current OTD evidence rather than a generic demo response.

## Checked
- When RAG fails, the assistant still answers the CNC-001 4-hour downtime question using local business evidence.
- The answer includes the latest `TRACE-EQ-DOWNTIME-CNC-001` record, status `待维护`, source `设备维护 / 瓶颈保护`, and affected work orders.
- Older CNC-001 evidence is not surfaced.
- The no-evidence message is not shown when a matching evidence record exists.
- Existing real Chromium equipment-downtime question workflow remains green.

## Residual Risk
- This slice does not claim strict release readiness because the owner skipped/deferred the 15-day gray observation.
- `ChatPanel.vue` remains broad; additional slices should target distinct business branches rather than repeating equipment downtime.
