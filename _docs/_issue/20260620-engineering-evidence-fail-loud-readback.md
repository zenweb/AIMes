# 2026-06-20 Issue - Engineering evidence fail-loud readback

## Issue
Alternate material and engineering change impact latest reads could not fail loud when backend readback failed.

## Impact
- Audit-grade workflows could confuse "no backend record" with "backend read failed".
- Local fallback remained available, but the caller had no way to demand hard backend evidence.

## Resolution
- Added shared `failLoud` read options in `engineeringEvidence.ts`.
- Propagated the option through backend-first sync functions.
- Preserved quiet fallback as the default behavior.

## Verification
- API contract tests passed.
- Engineering sync tests passed.
- BOM, schedule, and engineering constraint adjacent tests passed.
- Production build passed.
