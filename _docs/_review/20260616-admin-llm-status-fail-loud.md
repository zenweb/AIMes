# 2026-06-16 Admin LLM Status Fail Loud Review

## Finding

Admin LLM status loading swallowed API errors and only rendered the generic disconnected state.

## Impact

An administrator opening `LLM 设置` could not distinguish a real model connectivity failure from an unreachable status/config endpoint. That weakens operability for an existing admin-critical feature.

## Fix

- `loadLlmStatus` now catches the concrete error and writes a visible `role="alert"` notification.
- The fallback state remains explicit and conservative: LLM provider/model are unknown and connectivity is not confirmed.

## Verification

- Red/green test cycle completed.
- Admin targeted suite passed: `27 passed`.
- Full frontend suite passed: `111 files / 1056 tests passed`.

## Remaining Risk

- `AdminBoard.vue` branch coverage is improved but still below total project branch coverage at `57.88%`.
- Strict v1.0.0 release readiness is still not claimed because gray observation remains owner-deferred.
