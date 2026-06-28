# 2026-06-21 Employee Offline Demo Evidence Script

## Change
- Added `scripts/run-employee-offline-demo-evidence.ps1` as the bounded repeatable evidence entrypoint for the Employee offline-demo path.
- Added the architecture guard `FrontendEmployeeOfflineDemoEvidenceEntrypoint_ShouldBeRepeatableAndBounded`.
- Generated `_docs/_reports/frontend-real-browser-employee-offline-demo-20260621-current.md` from the script.

## Why
- The user-visible regression was `员工列表加载失败，当前展示本地示例数据：Offline demo mode skipped backend request: /api/v1/employee`.
- A one-off browser check is not enough for Sprint 0 baseline work; this path needs a small command that reruns both the classifier/unit regression and the real Chromium entry check.

## Evidence
- RED: focused architecture rule failed before the script existed.
- GREEN: `dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter "FullyQualifiedName~FrontendEmployeeOfflineDemoEvidenceEntrypoint_ShouldBeRepeatableAndBounded" --no-restore /p:SkipFrontendBuildCopy=true`
- Script PASS: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts\run-employee-offline-demo-evidence.ps1 -ReportPath _docs\_reports\frontend-real-browser-employee-offline-demo-20260621-current.md`

## Boundary
- This is not the full frontend suite.
- This is not hosted CI or staging evidence.
- It specifically protects Employee offline-demo backend-skip handling.
