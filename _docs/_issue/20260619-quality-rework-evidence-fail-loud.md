# 2026-06-19 Issue: Quality rework evidence storage failure escaped handler

## Problem
- `QualityBoard` handled MRB and barcode quality write failures with fail-loud alerts, but `handleCreateReworkEvent` did not catch storage failures.
- A failed quality rework evidence archival could surface as an unhandled component event error instead of an operator-facing alert.

## Impact
- Operators could lose a clear recovery path for a quality rework scheduling decision.
- The UI could imply continuity around a complex quality operation without explicitly showing why evidence archival failed.

## Resolution
- Wrapped rework evidence archival in a try/catch.
- On failure, the alert banner now includes `质量返工排产证据写入失败` plus the concrete error message.
- On success, stale rework-write alerts are cleared.

## Verification
- `npm run test:unit -- tests/unit/quality-board.test.ts -t "fails loud when quality rework impact evidence cannot be archived"`
- `npm run test:unit -- tests/unit/quality-board.test.ts`
- `npm run test:unit:coverage`
- `npm run lint`
- `npm run build`
