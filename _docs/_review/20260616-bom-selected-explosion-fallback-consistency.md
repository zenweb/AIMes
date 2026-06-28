# 2026-06-16 BOM Selected Explosion Fallback Consistency Review

## Decision

Accepted as a boutique hardening slice for the existing BOM engineering-data path.

## Root Cause

When `explodeBom` failed, `demoExplosion` returned a hard-coded A100 material tree. If the operator selected B200 and both detail/explosion APIs were unavailable, the details table correctly showed B200 fallback items while the explosion tree incorrectly showed A100 materials.

## Fix

- `demoExplosion` now derives fallback explosion items from the selected BOM's `items`.
- If a successful backend detail payload contains no items, the fallback still uses `demoItems(bom.id)` so existing A100 behavior remains intact.
- Child materials are converted recursively, preserving B200's `MAT-B01a` child evidence.

## Evidence

- The new test failed before the fix and passed after it.
- Existing A100 local explosion fallback test still passes.
- Full frontend coverage passed with `111 files / 1052 tests`.

## Risks

- The local fallback still uses demo engineering data when APIs fail; this is intentional fail-loud demo behavior, not release evidence.
- Strict final v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
- Worktree remains broadly dirty; future work must avoid reverting unrelated changes.
