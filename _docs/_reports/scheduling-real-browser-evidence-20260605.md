# 2026-06-05 Scheduling Real Browser Evidence

## Result

- Result: PASS
- Scope: Nuxt production build + Playwright Chromium project using Google Chrome channel.
- Command: `npm run test:e2e -- scheduling.spec.ts`
- Working directory: `src/frontend`
- Outcome: `24 passed`

## Covered User Interactions

- Scheduling page loads with metric cards.
- Baseline vs Agent OTD improvement is visible.
- Scheduler Agent workbench renders work-order pool, scenarios, explanations, execution tracing, and decision state.
- Backend recommendation flow:
  - Generate backend recommendation.
  - Adopt recommendation.
  - Keep fallback and show permission warning on `403`.
  - Keep demo fallback when API is unavailable.
- Rush-order impact analysis renders before insertion.
- BOM and routing constraints explain why the schedule is valid.
- Labor reassignment evidence releases a scheduling labor constraint.
- Missing labor replacement keeps a stop-work review event.
- Scheduler records Agent adoption reasons.
- Material, equipment, and rush events trigger Agent rescheduling suggestions.
- Rush insertion creates a multi-scenario decision package and enters OTD review evidence.
- Adopted event suggestions enter feedback records and report evidence chain.
- Task shortcuts open task-level scheduling explanation.
- Toolbar, objective selector, Gantt chart, task bars, time scale switching, dependency rendering, bottleneck marker, and refresh remain stable.

## Notes

- This is a focused browser-quality signal for the Scheduling critical path.
- It does not close hosted CI, PostgreSQL/staging rehearsal, human attack-chain verification, security signoff, or gray observation gates.
- Nuxt build still emits the known large chunk warning for chunks over `900 kB`; treat that as a separate performance follow-up.
