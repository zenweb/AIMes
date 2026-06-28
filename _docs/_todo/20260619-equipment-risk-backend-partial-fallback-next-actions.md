# 2026-06-19 Todo: Equipment risk backend partial fallback next actions

## Current Status
- Frontend backend-first shape containment is complete and verified for equipment downtime and customer equipment-fault evidence.
- Strict v1.0.0 remains gated by first gray observation and the two-week no P0/P1 window.

## Next Actions
- Add live staging evidence that backend equipment risk endpoints emit complete records.
- Continue malformed-payload scrutiny only for backend-first readers that feed user-critical recovery, release, audit, or POC governance flows.
- Keep backend/staging work on port `5003`, not `5000`.
