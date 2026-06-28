# 2026-06-19 Quality CAPA Operation Guidance Links

## Changed
- Added bilingual pre-writeback guidance to `QualityCapaTaskPanel` for formal CAPA approval, low-score review queues, and published recommendation adoption.
- Added contextual links from the guidance block to the reuse draft trace, audit id, and local help anchor.
- Connected the formal CAPA writeback card to the guidance with `aria-describedby="quality-capa-operation-help"`.

## Evidence
- RED: `npm run test:unit -- quality-capa-task-panel.test.ts -t "shows bilingual guidance"` failed because `.capa-operation-guidance` did not exist.
- GREEN: same targeted test passed.
- Component suite: `npm run test:unit -- quality-capa-task-panel.test.ts` passed, 18/18.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1095 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `127.0.0.1:4173`, `/scheduling/quality`, screenshot `quality-capa-operation-guidance-real-browser-20260619`.

## Notes
- This slice follows the core product principles: Simplified Chinese + English guidance, contextual links, and help affordance before complex operations.
- Overall v1.0.0 remains not fully provable while the gray observation window is intentionally skipped/deferred.
