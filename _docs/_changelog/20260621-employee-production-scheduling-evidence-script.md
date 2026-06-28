# 2026-06-21 Employee Production Scheduling Evidence Script

## Change
- Added `scripts/run-employee-production-scheduling-evidence.ps1`.
- Added architecture coverage requiring the script to stay bounded and to opt out of frontend static copy.
- Generated current evidence report at `_docs/_reports/employee-production-scheduling-evidence-20260621-current.md`.

## Evidence
- RED: `dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --filter "FullyQualifiedName~BackendTestEntrypoints_ShouldSkipFrontendStaticCopy"` failed because the script was missing.
- GREEN: same architecture test passed 1/1 after adding the script.
- Script run:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-employee-production-scheduling-evidence.ps1 -ReportPath _docs/_reports/employee-production-scheduling-evidence-20260621-current.md`
  - Result: PASS
  - All captured commands exited 0.

