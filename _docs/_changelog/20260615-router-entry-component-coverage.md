# 2026-06-15 Changelog: Router entry component coverage

- Added router coverage proving every registered workbench route resolves its lazy-loaded component.
- Added an explicit route-path manifest assertion so missing, renamed, or silently drifted navigation targets fail in unit tests.
- Kept the slice test-only; no production router behavior was changed.

Verification:
- `npm run test:unit -- tests/unit/router-auth.test.ts`: 12 passed.
- `npm run test:unit:coverage -- tests/unit/router-auth.test.ts --coverage.include=src/router/index.ts --coverage.reporter=json-summary --coverage.reporter=text-summary`: passed.
- Focused router coverage: statements 100%, branches 100%, functions 100%, lines 100%.
- `npm run test:unit:coverage -- --reporter=dot`: 111 files passed, 919 tests passed; global lines 89.00%.
- Local backend/API evidence remains on `http://localhost:5002`; this slice did not reintroduce host port `5000`.
