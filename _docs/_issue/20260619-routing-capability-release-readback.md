# 2026-06-19 Issue: Route capability release lacked backend readback

## Problem
- `RoutingBoard` route capability validation and split/batch release actions accepted the local write result as final evidence.
- A backend readback failure after release could be missed, weakening the scheduling release evidence chain.

## Impact
- Operators could see a released routing capability record without knowing whether the backend evidence path was readable.
- AI scheduling and audit navigation rely on this release signal, so readback uncertainty must be visible.

## Resolution
- Added a shared readback confirmation helper after successful capability validation and release writes.
- On readback success, the backend record becomes authoritative.
- On readback failure, local evidence stays visible and the alert explains that backend readback needs review.

## Verification
- `npm run test:unit -- tests/unit/routing-board.test.ts -t "fails loud but keeps local release evidence when release readback fails"`
- `npm run test:unit -- tests/unit/routing-board.test.ts`
- `npm run test:unit:coverage`
- `npm run lint`
- `npm run build`
