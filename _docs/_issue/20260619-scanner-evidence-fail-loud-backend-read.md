# 2026-06-19 Issue: Scanner evidence fail-loud backend read

## Problem
- Scanner evidence refresh failures could be swallowed by the API helper before `ScannerBoard` saw them.

## Impact
- The scanner UI could miss backend outage evidence and silently fall back to local records.
- This weakens operator trust because startup and post-write refresh alerts would not reliably represent the real backend state.

## Root Cause
- `queryBarcodeScanEvidence` treated all barcode scan evidence reads as optional and returned `[]` on failure.
- `ScannerBoard` needed a stricter read mode, but the sync utility did not expose one.

## Fix
- Added a fail-loud read option and used it from `ScannerBoard`.
- Preserved default fallback behavior for optional consumers.

## Evidence
- RED test reproduced the swallowed backend failure.
- Full frontend regression passed after the fix.
