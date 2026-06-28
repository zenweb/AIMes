# 2026-06-19 Review: Routing capability release readback

## Scope
- Reviewed `src/frontend/src/components/routing/RoutingBoard.vue`.
- Reviewed `src/frontend/tests/unit/routing-board.test.ts`.

## Findings
- Fixed: route capability validation and release writes previously trusted the local write result without backend readback.
- Fixed: release readback failures now fail loud while preserving local release evidence for operator review.

## Verification
- Targeted RED/GREEN unit test confirmed the missing readback behavior.
- `routing-board.test.ts` passed.
- Full frontend coverage, lint, and build passed.

## Residual Risk
- This is frontend unit evidence. A staging probe would add stronger proof that the backend returns the same released record after write.
- Gray observation remains outside this slice.
