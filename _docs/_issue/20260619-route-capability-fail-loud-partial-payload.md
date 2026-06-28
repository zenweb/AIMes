# 2026-06-19 Route Capability Fail Loud Partial Payload Issue

## Status

Closed for this slice.

## Problem

`readRouteCapabilityValidationBackendFirst({ failLoud: true })` propagated backend transport failures but still accepted a non-empty malformed backend payload by falling back to local route capability evidence. That hid backend evidence corruption from flows that explicitly required trustworthy route capability release evidence.

## Resolution

When `failLoud` is set, a non-empty backend payload that does not pass `isRouteCapabilityValidation` now throws `后端返回非完整工艺能力放行证据`.

## Verification

- RED targeted test failed before the fix for the expected reason.
- GREEN targeted test passed: `10 passed`.
- Full frontend coverage passed: `111 files / 1067 tests passed`.
- Lint passed.

## Still Open Outside This Issue

- Strict v1.0.0 release readiness is still not complete because gray observation remains deferred.
