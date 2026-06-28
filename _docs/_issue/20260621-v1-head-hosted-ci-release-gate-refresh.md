# 2026-06-21 Issue - V1 Head Hosted CI Release Gate Refresh

## Problem

The release-gate evidence path still cited an older hosted CI packet for GitHub `V1` head `374d5b6c12814416282962919922524c9ab9c31a`, while the current committed `V1` head is `47d65547557a8a6cf035327ae94455a1a1285daf`.

## Impact

Using the older packet could make the release-gate audit appear less current than the actual committed-head evidence.

## Resolution

- Generated hosted CI evidence for the latest committed `V1` head.
- Reran release-gate audit with that packet.
- Updated matrix/plan anchors and architecture guard tokens.

## Status

Closed for this slice.

## Boundary

The dirty worktree remains unproven by hosted CI.
