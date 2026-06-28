# 2026-06-19 Alternate Material Backend Partial Fallback Issue

## Status

Closed for this slice.

## Problem

`readAlternateMaterialApprovalBackendFirst()` accepted any non-null backend alternate-material approval response. A backend payload containing only `alternateMaterialCode` and `traceId` could replace a complete local approval record and hide BOM identity, source material, affected orders, approver, approval timestamp, audit id, and summary.

## Resolution

Backend alternate-material approval evidence is now used only when it passes the complete `isAlternateMaterialApproval` guard. Otherwise the reader falls back to local evidence.

## Verification

- RED targeted test failed before the fix for the expected reason.
- GREEN targeted test passed: `9 passed`.
- Full frontend coverage passed: `111 files / 1066 tests passed`.
- Lint passed.

## Still Open Outside This Issue

- Strict v1.0.0 release readiness is still not complete because gray observation remains deferred.
