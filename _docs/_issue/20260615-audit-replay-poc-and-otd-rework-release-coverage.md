# 2026-06-15 Audit Replay POC and OTD Rework Release Coverage Issue

## Issue

The replay panel still had a few meaningful user-critical release branches left uncovered, especially around POC evidence, OTD rework release, and barcode label / schedule transitions.

## Resolution

- Added direct regression tests for the uncovered replay branches.
- Confirmed the panel still fails loud on malformed or unavailable evidence.
- Left only low-value outer catch paths uncovered after verification.

## Result

The current slice is verified and resumable without losing the audit trail.
