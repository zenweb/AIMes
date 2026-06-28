# 2026-06-15 Staging Rehearsal Docker Engine Timeout

## Changed

- Added `-DockerEngineTimeoutSeconds` to `scripts/run-staging-rehearsal.ps1`.
- The staging rehearsal now fails loud when `docker info` hangs instead of blocking indefinitely.
- Ran a controlled staging rehearsal against non-5000 API URL `http://localhost:5003`.

## Validation

- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260615-docker-engine-timeout.md -ApiBaseUrl http://localhost:5003 -DockerEngineTimeoutSeconds 15 -DockerPullTimeoutSeconds 15 -ImagePullMode Never` => FAIL with report written.
- Report: `_docs/_reports/staging-rehearsal-20260615-docker-engine-timeout.md`.
- Docker CLI and Compose reported versions, but Docker engine timed out after 15 seconds.
- Current runtime/operator scan for host `localhost:5000` returned no matches.

## Notes

- No live browser/staging PASS is claimed from this run.
- The next successful live staging attempt still requires Docker Desktop Linux engine to respond to `docker info`.
