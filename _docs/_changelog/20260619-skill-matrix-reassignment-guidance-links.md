# 2026-06-19 Skill Matrix Reassignment Guidance Links

## Changed
- Added bilingual guidance before labor reassignment and stop-work review decisions in `SkillMatrixPanel`.
- Added contextual links to Production, Scheduling, Audit trail, and the local help anchor.
- Connected the stop-work review alert to the guidance with `aria-describedby="labor-reassignment-help"`.

## Evidence
- RED: `npm run test:unit -- skill-matrix-panel.test.ts -t "shows bilingual guidance"` failed because `.labor-reassignment-guidance` did not exist.
- GREEN: same targeted test passed.
- Component suite: `npm run test:unit -- skill-matrix-panel.test.ts` passed, 5/5.
- Full frontend coverage: `npm run test:unit:coverage` passed, 111 files / 1096 tests.
- Lint: `npm run lint` passed.
- Build: `npm run build` passed.
- Real browser: production preview on `127.0.0.1:4173`, `/scheduling/employee`, screenshot `labor-reassignment-guidance-real-browser-20260619`.

## Notes
- Real browser default demo data renders the guidance and links with an available reassignment candidate.
- The no-replacement stop-work alert `aria-describedby` association is covered by unit test because the default browser fixture does not enter that blocked state.
