# 2026-06-19 Issue: BOM kitting package publish lacked readback

## Problem
- Publishing a BOM kitting package wrote local package evidence and attempted OTD evidence sync, but did not re-read the backend package record afterward.
- A backend readback outage could be missed while the operator saw the package as published.

## Impact
- Inventory, scheduling, audit, and OTD workflows depend on the same package trace.
- Without a readback warning, operators could assume the backend package evidence was readable when it was not.

## Resolution
- Added a post-publish readback confirmation helper.
- On readback success, the backend package becomes the visible package.
- On readback failure, the local package remains locked and a fail-loud alert tells the operator to review backend readback status.

## Verification
- `npm run test:unit -- tests/unit/bom-board.test.ts -t "fails loud but keeps the BOM kitting package locked when package readback fails after publishing"`
- `npm run test:unit -- tests/unit/bom-board.test.ts`
- `npm run test:unit:coverage`
- `npm run lint`
- `npm run build`
