# Production API contract coverage

## Changed

- Expanded `src/frontend/tests/unit/production-api.test.ts` for the production execution API boundary.
- Added contract evidence that:
  - barcode scan payloads are passed through exactly, including whitespace and optional operator id shape;
  - offline demo start/complete/exception commands do not call backend command endpoints;
  - backend command failures propagate instead of being swallowed.

## Validation

- `npm run test:unit -- tests/unit/production-api.test.ts`: 1 file / 5 tests passed.
- `npm run test:unit -- tests/unit/production-board.test.ts`: 1 file / 26 tests passed.
- `npm run test:unit:coverage -- tests/unit/production-api.test.ts`: 1 file / 5 tests passed.
- `npm run test:unit:coverage`: 107 files / 796 tests passed; lines 84.31%.

## Notes

- No production code change was required; the existing API helper already satisfied the added contracts.
- This is API contract evidence only, not a real-browser UI evidence slice.
