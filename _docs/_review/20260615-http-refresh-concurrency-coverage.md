# 2026-06-15 Review: HTTP Refresh Concurrency Coverage

## Result

PASS.

This slice strengthens evidence around the global frontend API client, which every backend-driven page depends on.

## Why This Slice

The latest coverage summary showed `src/api/http.ts` among the lowest covered user-critical shared files:

- previous summary: 78.12% lines, 50.98% branches.

Auth/login had already received focused unit and real-browser evidence, so continuing to polish login would have lower marginal value.

## Verified Contract

- Concurrent expired API calls share one refresh request.
- Each failed API call retries with the same refreshed access token.
- Blank refresh token clears auth state and does not retry.
- The refresh endpoint itself does not recursively trigger refresh.
- Non-auth backend failures surface ProblemDetails title through the toast channel.

## Evidence

- `npm run test:unit -- tests/unit/http-refresh.test.ts --reporter=dot`: 10 passed.
- `npm run test:unit:coverage -- tests/unit/http-refresh.test.ts --reporter=dot --coverage.reporter=json-summary`:
  - `src/api/http.ts`: 92.3% lines, 91.17% statements, 75.47% branches, 100% functions.
- `npm run test:unit -- tests/unit/http-refresh.test.ts tests/unit/auth.store.test.ts tests/unit/auth-token.test.ts tests/unit/router-auth.test.ts --reporter=dot`: 37 passed.

## Boundary

This is a frontend HTTP client evidence slice. It does not prove hosted CI, staging, gray observation, or full v1.0.0 release readiness.

