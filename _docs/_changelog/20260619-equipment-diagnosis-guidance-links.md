# 2026-06-19 Changelog: Equipment Diagnosis Guidance Links

## Changed
- Added bilingual operation guidance to the equipment fault diagnosis workflow.
- Added contextual links from diagnosis to schedule impact, maintenance history, and in-place help.
- Added `aria-describedby="equipment-diagnosis-help"` to the diagnosis action row.

## Verification
- RED: `npm run test:unit -- tests/unit/equipment-board.test.ts -t "guides equipment diagnosis with bilingual prompts"` failed on missing `.diagnosis-guidance`.
- GREEN: same targeted test passed.
- Component suite: `npm run test:unit -- tests/unit/equipment-board.test.ts` passed 15/15.
- Full frontend coverage: `npm run test:unit:coverage` passed 111 files / 1099 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `127.0.0.1:4173`, screenshot `equipment-diagnosis-guidance-real-browser-20260619`.

