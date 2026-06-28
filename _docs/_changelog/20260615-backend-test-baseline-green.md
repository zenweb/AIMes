# 2026-06-15 Backend Test Baseline Green

## Change

- Recorded the Sprint 0 backend test baseline for the current CC remediation track.
- Confirmed the regular backend quality gates are green:
  - `MES.ArchitectureTests`: 115/115 passed.
  - `MES.Tests.Unit`: 444/444 passed with `-m:1`.
  - `MES.Tests.Integration`: 203/203 passed with `-m:1`.
  - `MES.Tests.Evaluation`: 2/2 passed with `-m:1`.
- The first unit-test attempt without `-m:1` failed on a `MES.Api.dll` file lock, then passed when rerun sequentially. Treat this as a runner contention note, not a product failure.
- `MES.Benchmarks` was not run as a normal baseline gate because benchmark projects measure performance and are not deterministic pass/fail release checks.
- Docker container smoke was not rerun in this slice; `docker compose config` was used for the API port audit and resolves the API listener/mapping to `5002`.

## Evidence

```powershell
dotnet test src\tests\MES.ArchitectureTests\MES.ArchitectureTests.csproj --no-restore --configuration Debug
dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-restore --configuration Debug -m:1
dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-restore --configuration Debug -m:1
dotnet test src\tests\MES.Tests.Evaluation\MES.Tests.Evaluation.csproj --no-restore --configuration Debug -m:1
```

