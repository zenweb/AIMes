# Release Candidate Slice Hunk Map

- GeneratedAt: 2026-06-21T22:49:56.9690069+08:00
- ManifestPath: _docs/_reports/release-candidate-slice-20260621-schedule-labor-evidence-retry.manifest.json
- Candidate: schedule-labor-evidence-retry
- FirstSlice: labor-evidence-retry-offline-fallback
- DiffMode: working
- HunkCount: 64

## Diff Files Missing From Manifest

- scripts/run-attack-chain-automated-evidence.ps1
- scripts/run-attack-chain-verification.ps1
- scripts/run-gray-observation.ps1
- scripts/run-hosted-ci-evidence.ps1
- scripts/run-release-gate-audit.ps1
- scripts/run-security-self-assessment.ps1
- scripts/run-staging-rehearsal.ps1
- src/backend/MES.AI/Services/LlmGatewayService.cs
- src/backend/MES.Api/Configuration/AimesHostOptions.cs
- src/backend/MES.Api/Endpoints/ReportEndpoints.cs
- src/backend/MES.Api/Endpoints/SchedulingEndpoints.cs
- src/backend/MES.Api/Extensions/ServiceCollectionExtensions.cs
- src/backend/MES.Api/MES.Api.csproj
- src/backend/MES.Api/Properties/launchSettings.json
- src/backend/MES.Api/Services/DatabaseStartupValidator.cs
- src/backend/MES.Application/DTOs/OperationDtos.cs
- src/backend/MES.Application/DTOs/ReportDtos.cs
- src/backend/MES.Application/DTOs/SchedulingDtos.cs
- src/backend/MES.Application/Services/OperationService.cs
- src/backend/MES.Application/Services/SchedulingAppService.cs
- src/backend/MES.Domain/Entities/Admin/SystemUser.cs
- src/backend/MES.Domain/Interfaces/Repositories/IOperationRepository.cs
- src/backend/MES.Domain/ValueObjects/OperationCode.cs
- src/backend/MES.Infrastructure/Data/Configurations/AgentEvidenceLinkConfiguration.cs
- src/backend/MES.Infrastructure/Data/DemoDataSeeder.cs
- src/backend/MES.Infrastructure/Data/Migrations/20260510220003_InitialCreate.cs
- src/backend/MES.Infrastructure/Data/Migrations/20260523063550_AddAdminAuthAndConcurrencyBaseline.cs
- src/backend/MES.Infrastructure/Data/Migrations/20260530090000_AddSystemUserMustChangePassword.cs
- src/backend/MES.Infrastructure/Data/Migrations/20260531120000_AddCoreCompositeIndexesAndJsonb.cs
- src/backend/MES.Infrastructure/Data/Migrations/MesDbContextModelSnapshot.cs
- src/backend/MES.Infrastructure/Repositories/AgentDecisionRepository.cs
- src/backend/MES.Infrastructure/Repositories/OperationRepository.cs
- src/backend/MES.Infrastructure/Repositories/ScheduleRepository.cs
- src/backend/MES.Infrastructure/Services/ExportAppService.cs
- src/backend/MES.Infrastructure/Services/SchedulingContextProvider.cs
- src/frontend/middleware/auth.global.ts
- src/frontend/nuxt.config.ts
- src/frontend/scripts/preview.mjs
- src/frontend/src/api/assistantEvidence.ts
- src/frontend/src/api/engineeringEvidence.ts
- src/frontend/src/api/equipmentEvidence.ts
- src/frontend/src/api/http.ts
- src/frontend/src/api/otdKpiCommitmentEvidence.ts
- src/frontend/src/api/outsourcingEvidence.ts
- src/frontend/src/api/pocEvidence.ts
- src/frontend/src/api/production.ts
- src/frontend/src/api/qualityEvidence.ts
- src/frontend/src/api/riskEvidence.ts
- src/frontend/src/api/scheduling.ts
- src/frontend/src/api/shortageEvidence.ts
- src/frontend/src/components/admin/AdminBoard.vue
- src/frontend/src/components/anomaly/AnomalyBoard.vue
- src/frontend/src/components/auditLog/AuditDecisionReplayPanel.vue
- src/frontend/src/components/auditLog/AuditLogBoard.vue
- src/frontend/src/components/auth/LoginPage.vue
- src/frontend/src/components/barcode/BarcodePrintBoard.vue
- src/frontend/src/components/bom/BomBoard.vue
- src/frontend/src/components/chat/ChatPanel.vue
- src/frontend/src/components/dashboard/DashboardBoard.vue
- src/frontend/src/components/employee/EmployeeBoard.vue
- src/frontend/src/components/employee/SkillMatrixPanel.vue
- src/frontend/src/components/equipment/EquipmentBoard.vue
- src/frontend/src/components/gantt/GanttChart.vue
- src/frontend/src/components/inventory/InventoryBoard.vue
- src/frontend/src/components/knowledge/DocumentUpload.vue
- src/frontend/src/components/knowledge/KnowledgeGovernancePanel.vue
- src/frontend/src/components/layout/MainLayout.css
- src/frontend/src/components/layout/MainLayout.vue
- src/frontend/src/components/monitoring/MonitoringBoard.vue
- src/frontend/src/components/production/ProductionBoard.vue
- src/frontend/src/components/purchase/PurchaseBoard.vue
- src/frontend/src/components/quality/QualityBoard.vue
- src/frontend/src/components/quality/QualityCapaTaskPanel.vue
- src/frontend/src/components/quality/QualityReworkImpactPanel.vue
- src/frontend/src/components/report/ReportBoard.vue
- src/frontend/src/components/risk/RiskActionQueuePanel.vue
- src/frontend/src/components/routing/RoutingBoard.vue
- src/frontend/src/components/scanner/ScannerBoard.vue
- src/frontend/src/components/schedule/ParetoCompare.vue
- src/frontend/src/components/schedule/ScheduleAgentWorkbenchPanel.vue
- src/frontend/src/components/schedule/ScheduleEventQueuePanel.vue
- src/frontend/src/env.d.ts
- src/frontend/src/router/index.ts
- src/frontend/src/stores/auth.ts
- src/frontend/src/stores/notifications.ts
- src/frontend/src/types/production.ts
- src/frontend/src/utils/agent-config-approval-sync.ts
- src/frontend/src/utils/anomaly-dispatch-sync.ts
- src/frontend/src/utils/assistant-action-audit.ts
- src/frontend/src/utils/assistant-action-package-sync.ts
- src/frontend/src/utils/assistant-anomaly-card-sync.ts
- src/frontend/src/utils/assistant-engineering-constraint-package-sync.ts
- src/frontend/src/utils/barcode-scan-evidence-sync.ts
- src/frontend/src/utils/customer-order-import-sync.ts
- src/frontend/src/utils/engineering-change-sync.ts
- src/frontend/src/utils/equipment-risk-sync.ts
- src/frontend/src/utils/knowledge-governance-sync.ts
- src/frontend/src/utils/local-user.ts
- src/frontend/src/utils/monitoring-situation-escalation-sync.ts
- src/frontend/src/utils/offline-demo-mode.ts
- src/frontend/src/utils/otd-evidence-chain-sync.ts
- src/frontend/src/utils/otd-kpi-commitment-sync.ts
- src/frontend/src/utils/outsourcing-commitment-sync.ts
- src/frontend/src/utils/poc-hypercare-sync.ts
- src/frontend/src/utils/poc-pilot-run-sync.ts
- src/frontend/src/utils/poc-review-signoff-sync.ts
- src/frontend/src/utils/poc-rollout-package-sync.ts
- src/frontend/src/utils/production-anomaly-sync.ts
- src/frontend/src/utils/quality-capa-sync.ts
- src/frontend/src/utils/quality-knowledge-sample-sync.ts
- src/frontend/src/utils/quality-mrb-disposition-sync.ts
- src/frontend/src/utils/quality-rework-sync.ts
- src/frontend/src/utils/risk-action-sync.ts
- src/frontend/src/utils/risk-sla-review-sync.ts
- src/frontend/src/utils/schedule-feedback-sync.ts
- src/frontend/src/utils/shortage-risk-sync.ts
- src/frontend/tests/e2e/admin.spec.ts
- src/frontend/tests/e2e/anomaly.spec.ts
- src/frontend/tests/e2e/audit.spec.ts
- src/frontend/tests/e2e/chat.spec.ts
- src/frontend/tests/e2e/dashboard.spec.ts
- src/frontend/tests/e2e/employee.spec.ts
- src/frontend/tests/e2e/engineering-data.spec.ts
- src/frontend/tests/e2e/knowledge.spec.ts
- src/frontend/tests/e2e/modules.spec.ts
- src/frontend/tests/e2e/production.spec.ts
- src/frontend/tests/e2e/purchase.spec.ts
- src/frontend/tests/e2e/quality.spec.ts
- src/frontend/tests/e2e/report.spec.ts
- src/frontend/tests/unit/admin-board.test.ts
- src/frontend/tests/unit/agent-config-approval-sync.test.ts
- src/frontend/tests/unit/anomaly-board.test.ts
- src/frontend/tests/unit/anomaly-dispatch-sync.test.ts
- src/frontend/tests/unit/assistant-action-audit.test.ts
- src/frontend/tests/unit/assistant-action-package-sync.test.ts
- src/frontend/tests/unit/assistant-anomaly-card-sync.test.ts
- src/frontend/tests/unit/assistant-engineering-constraint-package-sync.test.ts
- src/frontend/tests/unit/audit-decision-replay-panel.test.ts
- src/frontend/tests/unit/audit-log-board.test.ts
- src/frontend/tests/unit/auth.store.test.ts
- src/frontend/tests/unit/barcode-print-board.test.ts
- src/frontend/tests/unit/barcode-scan-evidence-sync.test.ts
- src/frontend/tests/unit/bom-board.test.ts
- src/frontend/tests/unit/chat-panel.test.ts
- src/frontend/tests/unit/customer-order-import-sync.test.ts
- src/frontend/tests/unit/dashboard-board.test.ts
- src/frontend/tests/unit/document-upload.test.ts
- src/frontend/tests/unit/employee-board.test.ts
- src/frontend/tests/unit/engineering-change-sync.test.ts
- src/frontend/tests/unit/engineering-constraint-panel.test.ts
- src/frontend/tests/unit/equipment-board.test.ts
- src/frontend/tests/unit/equipment-risk-sync.test.ts
- src/frontend/tests/unit/feedback-form.test.ts
- src/frontend/tests/unit/gantt-chart.test.ts
- src/frontend/tests/unit/gantt-toolbar.test.ts
- src/frontend/tests/unit/http-refresh.test.ts
- src/frontend/tests/unit/inventory-board.test.ts
- src/frontend/tests/unit/kitting-closure-panel.test.ts
- src/frontend/tests/unit/knowledge-citations.test.ts
- src/frontend/tests/unit/knowledge-governance-panel.test.ts
- src/frontend/tests/unit/knowledge-governance-sync.test.ts
- src/frontend/tests/unit/labor-assignment-sync.test.ts
- src/frontend/tests/unit/local-user.test.ts
- src/frontend/tests/unit/login-page.test.ts
- src/frontend/tests/unit/main-layout.test.ts
- src/frontend/tests/unit/monitoring-board.test.ts
- src/frontend/tests/unit/monitoring-situation-escalation-sync.test.ts
- src/frontend/tests/unit/notifications.store.test.ts
- src/frontend/tests/unit/offline-demo-mode.test.ts
- src/frontend/tests/unit/order-detail-panel.test.ts
- src/frontend/tests/unit/otd-kpi-commitment-sync.test.ts
- src/frontend/tests/unit/outsourcing-commitment-sync.test.ts
- src/frontend/tests/unit/pareto-compare.test.ts
- src/frontend/tests/unit/poc-evidence-governance.test.ts
- src/frontend/tests/unit/poc-hypercare-sync.test.ts
- src/frontend/tests/unit/poc-pilot-run-sync.test.ts
- src/frontend/tests/unit/poc-review-signoff-sync.test.ts
- src/frontend/tests/unit/poc-rollout-package-sync.test.ts
- src/frontend/tests/unit/production-anomaly-sync.test.ts
- src/frontend/tests/unit/production-api.test.ts
- src/frontend/tests/unit/production-board.test.ts
- src/frontend/tests/unit/production-execution-trace-panel.test.ts
- src/frontend/tests/unit/purchase-board.test.ts
- src/frontend/tests/unit/quality-board.test.ts
- src/frontend/tests/unit/quality-capa-sync.test.ts
- src/frontend/tests/unit/quality-capa-task-panel.test.ts
- src/frontend/tests/unit/quality-knowledge-sample-sync.test.ts
- src/frontend/tests/unit/quality-mrb-disposition-panel.test.ts
- src/frontend/tests/unit/quality-mrb-disposition-sync.test.ts
- src/frontend/tests/unit/quality-rework-impact-panel.test.ts
- src/frontend/tests/unit/quality-rework-sync.test.ts
- src/frontend/tests/unit/report-board.test.ts
- src/frontend/tests/unit/risk-action-queue-panel.test.ts
- src/frontend/tests/unit/risk-action-sync.test.ts
- src/frontend/tests/unit/risk-sla-review-sync.test.ts
- src/frontend/tests/unit/router-auth.test.ts
- src/frontend/tests/unit/routing-board.test.ts
- src/frontend/tests/unit/scanner-board.test.ts
- src/frontend/tests/unit/schedule-agent-workbench-panel.test.ts
- src/frontend/tests/unit/schedule-board.test.ts
- src/frontend/tests/unit/schedule-metrics.test.ts
- src/frontend/tests/unit/schedule-recovery-handoff-panel.test.ts
- src/frontend/tests/unit/shortage-risk-sync.test.ts
- src/frontend/tests/unit/skill-matrix-panel.test.ts
- src/frontend/tests/unit/start-qualification-panel.test.ts
- src/frontend/tests/unit/use-export.test.ts
- src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs
- src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj
- src/tests/MES.Tests.Evaluation/EvalScriptTests.cs
- src/tests/MES.Tests.Integration/Controllers/ProductionControllerTests.cs
- src/tests/MES.Tests.Integration/Controllers/ReportControllerTests.cs
- src/tests/MES.Tests.Integration/Controllers/SchedulingControllerTests.cs
- src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj
- src/tests/MES.Tests.Integration/Repositories/OperationTransactionRepositoryTests.cs
- src/tests/MES.Tests.Integration/Security/CorsPolicyTests.cs
- src/tests/MES.Tests.Integration/Security/EndpointAuthorizationTests.cs
- src/tests/MES.Tests.Integration/TestDataSeedFilter.cs
- src/tests/MES.Tests.Unit/Application/OperationServiceTests.cs
- src/tests/MES.Tests.Unit/Application/SchedulingAppServiceTests.cs
- src/tests/MES.Tests.Unit/Domain/EquipmentTests.cs
- src/tests/MES.Tests.Unit/Domain/MaterialTests.cs
- src/tests/MES.Tests.Unit/Domain/OperationExecutionStateMachineTests.cs
- src/tests/MES.Tests.Unit/Domain/SystemUserTests.cs
- src/tests/MES.Tests.Unit/Domain/WorkOrderTests.cs
- src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj
- src/tests/MES.Tests.Unit/Services/DatabaseStartupValidatorTests.cs

