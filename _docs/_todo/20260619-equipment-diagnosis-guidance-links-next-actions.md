# 2026-06-19 Todo: Equipment Diagnosis Guidance Links Next Actions

## Done In This Slice
- Added bilingual guidance to equipment fault diagnosis.
- Linked diagnosis to schedule impact, maintenance history, and local help.
- Verified target, component, full coverage, lint, build, and real browser production preview.

## Next Actions
- Continue selecting slices by coverage leverage plus existing user-critical workflow value.
- Do not continue polishing `EquipmentBoard.vue` unless the next issue protects equipment correctness, downtime recovery, evidence freshness, or operator decision safety.
- Candidate next areas from the current coverage profile: `ChatPanel.vue`, `BomBoard.vue`, `GanttChart.vue`, `AdminBoard.vue`, or another proven low-coverage user-critical path.
- Keep Vitest coverage runs serial because `src/frontend/coverage/.tmp` is shared.
- Keep backend/staging work on `5003`, not `5000`.
- Do not claim strict v1.0.0 release readiness until gray observation is no longer deferred.

