# 2026-06-15 Issue: procurement recovery needed fresh real browser evidence

## Problem
- Recent PurchaseBoard unit evidence proved the material correction logic, but the current audit still needed fresh real-browser proof for the visible cross-module path.

## Impact
- Without browser evidence, the procurement recovery flow could be unit-green while navigation, production build rendering, or cross-module visible evidence regressed.

## Resolution
- Ran focused Chromium E2E for supplier SLA selection.
- Ran focused Chromium E2E for material anomaly dispatch through purchase correction, report evidence, and audit replay.

## Open
- Docker-backed smoke could not be run in this shell because Docker API connection failed.