## Summary

- EXCLUDE_THEME: 10
- KEEP_CANDIDATE: 7
- MIXED_REQUIRES_MANUAL_SPLIT: 6
- NEUTRAL_REVIEW: 41

## Hunk Classifications

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/scripts/e2e.mjs

- Header: @@ -5,12 +5,21 @@ import { runCommand } from '@nuxt/cli'
- IncludedHits: 人员证据启动读取失败后可重试
- ExcludedHits: real-dhtmlx-rush-drag-writeback: 真实 dhtmlx

### NEUTRAL_REVIEW - src/frontend/src/api/executionEvidence.ts

- Header: @@ -1,4 +1,4 @@
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/api/executionEvidence.ts

- Header: @@ -39,11 +39,15 @@ export async function upsertLaborQualificationBlock(item: LaborQualificationBloc
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/src/api/executionEvidence.ts

- Header: @@ -55,7 +59,8 @@ export async function upsertBarcodeScanEvidence(item: BarcodeScanEvidenceRecord)
- IncludedHits: none
- ExcludedHits: none

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

### KEEP_CANDIDATE - src/frontend/src/components/schedule/ScheduleBoard.vue

- Header: @@ -254,7 +285,9 @@ import { readPocPilotRunRecordBackendFirst } from '../../utils/poc-pilot-run-syn
- IncludedHits: readLaborReassignmentsBackendFirst; readLaborQualificationBlocksBackendFirst
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
- IncludedHits: loadStartupLaborEvidence; retryStartupLaborEvidence; currentLaborReassignment; currentActiveLaborQualificationBlock; readLaborReassignmentsBackendFirst; readLaborQualificationBlocksBackendFirst
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
- IncludedHits: currentLaborReassignment; currentActiveLaborQualificationBlock; readLaborReassignmentsBackendFirst; readLaborQualificationBlocksBackendFirst; 人员资质证据刷新失败
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

- Header: @@ -1,5 +1,9 @@
- IncludedHits: LABOR_EVIDENCE_RETRY_TITLE; LEGACY_PERSONNEL_EVIDENCE_TITLES; 人员证据启动读取失败后可重试; 人员替班证据释放排产人员约束
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -14,14 +18,23 @@ const laborEvidenceRetryReads = {
- IncludedHits: LABOR_EVIDENCE_RETRY_TITLE; LEGACY_PERSONNEL_EVIDENCE_TITLES
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR; real-dhtmlx-rush-drag-writeback: 真实 dhtmlx

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -31,9 +44,9 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: LABOR_EVIDENCE_RETRY_TITLE; mockLaborEvidenceRetryApis
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -85,8 +98,11 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -100,8 +116,11 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -136,7 +155,7 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -176,7 +195,7 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -231,6 +250,31 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -281,41 +325,2312 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: multi-objective-feedback-readback: 多目标对比; multi-objective-feedback-readback: adoption-feedback/latest; assistant-engineering-fail-loud: Assistant 恢复交接

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -347,6 +2662,14 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -358,6 +2681,12 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -366,20 +2695,19 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -389,17 +2717,15 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -484,6 +2810,71 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -657,6 +3048,46 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -665,18 +3096,37 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -686,7 +3136,21 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -813,6 +3277,236 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR; real-dhtmlx-rush-drag-writeback: 真实 dhtmlx; real-dhtmlx-rush-drag-writeback: dragRushTask; real-dhtmlx-rush-drag-writeback: createDhtmlxSchedulePlan; real-dhtmlx-rush-drag-writeback: withRushWindow

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -933,6 +3627,157 @@ async function mockAgentApi(page: import('@playwright/test').Page, options: { ad
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: dragRushTask; real-dhtmlx-rush-drag-writeback: createDhtmlxSchedulePlan

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -1148,3 +3993,56 @@ async function mockLaborEvidenceRetryApis(page: import('@playwright/test').Page)
- IncludedHits: mockLaborEvidenceRetryApis
- ExcludedHits: real-dhtmlx-rush-drag-writeback: 真实 dhtmlx; real-dhtmlx-rush-drag-writeback: createDhtmlxSchedulePlan; real-dhtmlx-rush-drag-writeback: withRushWindow

## Guidance

- Stage KEEP_CANDIDATE hunks only after human review.
- Do not stage EXCLUDE_THEME hunks for this first labor retry slice.
- Split MIXED_REQUIRES_MANUAL_SPLIT hunks manually before staging.
- Treat NEUTRAL_REVIEW hunks as dependencies; include only when needed by a reviewed keep hunk.
