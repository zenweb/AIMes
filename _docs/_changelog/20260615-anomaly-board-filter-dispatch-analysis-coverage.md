# 2026-06-15 AnomalyBoard filter/dispatch/analysis coverage

## Changed

- Added AnomalyBoard coverage for Space-key detail opening, open-filter behavior, and paginated page readback.
- Added fallback coverage where a latest production anomaly event stays visible when the anomaly list API falls back to demo data.
- Added equipment dispatch evidence coverage for the equipment-specific audit route.
- Added material anomaly AI-analysis fallback coverage, including root cause, resolution, resolved-by, and material isolation suggestion rendering.

## Validation

- `npm run test:unit -- tests/unit/anomaly-board.test.ts`
  - 1 file passed, 20 tests passed.
- `npm run test:unit:coverage -- tests/unit/anomaly-board.test.ts --coverage.include=src/components/anomaly/AnomalyBoard.vue`
  - AnomalyBoard.vue: statements 90.86%, branches 86.02%, functions 83.33%, lines 95.29%.
- `npm run test:unit:coverage -- --reporter=dot`
  - 111 files passed, 897 tests passed.
  - Global coverage: statements 84.53%, branches 69.88%, functions 82.24%, lines 87.84%.

