# 2026-06-15 HTTP Refresh Concurrency Coverage Plan

## Objective

Improve evidence for a low-covered, user-critical shared path without broadening product scope.

## Selection Rationale

`ScheduleBoard` remains business-critical, but existing tests already cover many operator paths. The coverage report showed the global HTTP client as a higher-leverage shared risk, because every backend module depends on it.

## Execution

1. Inspect `coverage-summary.json`.
2. Compare low-coverage candidates against user-criticality.
3. Read `src/api/http.ts` and existing `http-refresh.test.ts`.
4. Add focused tests for refresh concurrency and auth cleanup boundaries.
5. Run focused tests, focused coverage, and auth/router regression.
6. Record evidence in five documentation streams.

## Result

No implementation change was needed. The added tests proved the existing refresh concurrency and fail-loud behavior.

