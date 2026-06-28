# 2026-06-15 Backend Test Baseline Issues

## Closed / Not Product Issues

- Unit-test first run hit a `MES.Api.dll` file lock during parallel execution.
  - Impact: noisy red baseline if multiple projects contend for the same build output.
  - Resolution for this baseline: reran the unit project sequentially with `-m:1`; 444/444 passed.
  - Remaining risk: future all-project parallel runs may still produce infrastructure noise until output isolation or run sequencing is standardized.

## Still Open

- Container smoke was not part of this baseline slice. The API port configuration is verified by `docker compose config`, but runtime health endpoints still need a Docker-backed smoke when the environment is actively started.

