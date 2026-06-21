# Release Candidate Slice Hunk Map

- GeneratedAt: 2026-06-21T22:54:54.0883600+08:00
- ManifestPath: _docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.manifest.json
- Candidate: schedule-labor-evidence-retry
- FirstSlice: labor-evidence-retry-offline-fallback
- DiffMode: staged
- HunkCount: 23

## Diff Files Missing From Manifest

- none

## Summary

- KEEP_CANDIDATE: 17
- NEUTRAL_REVIEW: 6

## Hunk Classifications

### KEEP_CANDIDATE - src/frontend/src/api/executionEvidence.ts

- Header: @@ -3,11 +3,15 @@ import type { BarcodeScanEvidenceRecord } from '../utils/barcode-scan-evidence-s
- IncludedHits: queryLaborReassignments
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/api/executionEvidence.ts

- Header: @@ -17,11 +21,15 @@ export async function upsertLaborReassignment(item: LaborReassignmentRecord): Pr
- IncludedHits: queryLaborQualificationBlocks
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -106,6 +106,15 @@
- IncludedHits: retryStartupLaborEvidence
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -254,7 +263,9 @@ import { readPocPilotRunRecordBackendFirst } from '../../utils/poc-pilot-run-syn
- IncludedHits: readLaborReassignmentsBackendFirst; readLaborQualificationBlocksBackendFirst
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -305,6 +316,8 @@ const engineeringChangeImpact = ref<EngineeringChangeImpactAnalysis | null>(null
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -442,10 +455,16 @@ const rushOrderImpact = reactive<RushOrderImpact>({
- IncludedHits: none
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1679,8 +1698,62 @@ async function applyRouteCapabilityValidation() {
- IncludedHits: loadStartupLaborEvidence; retryStartupLaborEvidence; currentLaborReassignment; currentActiveLaborQualificationBlock; readLaborReassignmentsBackendFirst; readLaborQualificationBlocksBackendFirst
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1702,7 +1775,7 @@ function applyLaborReassignmentClosure() {
- IncludedHits: currentActiveLaborQualificationBlock
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1729,7 +1802,7 @@ function applyLaborQualificationBlockClosure() {
- IncludedHits: currentLaborReassignment
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1753,7 +1826,7 @@ function applyLaborReassignmentToEvents(events: ScheduleEventItem[]): ScheduleEv
- IncludedHits: currentActiveLaborQualificationBlock
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2402,7 +2475,7 @@ function generateAgentSuggestion(event: ScheduleEventItem) {
- IncludedHits: currentActiveLaborQualificationBlock
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2417,7 +2490,7 @@ function generateAgentSuggestion(event: ScheduleEventItem) {
- IncludedHits: currentLaborReassignment
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2656,6 +2729,7 @@ function onApplyObjective(objective: string) {
- IncludedHits: loadStartupLaborEvidence
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2758,6 +2832,22 @@ onMounted(async () => {
- IncludedHits: none
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/utils/labor-assignment-sync.ts

- Header: @@ -247,9 +247,29 @@ export function readLaborReassignments(): LaborReassignmentRecord[] {
- IncludedHits: queryLaborReassignments; readLaborReassignmentsBackendFirst
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/utils/labor-assignment-sync.ts

- Header: @@ -260,9 +280,29 @@ export function readLaborQualificationBlocks(): LaborQualificationBlockRecord[]
- IncludedHits: queryLaborQualificationBlocks; readLaborQualificationBlocksBackendFirst
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -1,15 +1,43 @@
- IncludedHits: LABOR_EVIDENCE_RETRY_TITLE; LEGACY_PERSONNEL_EVIDENCE_TITLES; mockLaborEvidenceRetryApis; 人员证据启动读取失败后可重试; 人员替班证据释放排产人员约束; 人员无有效替班候选时排产保持停工复核事件
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -108,7 +136,7 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -148,7 +176,7 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -484,14 +512,14 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: 人员替班证据释放排产人员约束
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -509,8 +537,36 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: 人员证据启动读取失败后可重试; 人员无有效替班候选时排产保持停工复核事件
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -536,7 +592,7 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -876,3 +932,219 @@ async function mockAgentApi(page: import('@playwright/test').Page, options: { ad
- IncludedHits: mockLaborEvidenceRetryApis
- ExcludedHits: none

## Guidance

- Stage KEEP_CANDIDATE hunks only after human review.
- Do not stage EXCLUDE_THEME hunks for this first labor retry slice.
- Split MIXED_REQUIRES_MANUAL_SPLIT hunks manually before staging.
- Treat NEUTRAL_REVIEW hunks as dependencies; include only when needed by a reviewed keep hunk.
