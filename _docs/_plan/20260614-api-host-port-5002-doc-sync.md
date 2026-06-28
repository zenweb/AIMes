# API host port 5002 doc sync plan

## Success criteria

- Docker-backed AIMes API uses host `localhost:5002` in current operator-facing docs.
- Docker Compose still maps host `5002` to container `5000`.
- No current runtime instruction in the edited docs points users to host `localhost:5000`.
- README Docker Compose entry URLs and `VITE_API_TARGET` guidance also use host `localhost:5002`.

## Steps

1. Inspect current Compose and script defaults.
2. Update current Quickstart, SOP, Troubleshooting, and README docs.
3. Verify no scoped current runtime references to `localhost:5000` remain.
4. Verify Docker Compose resolved config publishes API as `5002:5000`.

## Result

Completed.
