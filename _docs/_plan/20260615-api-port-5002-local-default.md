# 2026-06-15 Plan: API port 5002 local default

## Success Criteria

- Local `dotnet run` defaults to host port `5002`.
- Frontend dev/preview proxy defaults to `http://localhost:5002`.
- Current runtime/operator files do not point fresh runs to host `localhost:5000`.

## Steps

1. Update backend launch settings.
2. Update Nuxt proxy default.
3. Update README local development text.
4. Run scoped searches and config validation.
