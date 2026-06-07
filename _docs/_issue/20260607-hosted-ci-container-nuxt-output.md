# Issue: Hosted CI Docker build copied obsolete frontend output path

## Symptom

GitHub Actions CI run `27086453137` failed in the `container` job:

`COPY --from=frontend-build /frontend/dist ./wwwroot/scheduling` failed because `/frontend/dist` was not found.

## Root cause

The frontend uses Nuxt 3 with `ssr: false`; `npm run build` produces the static public assets under `.output/public`, not `dist`.

## Resolution

Docker and project-file static asset copy paths now use `.output/public`.

## Status

Local .NET build and format verification passed. Hosted CI re-run is pending.

