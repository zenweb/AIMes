# 2026-06-20 Issue - BOM detail engineering evidence fail-loud

## Issue
BOM detail selection refreshed engineering evidence without explicitly requiring fail-loud backend readback.

## Impact
- A user actively reviewing BOM evidence could see fallback detail while backend readback failures were not guaranteed to be distinguished from missing evidence.
- This weakened audit clarity for engineering data used by scheduling and kitting.

## Resolution
- BOM detail refresh now calls engineering evidence readers with `{ failLoud: true }`.
- Existing alert behavior reports readback failure while preserving the selected BOM detail.

## Verification
- Focused BOM red/green test passed.
- Adjacent engineering evidence and scheduling tests passed.
- Production build passed.
