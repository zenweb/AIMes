# 2026-06-16 BOM Selected Explosion Fallback Consistency Issue

## Status

Closed for this slice.

## Problem

The local explosion fallback always returned the A100 demo tree. Under B200 selection, detail fallback and explosion fallback could disagree, which would mislead engineering-data and scheduling review.

## Impact

Operators reviewing B200 could see B200 detail rows but A100 exploded materials after an API failure, weakening the fail-loud fallback path and the trustworthiness of local engineering evidence.

## Resolution

`demoExplosion` now uses the selected BOM's items and recursively converts them to explosion items. Empty detail payloads still fall back by BOM id.

## Verification

- Red test reproduced the A100-under-B200 mismatch.
- Green test confirms B200 explosion fallback shows `MAT-B01`, `MAT-B01a`, and `MAT-B02`.
- Targeted BomBoard suite: `21 passed`.
- Full frontend suite: `111 files / 1052 tests passed`.

## Remaining Gaps

- Future BOM fallback work should focus on concrete engineering-data behavior gaps, not residual coverage line chasing.
