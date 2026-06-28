# 2026-06-15 HTTP Refresh Concurrency Coverage Issue

## Issue

The global frontend HTTP client had relatively weak branch coverage despite owning auth refresh, retry, redirect cleanup, HTML fallback detection, and toast error routing.

## Risk

Without focused coverage, a regression could:

- trigger multiple refresh requests for concurrent expired API calls;
- retry requests without the refreshed token;
- recursively refresh `/auth/refresh`;
- keep stale auth state after blank refresh-token evidence;
- hide backend ProblemDetails messages behind generic errors.

## Resolution

Added focused tests to `src/frontend/tests/unit/http-refresh.test.ts`.

## Evidence

- `http-refresh.test.ts`: 10 passed.
- Focused `src/api/http.ts` coverage: 92.3% lines, 75.47% branches.
- Auth/http/router focused regression: 37 passed.

