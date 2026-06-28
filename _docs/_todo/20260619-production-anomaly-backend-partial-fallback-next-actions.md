# 2026-06-19 Todo: Production anomaly backend partial fallback next actions

## Current Status
- Frontend backend-first shape containment is complete and verified for production anomaly evidence.
- Strict v1.0.0 remains gated by first gray observation and the two-week no P0/P1 window.

## Next Actions
- Add live staging evidence that backend production anomaly records include operation, severity, detection, and suggested-action fields.
- Continue malformed-payload scrutiny only for backend-first readers that feed user-critical recovery, release, audit, or POC governance flows.
- Keep backend/staging work on port `5003`, not `5000`.
