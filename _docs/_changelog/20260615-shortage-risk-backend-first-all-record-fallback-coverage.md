# 2026-06-15 Shortage Risk Backend-First All-Record Fallback Coverage

## Changed

- Extended shortage-risk backend-first fallback coverage to all shortage evidence record types.
- Added direct assertions for incomplete backend `ShortageRiskResolution` and `ShortageKittingEvent` records.
- Preserved the existing behavior where BOM kitting packages can derive a shortage kitting event.

## Validation

- `npm run test:unit -- tests/unit/shortage-risk-sync.test.ts --reporter=dot`
- `npm run test:unit -- --reporter=dot`
- `npm run test:unit:coverage -- --reporter=dot`

## Result

- Targeted shortage-risk tests: 12 passed.
- Full frontend unit suite: 111 files / 993 tests passed.
- Full frontend coverage: statements 87.71%, branches 74.15%, functions 87.19%, lines 90.94%.
- `src/utils/shortage-risk-sync.ts`: statements 80.12%, branches 84.83%, functions 100%, lines 90.78%.

## Boundary

This continues hardening the existing shortage / supply evidence path. No new feature scope was added.
