# Hosted CI container Nuxt output path

## Change

- Updated `Dockerfile` to copy Nuxt 3 static output from `/frontend/.output/public` into `/app/wwwroot/scheduling`.
- Updated `MES.Api.csproj` frontend static asset copy targets to use `../../frontend/.output/public`.

## Why

Hosted CI run `27086453137` passed backend, frontend, and security jobs, then failed in the container job because the Docker final stage copied `/frontend/dist`, which Nuxt 3 no longer produces for this app's `npm run build`.

## Verification

- `dotnet format src/backend/AIMes.slnx --verify-no-changes --no-restore`: passed.
- `dotnet build src/backend/MES.Api/MES.Api.csproj --no-restore --configuration Release`: passed.
- `docker build --pull=false -t aimes:ci .`: not run to completion locally because Docker Desktop Linux engine pipe `dockerDesktopLinuxEngine` was unavailable.

