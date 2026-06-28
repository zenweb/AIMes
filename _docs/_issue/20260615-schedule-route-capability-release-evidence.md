# 2026-06-15 Issue - ScheduleBoard 工艺能力放行采纳证据

Issue:
- Released route capability evidence did not have a focused test proving that the confirmed batch window and trace are preserved after Agent suggestion adoption.
- Full frontend coverage exposed a reliability issue where `ParetoCompare` could still trigger a late async `GanttChart.vue` CSS import after environment teardown.

Impact:
- Released engineering capacity could lose its batch-window context in adoption feedback.
- Full-suite coverage could report passing tests while still failing on unhandled teardown errors.

Resolution:
- Added the released route capability adoption test.
- Added a module-level `GanttChart.vue` mock in `pareto-compare.test.ts` so the test no longer depends on the real async component/CSS import.

Not fixed here:
- Live browser staging remains gated by external Docker/API state.
