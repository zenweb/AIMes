# 2026-06-20 Issue - Release Gate 007f745 Refresh

## Symptom
- Previous release gate evidence referenced an older V1 head after the live preview employee login fix was pushed.

## Impact
- Without refreshed evidence, audit readers could not prove the latest pushed code had hosted CI coverage.

## Fix
- Created current hosted CI evidence for run `27848203224` on head `007f7458b96c391bb2e0227f3e9753e0901fd3b2`.
- Re-ran release gate audit against the new hosted CI report.
