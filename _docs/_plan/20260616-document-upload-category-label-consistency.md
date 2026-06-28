# 2026-06-16 Document Upload Category Label Consistency Plan

## Goal

Make uploaded document category labels consistent between the governance queue and upload history.

## Success Criteria

- The upload API still receives the backend category key, for example `quality`.
- The governance review queue shows the user-facing category label, for example `质量文档`.
- The upload history table shows the same user-facing label instead of the raw backend key.
- Targeted DocumentUpload unit coverage passes.
- Full frontend unit coverage passes.

## Execution

1. Re-baselined full frontend coverage and selected `DocumentUpload.vue` by coverage leverage plus user-critical value.
2. Read the upload success flow and the existing category-label helper.
3. Added a failing assertion to the existing selected-category upload test.
4. Reused `categoryLabel(category.value)` for the upload history row.
5. Ran targeted and full frontend coverage.

## Next Slice Candidate

Continue by coverage leverage plus user-critical value. Strong candidates from the latest baseline include `GanttChart.vue`, `AdminBoard.vue`, `DocumentUpload.vue`, and `RoutingBoard.vue`, but the next slice should start from a fresh baseline and a concrete user workflow gap.
