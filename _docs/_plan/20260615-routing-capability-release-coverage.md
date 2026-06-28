# 2026-06-15 Plan: Routing capability release coverage

## Goal

Harden the existing engineering route capability workflow so validated bottleneck evidence and confirmed split/batch release evidence remain auditable before scheduling can rely on them.

## Success Criteria

- Saved capability validation history renders as `瓶颈已校验` with audit/trace IDs.
- Successful validation save enables release and explains that scheduling must wait for release.
- Successful release save updates the bridge copy to the confirmed split/batch plan.
- Pagination loads the requested route page.
- Focused coverage improves materially without production changes.

## Result

- Added four focused tests to `src/frontend/tests/unit/routing-board.test.ts`.
- `npm run test:unit -- tests/unit/routing-board.test.ts` passed.
- `npm run test:unit:coverage -- tests/unit/routing-board.test.ts --coverage.include=src/components/routing/RoutingBoard.vue` reported statements 85.8%, branches 77.98%, functions 85.18%, lines 90.97%.

## Next Route

Continue selecting low-coverage, user-critical existing paths from the full coverage table. Do not treat focused component coverage as the full-suite truth.
