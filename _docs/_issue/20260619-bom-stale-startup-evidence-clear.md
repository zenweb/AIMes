# Issue: BOM startup engineering evidence alert could remain after recovery

Date: 2026-06-19

## Status

Resolved in this slice.

## Problem

If `BomBoard` failed to load startup engineering evidence, the assertive alert remained visible even after the operator selected a BOM and the selection-time evidence refresh succeeded.

## Impact

The BOM workflow had recovered, but the UI could still show an obsolete failure. For engineering release and material substitution decisions, stale failure states can make operators distrust current evidence.

## Resolution

- Added a failing regression that reproduces startup engineering evidence failure followed by successful selection refresh.
- Added a scoped startup error clear helper.
- Cleared the stale startup engineering evidence alert only when selection refresh succeeds.
- Verified targeted, component, full frontend coverage, and lint.
