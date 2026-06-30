# 2026-06-30 Review: Scheduling E2E Offline Demo / Live Backend Closure

## Review Notes

- Change is test-scoped and does not alter production Scheduling components.
- The offline-demo routing rule now matches the intent of fail-loud backend tests: mocked backend failures must not be skipped by demo mode.
- The batch compare mock now reflects the stricter UI contract for recommendation score evidence.

## Validation

- Focused batch feedback retry: passed.
- Full Scheduling E2E: 36 passed.

## Open Items

- Full frontend E2E still needs a fresh complete run after Scheduling closure.
- Keep watching for other suites that set localStorage to disable demo mode while leaving `offlineDemo=1` in the URL.
