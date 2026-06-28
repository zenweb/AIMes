# Release Candidate Slice Boundary

- GeneratedAt: 2026-06-21T19:46:57.2086135+08:00
- ManifestPath: _docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.manifest.json
- Candidate: schedule-labor-evidence-retry
- FirstSlice: labor-evidence-retry-offline-fallback
- Result: FAIL

## Inspected Files

- src/frontend/scripts/e2e.mjs
- src/frontend/src/components/schedule/ScheduleBoard.vue
- src/frontend/tests/e2e/scheduling.spec.ts

## Included Slice Token Hits

- LABOR_EVIDENCE_RETRY_TITLE
- LEGACY_PERSONNEL_EVIDENCE_TITLES
- mockLaborEvidenceRetryApis
- 人员证据启动读取失败后可重试
- 人员替班证据释放排产人员约束
- 人员无有效替班候选时排产保持停工复核事件
- loadStartupLaborEvidence
- retryStartupLaborEvidence
- currentLaborReassignment
- currentActiveLaborQualificationBlock
- 人员资质证据刷新失败

## Excluded Theme Token Hits

- real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR
- real-dhtmlx-rush-drag-writeback: 真实 dhtmlx
- real-dhtmlx-rush-drag-writeback: dragRushTask
- real-dhtmlx-rush-drag-writeback: createDhtmlxSchedulePlan
- real-dhtmlx-rush-drag-writeback: withRushWindow
- multi-objective-feedback-readback: 多目标对比
- multi-objective-feedback-readback: restoreLatestFeedbackSnapshot
- multi-objective-feedback-readback: missingFeedbackSnapshotFields
- multi-objective-feedback-readback: adoption-feedback/latest
- assistant-engineering-fail-loud: Assistant 恢复交接
- assistant-engineering-fail-loud: loadStartupEngineeringConstraints
- assistant-engineering-fail-loud: readAssistantEngineeringConstraintPackagesSafely
- schedule-guidance-links: schedule-workbench-guidance
- schedule-guidance-links: schedule-workbench-help

## Gate

- Boundary check failed: current diff contains excluded-theme tokens. Split the candidate before staging or pushing.
