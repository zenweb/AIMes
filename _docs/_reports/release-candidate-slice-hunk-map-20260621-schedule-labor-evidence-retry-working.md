# Release Candidate Slice Hunk Map

- GeneratedAt: 2026-06-21T20:33:00.4265335+08:00
- ManifestPath: _docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.manifest.json
- Candidate: schedule-labor-evidence-retry
- FirstSlice: labor-evidence-retry-offline-fallback
- DiffMode: working
- HunkCount: 56

## Summary

- EXCLUDE_THEME: 11
- KEEP_CANDIDATE: 7
- MIXED_REQUIRES_MANUAL_SPLIT: 5
- NEUTRAL_REVIEW: 33

## Hunk Classifications

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/scripts/e2e.mjs

- Header: @@ -5,12 +5,21 @@ import { runCommand } from '@nuxt/cli'
- IncludedHits: 人员证据启动读取失败后可重试
- ExcludedHits: real-dhtmlx-rush-drag-writeback: 真实 dhtmlx

### EXCLUDE_THEME - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -30,6 +30,23 @@
- IncludedHits: none
- ExcludedHits: schedule-guidance-links: schedule-workbench-guidance; schedule-guidance-links: schedule-workbench-help

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -56,6 +73,7 @@
- IncludedHits: none
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -103,9 +121,22 @@
- IncludedHits: retryStartupLaborEvidence
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -212,7 +243,7 @@ import { readQualityReworkImpactBackendFirst } from '../../utils/quality-rework-
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -254,7 +285,9 @@ import { readPocPilotRunRecordBackendFirst } from '../../utils/poc-pilot-run-syn
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -297,7 +330,10 @@ const showFeedbackForm = ref(false)
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -305,6 +341,8 @@ const engineeringChangeImpact = ref<EngineeringChangeImpactAnalysis | null>(null
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -442,10 +480,16 @@ const rushOrderImpact = reactive<RushOrderImpact>({
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -511,6 +555,8 @@ const scenarioTemplatesByType: Record<ScheduleEventItem['type'], ScenarioTemplat
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -520,6 +566,8 @@ const scenarioTemplatesByType: Record<ScheduleEventItem['type'], ScenarioTemplat
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -528,6 +576,8 @@ const scenarioTemplatesByType: Record<ScheduleEventItem['type'], ScenarioTemplat
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -804,8 +854,25 @@ function formatScenarioDecisionTrail(suggestion: ScheduleAgentSuggestion) {
- IncludedHits: none
- ExcludedHits: none

### EXCLUDE_THEME - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -832,15 +899,63 @@ watch(activeAgentSuggestion, (suggestion) => {
- IncludedHits: none
- ExcludedHits: multi-objective-feedback-readback: restoreLatestFeedbackSnapshot; multi-objective-feedback-readback: missingFeedbackSnapshotFields

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -861,6 +976,9 @@ async function loadData(options: { preserveError?: boolean } = {}) {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -881,8 +999,13 @@ async function loadData(options: { preserveError?: boolean } = {}) {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1042,7 +1165,12 @@ async function applyShortageResolutionToEvents(events: ScheduleEventItem[]): Pro
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1567,9 +1695,10 @@ function readBarcodeScheduleReleaseRecord() {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1652,7 +1781,7 @@ async function applyEngineeringChangeApprovals() {
- IncludedHits: none
- ExcludedHits: none

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1679,8 +1808,118 @@ async function applyRouteCapabilityValidation() {
- IncludedHits: loadStartupLaborEvidence; retryStartupLaborEvidence; currentLaborReassignment; currentActiveLaborQualificationBlock
- ExcludedHits: assistant-engineering-fail-loud: loadStartupEngineeringConstraints; assistant-engineering-fail-loud: readAssistantEngineeringConstraintPackagesSafely

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1702,7 +1941,7 @@ function applyLaborReassignmentClosure() {
- IncludedHits: currentActiveLaborQualificationBlock
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1729,7 +1968,7 @@ function applyLaborQualificationBlockClosure() {
- IncludedHits: currentLaborReassignment
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1753,7 +1992,7 @@ function applyLaborReassignmentToEvents(events: ScheduleEventItem[]): ScheduleEv
- IncludedHits: currentActiveLaborQualificationBlock
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1853,31 +2092,37 @@ function handleExportCsv() {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -1991,8 +2236,18 @@ function buildDemoWorkOrder(task: GanttTask): WorkOrderDto {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2002,16 +2257,24 @@ function handleTaskDragEnd(taskId: string, newStart: Date, newEnd: Date) {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2113,9 +2376,17 @@ function objectiveLabel(objective: string): string {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2134,7 +2405,9 @@ async function handleScheduleDecision(payload: ScheduleFeedbackPayload) {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2149,16 +2422,20 @@ async function handleScheduleDecision(payload: ScheduleFeedbackPayload) {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2247,7 +2524,21 @@ function generateAgentSuggestion(event: ScheduleEventItem) {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2261,7 +2552,21 @@ function generateAgentSuggestion(event: ScheduleEventItem) {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2307,7 +2612,21 @@ function generateAgentSuggestion(event: ScheduleEventItem) {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2343,7 +2662,21 @@ function generateAgentSuggestion(event: ScheduleEventItem) {
- IncludedHits: none
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2402,7 +2735,42 @@ function generateAgentSuggestion(event: ScheduleEventItem) {
- IncludedHits: currentLaborReassignment; currentActiveLaborQualificationBlock; 人员资质证据刷新失败
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2417,7 +2785,6 @@ function generateAgentSuggestion(event: ScheduleEventItem) {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2595,7 +2962,10 @@ async function adoptAgentSuggestion(suggestion: ScheduleAgentSuggestion) {
- IncludedHits: none
- ExcludedHits: none

### EXCLUDE_THEME - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2610,10 +2980,29 @@ async function adoptAgentSuggestion(suggestion: ScheduleAgentSuggestion) {
- IncludedHits: none
- ExcludedHits: assistant-engineering-fail-loud: Assistant 恢复交接; assistant-engineering-fail-loud: readAssistantEngineeringConstraintPackagesSafely

### NEUTRAL_REVIEW - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2629,9 +3018,26 @@ function onFeedbackSubmitted() {
- IncludedHits: none
- ExcludedHits: none

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2650,16 +3056,17 @@ function onApplyObjective(objective: string) {
- IncludedHits: loadStartupLaborEvidence
- ExcludedHits: multi-objective-feedback-readback: restoreLatestFeedbackSnapshot; assistant-engineering-fail-loud: loadStartupEngineeringConstraints; assistant-engineering-fail-loud: readAssistantEngineeringConstraintPackagesSafely

### EXCLUDE_THEME - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2747,6 +3154,61 @@ onMounted(async () => {
- IncludedHits: none
- ExcludedHits: schedule-guidance-links: schedule-workbench-guidance; schedule-guidance-links: schedule-workbench-help

### EXCLUDE_THEME - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -2859,10 +3321,47 @@ onMounted(async () => {
- IncludedHits: none
- ExcludedHits: schedule-guidance-links: schedule-workbench-guidance

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -1,15 +1,55 @@
- IncludedHits: LABOR_EVIDENCE_RETRY_TITLE; LEGACY_PERSONNEL_EVIDENCE_TITLES; mockLaborEvidenceRetryApis; 人员证据启动读取失败后可重试; 人员替班证据释放排产人员约束; 人员无有效替班候选时排产保持停工复核事件
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR; real-dhtmlx-rush-drag-writeback: 真实 dhtmlx

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -203,6 +243,31 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -287,6 +352,310 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: assistant-engineering-fail-loud: Assistant 恢复交接

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -319,6 +688,14 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -330,6 +707,12 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -358,7 +741,20 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: multi-objective-feedback-readback: 多目标对比

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -372,88 +768,2104 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: multi-objective-feedback-readback: 多目标对比; multi-objective-feedback-readback: adoption-feedback/latest

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -484,14 +2896,14 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: 人员替班证据释放排产人员约束
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -509,8 +2921,36 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: 人员证据启动读取失败后可重试; 人员无有效替班候选时排产保持停工复核事件
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -536,7 +2976,7 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -601,6 +3041,46 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -609,18 +3089,37 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -630,7 +3129,21 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -757,6 +3270,236 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR; real-dhtmlx-rush-drag-writeback: 真实 dhtmlx; real-dhtmlx-rush-drag-writeback: dragRushTask; real-dhtmlx-rush-drag-writeback: createDhtmlxSchedulePlan; real-dhtmlx-rush-drag-writeback: withRushWindow

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -876,3 +3619,415 @@ async function mockAgentApi(page: import('@playwright/test').Page, options: { ad
- IncludedHits: mockLaborEvidenceRetryApis
- ExcludedHits: real-dhtmlx-rush-drag-writeback: 真实 dhtmlx; real-dhtmlx-rush-drag-writeback: dragRushTask; real-dhtmlx-rush-drag-writeback: createDhtmlxSchedulePlan; real-dhtmlx-rush-drag-writeback: withRushWindow

## Guidance

- Stage KEEP_CANDIDATE hunks only after human review.
- Do not stage EXCLUDE_THEME hunks for this first labor retry slice.
- Split MIXED_REQUIRES_MANUAL_SPLIT hunks manually before staging.
- Treat NEUTRAL_REVIEW hunks as dependencies; include only when needed by a reviewed keep hunk.
