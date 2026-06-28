# 2026-06-14 Shortage Evidence API Contract Evidence

## Changed
- Added unit contract coverage for `src/frontend/src/api/shortageEvidence.ts`.
- Covered shortage kitting, shortage risk resolution, BOM kitting package, supply risk escalation, and supplier network decision read/write backend paths.
- Verified optional latest reads return `null` on backend failure so stale shortage evidence is not presented as live backend proof.

## Verification
- `npm run test:unit -- tests/unit/shortage-evidence-api.test.ts` -> 1 file passed, 2 tests passed.
- `npm run test:unit -- tests/unit/shortage-evidence-api.test.ts tests/unit/shortage-risk-sync.test.ts tests/unit/kitting-closure-panel.test.ts tests/unit/bom-board.test.ts tests/unit/purchase-board.test.ts tests/unit/dashboard-board.test.ts tests/unit/schedule-board.test.ts tests/unit/chat-panel.test.ts` -> 8 files passed, 109 tests passed.
- `npm run test:unit:coverage -- tests/unit/shortage-evidence-api.test.ts` -> focused coverage 30/30 lines.

## Notes
- No production code changed. Existing implementation already matched the backend contract; this slice closes missing evidence for the shortage-to-purchase-to-schedule recovery path.
