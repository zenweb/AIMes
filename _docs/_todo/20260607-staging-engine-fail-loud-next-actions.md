# Next actions: Staging engine fail-loud

1. Start or repair Docker Desktop Linux engine so `docker info` succeeds under the `desktop-linux` context.
2. Re-run `scripts/run-staging-rehearsal.ps1` with `-ImagePullMode Missing`.
3. If image pull fails after engine is available, configure Docker Desktop proxy or registry mirror, or pre-pull `postgres:16-alpine`, `redis:7-alpine`, `rabbitmq:4-management-alpine`, and `qdrant/qdrant:latest`.
4. Re-run release gate audit after staging produces `Result: PASS`.

