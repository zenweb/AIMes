# 2026-06-14 Schedule Feedback Backend Report Dashboard Evidence

## Change
- Extended backend report dashboard DTO with latest auditable schedule adoption feedback.
- `/api/v1/report/dashboard` now exposes feedback decision, reason category label, required reason detail, objective label, trace ID, source, and Agent decision ID.
- Backend Excel export now includes a `排产采纳反馈` worksheet with the same decision, reason, objective, trace, and Agent decision evidence.
- Backend PDF export now renders a `排产采纳反馈` section with the same decision, reason, objective, trace, and Agent decision evidence.
- Blank reason-detail feedback is not surfaced in the dashboard snapshot, preserving the existing auditability rule that adoption feedback must have an explicit reason.

## Evidence
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~ReportControllerTests.GetDashboard_ShouldExposeLatestAuditableScheduleFeedbackEvidence"`
  - RED first: failed because `ScheduleFeedback` was null.
  - GREEN after implementation: 1/1 passed.
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~ReportControllerTests.ExportExcel_ShouldIncludeAuditableScheduleFeedbackEvidence"`
  - RED first: failed because there was no worksheet named `排产采纳反馈`.
  - GREEN after implementation: 1/1 passed.
- `dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~ArchitectureRuleTests.BackendReportPdf_ShouldRenderScheduleFeedbackEvidence"`
  - RED first: failed because the PDF renderer had no `排产采纳反馈` evidence section.
  - GREEN after implementation: 1/1 passed.
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~ReportControllerTests"`
  - 9/9 passed.

## Notes
- This continues the existing schedule feedback boutique-hardening path instead of broadening feature scope.
- Gray observation / 15-day monitoring remains skipped by owner direction and is not a blocker for this work item.
