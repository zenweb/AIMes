# 2026-06-14 Router Auth Guard Matrix Evidence

## Change
- Added focused router guard tests for existing authentication and authorization behavior.
- Covered:
  - forced password-change users staying on `/change-password`;
  - forced password-change users being redirected away from `/login`;
  - root entry redirecting to `/dashboard` for authenticated users;
  - Engineer access to engineering routes while blocking admin-only routes;
  - Operator access to production execution while blocking engineering setup routes;
  - missing cached role being denied from role-restricted routes.

## Evidence
- `npm run test:unit -- tests/unit/router-auth.test.ts`
  - 1 file passed.
  - 11 tests passed.
- `npm run test:unit:coverage -- tests/unit/router-auth.test.ts`
  - `src/router/index.ts`: statements 62.50%, branches 100.00%, functions 31.81%, lines 62.50%.
- `npm run test:unit:coverage`
  - 105 files passed.
  - 661 tests passed.
  - global statements 77.47%, branches 61.77%, functions 73.17%, lines 81.10%.
- `npm run test:e2e -- tests/e2e/login.spec.ts -g "首登账号访问登录页会被路由守卫送去改密页"`
  - Nuxt production build passed.
  - Chromium 1 test passed.

## Notes
- No production code change was required; this was an evidence hardening slice for a user-entry critical path.
- Gray observation remains owner-deferred and is not treated as a blocking step for this work item.
