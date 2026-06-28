# 2026-06-15 Shortage Risk Backend-First Auditable Fallback

## Changed

- Hardened the shortage evidence backend-first readers so they only accept fully auditable backend payloads.
- If backend latest records are incomplete, the code now falls back to the local audited evidence already stored in browser state.

## Why

- This protects the user-critical shortage / supply / supplier-network path from displaying incomplete backend evidence as if it were authoritative.

## Validation

- Added a failing unit test first for incomplete backend records.
- `npm run test:unit -- tests/unit/shortage-risk-sync.test.ts --reporter=dot`
- `npm run test:unit -- tests/unit/shortage-evidence-api.test.ts tests/unit/purchase-board.test.ts tests/unit/schedule-board.test.ts --reporter=dot`
- `npm run test:unit -- --reporter=dot`

## Result

- Selected shortage-risk unit slice: 12 passed.
- Related purchase / schedule slices: 93 passed.
- Full frontend unit suite: 993 passed.

## Boundary

This is a hardening change for an existing user-critical path. It does not broaden feature scope.
