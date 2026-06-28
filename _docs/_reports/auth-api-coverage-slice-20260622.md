# Auth API coverage slice - 2026-06-22

## Scope

Focused frontend quality slice for `src/frontend/src/api/auth.ts`, selected because current-worktree coverage showed this user-critical API adapter at 0% line coverage.

## Change

Added `src/frontend/tests/unit/auth-api.test.ts` to lock the backend contract for:

- login request/response mapping;
- password-change endpoint mapping;
- refresh token rotation request/response mapping.

## Verification

Focused unit:

```text
npm run test:unit -- tests/unit/auth-api.test.ts
Test Files  1 passed (1)
Tests       3 passed (3)
```

Focused coverage:

```text
npm run test:unit:coverage -- tests/unit/auth-api.test.ts
Statements   : 100% (5/5)
Branches     : 100% (0/0)
Functions    : 100% (3/3)
Lines        : 100% (5/5)
```

Full frontend unit recheck:

```text
npm run test:unit
Test Files  118 passed (118)
Tests       1232 passed (1232)
```

## Boundary

- Covers the frontend auth API adapter.
- Does not change auth runtime behavior.
- Does not prove login UI, backend auth endpoints, or E2E login flow.
- Does not change the frozen staged package unless explicitly staged later.
