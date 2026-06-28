# Release Candidate Slice Boundary

- GeneratedAt: 2026-06-22T01:03:11.9011253+08:00
- ManifestPath: _docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.manifest.json
- Candidate: schedule-labor-evidence-retry
- FirstSlice: labor-evidence-retry-offline-fallback
- DiffMode: staged
- Result: PASS

## Inspected Files

- src/frontend/scripts/e2e.mjs
- src/frontend/src/api/executionEvidence.ts
- src/frontend/src/components/schedule/ScheduleBoard.vue
- src/frontend/src/utils/labor-assignment-sync.ts
- src/frontend/tests/e2e/scheduling.spec.ts

## Diff Files Missing From Manifest

- none

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
- queryLaborReassignments
- queryLaborQualificationBlocks
- readLaborReassignmentsBackendFirst
- readLaborQualificationBlocksBackendFirst

## Excluded Theme Token Hits

- none

## Included Slice Token Locations

- src/frontend/scripts/e2e.mjs:14: 人员证据启动读取失败后可重试
- src/frontend/src/api/executionEvidence.ts:6: queryLaborReassignments
- src/frontend/src/api/executionEvidence.ts:24: queryLaborQualificationBlocks
- src/frontend/src/components/schedule/ScheduleBoard.vue:136: retryStartupLaborEvidence
- src/frontend/src/components/schedule/ScheduleBoard.vue:288: readLaborQualificationBlocksBackendFirst
- src/frontend/src/components/schedule/ScheduleBoard.vue:290: readLaborReassignmentsBackendFirst
- src/frontend/src/components/schedule/ScheduleBoard.vue:1867: loadStartupLaborEvidence
- src/frontend/src/components/schedule/ScheduleBoard.vue:1870: readLaborQualificationBlocksBackendFirst
- src/frontend/src/components/schedule/ScheduleBoard.vue:1871: readLaborReassignmentsBackendFirst
- src/frontend/src/components/schedule/ScheduleBoard.vue:1892: retryStartupLaborEvidence
- src/frontend/src/components/schedule/ScheduleBoard.vue:1898: loadStartupLaborEvidence
- src/frontend/src/components/schedule/ScheduleBoard.vue:1909: currentLaborReassignment
- src/frontend/src/components/schedule/ScheduleBoard.vue:1915: currentActiveLaborQualificationBlock
- src/frontend/src/components/schedule/ScheduleBoard.vue:1922: currentLaborReassignment
- src/frontend/src/components/schedule/ScheduleBoard.vue:1944: currentActiveLaborQualificationBlock
- src/frontend/src/components/schedule/ScheduleBoard.vue:1971: currentLaborReassignment
- src/frontend/src/components/schedule/ScheduleBoard.vue:1995: currentActiveLaborQualificationBlock
- src/frontend/src/components/schedule/ScheduleBoard.vue:2738: currentActiveLaborQualificationBlock
- src/frontend/src/components/schedule/ScheduleBoard.vue:2739: currentLaborReassignment
- src/frontend/src/components/schedule/ScheduleBoard.vue:2743: readLaborQualificationBlocksBackendFirst
- src/frontend/src/components/schedule/ScheduleBoard.vue:2744: readLaborReassignmentsBackendFirst
- src/frontend/src/components/schedule/ScheduleBoard.vue:3065: loadStartupLaborEvidence
- src/frontend/src/utils/labor-assignment-sync.ts:3: queryLaborQualificationBlocks
- src/frontend/src/utils/labor-assignment-sync.ts:4: queryLaborReassignments
- src/frontend/src/utils/labor-assignment-sync.ts:264: readLaborReassignmentsBackendFirst
- src/frontend/src/utils/labor-assignment-sync.ts:266: queryLaborReassignments
- src/frontend/src/utils/labor-assignment-sync.ts:297: readLaborQualificationBlocksBackendFirst
- src/frontend/src/utils/labor-assignment-sync.ts:299: queryLaborQualificationBlocks
- src/frontend/tests/e2e/scheduling.spec.ts:7: LABOR_EVIDENCE_RETRY_TITLE
- src/frontend/tests/e2e/scheduling.spec.ts:7: 人员证据启动读取失败后可重试
- src/frontend/tests/e2e/scheduling.spec.ts:8: LEGACY_PERSONNEL_EVIDENCE_TITLES
- src/frontend/tests/e2e/scheduling.spec.ts:9: 人员替班证据释放排产人员约束
- src/frontend/tests/e2e/scheduling.spec.ts:10: 人员无有效替班候选时排产保持停工复核事件
- src/frontend/tests/e2e/scheduling.spec.ts:31: LEGACY_PERSONNEL_EVIDENCE_TITLES
- src/frontend/tests/e2e/scheduling.spec.ts:33: LABOR_EVIDENCE_RETRY_TITLE
- src/frontend/tests/e2e/scheduling.spec.ts:47: LABOR_EVIDENCE_RETRY_TITLE
- src/frontend/tests/e2e/scheduling.spec.ts:54: mockLaborEvidenceRetryApis
- src/frontend/tests/e2e/scheduling.spec.ts:2914: 人员替班证据释放排产人员约束
- src/frontend/tests/e2e/scheduling.spec.ts:2940: 人员证据启动读取失败后可重试
- src/frontend/tests/e2e/scheduling.spec.ts:2968: 人员无有效替班候选时排产保持停工复核事件
- src/frontend/tests/e2e/scheduling.spec.ts:3891: mockLaborEvidenceRetryApis

## Excluded Theme Token Locations

- none

## Gate

- Boundary check passed: staged diff does not contain excluded-theme tokens from the manifest.
