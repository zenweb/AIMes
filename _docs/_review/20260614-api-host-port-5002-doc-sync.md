# API host port 5002 doc sync review

## Scope

- Files reviewed: `README.md`, `_docs/quickstart.md`, `_docs/SOP.md`, `_docs/troubleshooting.md`, `docker-compose.yml`.
- This slice only aligns current operator-facing documentation with the existing Docker Compose host mapping.

## Findings

- No code behavior change was required.
- The container still listens on `ASPNETCORE_URLS=http://+:5000`; this is intentional because only the host published port needs to move away from `5000`.
- README previously still exposed `localhost:5000` for Docker Compose access and `VITE_API_TARGET`; that was aligned to `localhost:5002`.
- Historical reports and changelogs that captured previous `localhost:5000` evidence were not rewritten.

## Verification

- Current runtime docs in scope no longer reference host `localhost:5000`.
- Docker Compose config resolves API host mapping to `5002:5000`.
