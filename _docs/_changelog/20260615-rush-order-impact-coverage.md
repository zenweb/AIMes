# 2026-06-15 Changelog: RushOrderImpactPanel coverage

## Changed

- Added focused unit evidence for `RushOrderImpactPanel`.
- Covered the user-visible rush insertion impact path: order title, recommendation, affected orders, delay, changeover, bottleneck equipment, material shortage/action, and recommended option styling.
- Covered the no-downstream-impact state so schedulers still see explicit `0` delay/changeover/affected-order evidence before committing an insertion.

## Verification

- `npm run test:unit -- tests/unit/rush-order-impact-panel.test.ts` => 1 file passed, 2 tests passed.
- `npm run test:unit:coverage -- tests/unit/rush-order-impact-panel.test.ts --coverage.include=src/components/schedule/RushOrderImpactPanel.vue` => statements 100%, branches 100%, functions 100%, lines 100%.

## Notes

- No production component logic was changed in this slice.
- New browser/staging evidence should use API host `http://localhost:5002`; historical `localhost:5000` reports were not rewritten.
