# 2026-06-15 HTTP Refresh Concurrency Coverage

- Added focused unit evidence for the global frontend HTTP client.
- Covered concurrent `401` responses sharing one `/auth/refresh` request before retrying each failed API call.
- Covered blank refresh-token fail-loud cleanup without retry.
- Covered `/auth/refresh` itself returning `401` without recursive refresh attempts.
- Covered backend ProblemDetails `title` toast extraction for non-auth API failures.
- No production code change was required; the existing implementation already satisfied the strengthened contract.

## Verification

From `src/frontend`:

```powershell
npm run test:unit -- tests/unit/http-refresh.test.ts --reporter=dot
npm run test:unit:coverage -- tests/unit/http-refresh.test.ts --reporter=dot --coverage.reporter=json-summary
npm run test:unit -- tests/unit/http-refresh.test.ts tests/unit/auth.store.test.ts tests/unit/auth-token.test.ts tests/unit/router-auth.test.ts --reporter=dot
```

Results:

- `http-refresh.test.ts`: 10 passed.
- Focused `src/api/http.ts` coverage: 92.3% lines, 91.17% statements, 75.47% branches, 100% functions.
- Auth/http/router focused regression: 4 files / 37 tests passed.

