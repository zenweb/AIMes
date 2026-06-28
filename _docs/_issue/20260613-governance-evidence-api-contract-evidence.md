# 2026-06-13 Issue: Governance evidence API helper contract gap

## Status

Closed for this slice.

## Finding

`src/api/governanceEvidence.ts` feeds approval replay and fail-loud audit paths but lacked direct API contract coverage.

## Resolution

Added tests for endpoint construction, write payload passthrough, default fallback behavior, and fail-loud behavior.

## Remaining risk

This proves frontend request construction and fallback semantics. Backend persistence and human approval correctness require separate evidence.

