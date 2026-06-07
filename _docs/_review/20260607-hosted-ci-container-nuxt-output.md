# Review: Hosted CI container Nuxt output path

## Scope

- Files reviewed: `Dockerfile`, `src/backend/MES.Api/MES.Api.csproj`.
- Change type: container/static asset packaging fix.

## Findings

- The failing Hosted CI log showed Nuxt generated `.output/public` and Docker failed only when copying `/frontend/dist`.
- The Dockerfile now packages the actual Nuxt 3 generated public assets into the ASP.NET static root.
- The project file copy targets were aligned with the same output directory so local publish behavior does not diverge from the container.

## Residual risk

Hosted CI container build must pass before the hosted CI gate can close. Local Docker verification is blocked by the missing local Docker engine.

