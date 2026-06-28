# Release Candidate Slice Hunk Map

- GeneratedAt: 2026-06-22T00:57:56.8522856+08:00
- ManifestPath: _docs/_reports/release-candidate-slice-20260622-labor-agent-combo.manifest.json
- Candidate: schedule-labor-retry-plus-agent-e2e
- FirstSlice: labor-agent-e2e-routing-combo
- DiffMode: working
- HunkCount: 22

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
- src/frontend/src/api/executionEvidence.ts
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
- src/frontend/src/components/schedule/ScheduleBoard.vue
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

- EXCLUDE_THEME: 4
- KEEP_CANDIDATE: 3
- MIXED_REQUIRES_MANUAL_SPLIT: 5
- NEUTRAL_REVIEW: 10

## Hunk Classifications

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/scripts/e2e.mjs

- Header: @@ -5,12 +5,24 @@ import { runCommand } from '@nuxt/cli'
- IncludedHits: 人员证据启动读取失败后可重试; 调度员 Agent 工作台通过后端 API; 调度员 Agent 工作台后端 403; 调度员 Agent 工作台 API 不可用
- ExcludedHits: real-dhtmlx-rush-drag-writeback: 真实 dhtmlx

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -1,10 +1,19 @@
- IncludedHits: LABOR_EVIDENCE_RETRY_TITLE; LEGACY_PERSONNEL_EVIDENCE_TITLES; AGENT_BACKEND_EVIDENCE_TITLES; 人员证据启动读取失败后可重试; 人员替班证据释放排产人员约束; 人员无有效替班候选时排产保持停工复核事件; 调度员 Agent 工作台通过后端 API; 调度员 Agent 工作台后端 403; 调度员 Agent 工作台 API 不可用
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -14,14 +23,27 @@ const laborEvidenceRetryReads = {
- IncludedHits: LABOR_EVIDENCE_RETRY_TITLE; LEGACY_PERSONNEL_EVIDENCE_TITLES; AGENT_BACKEND_EVIDENCE_TITLES; usesLiveBackendMock; mockSchedulingPlanApis
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR; real-dhtmlx-rush-drag-writeback: 真实 dhtmlx

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -31,9 +53,9 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: LABOR_EVIDENCE_RETRY_TITLE; usesLiveBackendMock; mockLaborEvidenceRetryApis
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -85,8 +107,11 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: 调度员 Agent 工作台通过后端 API
- ExcludedHits: none

### KEEP_CANDIDATE - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -100,8 +125,11 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: 调度员 Agent 工作台后端 403
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -136,7 +164,7 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -176,7 +204,7 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -231,6 +259,31 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -309,13 +362,2284 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: multi-objective-feedback-readback: 多目标对比; multi-objective-feedback-readback: adoption-feedback/latest; assistant-engineering-fail-loud: Assistant 恢复交接

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -347,6 +2671,14 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -358,6 +2690,12 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -366,20 +2704,19 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -389,17 +2726,15 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -484,6 +2819,71 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -657,6 +3057,46 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: none

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -665,18 +3105,37 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -686,7 +3145,21 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR

### EXCLUDE_THEME - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -813,6 +3286,236 @@ test.describe('Scheduling 排产甘特图', () => {
- IncludedHits: none
- ExcludedHits: real-dhtmlx-rush-drag-writeback: RUSH_WRITEBACK_EVIDENCE_DIR; real-dhtmlx-rush-drag-writeback: 真实 dhtmlx; real-dhtmlx-rush-drag-writeback: dragRushTask; real-dhtmlx-rush-drag-writeback: createDhtmlxSchedulePlan; real-dhtmlx-rush-drag-writeback: withRushWindow

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -933,6 +3636,177 @@ async function mockAgentApi(page: import('@playwright/test').Page, options: { ad
- IncludedHits: mockSchedulingPlanApis
- ExcludedHits: real-dhtmlx-rush-drag-writeback: dragRushTask; real-dhtmlx-rush-drag-writeback: createDhtmlxSchedulePlan

### NEUTRAL_REVIEW - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -977,6 +3851,26 @@ async function mockLaborRetrySchedulingPlanApis(page: import('@playwright/test')
- IncludedHits: none
- ExcludedHits: none

### MIXED_REQUIRES_MANUAL_SPLIT - src/frontend/tests/e2e/scheduling.spec.ts

- Header: @@ -1148,3 +4042,56 @@ async function mockLaborEvidenceRetryApis(page: import('@playwright/test').Page)
- IncludedHits: mockLaborEvidenceRetryApis
- ExcludedHits: real-dhtmlx-rush-drag-writeback: 真实 dhtmlx; real-dhtmlx-rush-drag-writeback: createDhtmlxSchedulePlan; real-dhtmlx-rush-drag-writeback: withRushWindow

## Guidance

- Stage KEEP_CANDIDATE hunks only after human review.
- Do not stage EXCLUDE_THEME hunks for this first labor retry slice.
- Split MIXED_REQUIRES_MANUAL_SPLIT hunks manually before staging.
- Treat NEUTRAL_REVIEW hunks as dependencies; include only when needed by a reviewed keep hunk.
