# Review: HTTP HTML fallback detection

## Scope

- `src/frontend/src/api/http.ts`
- `src/frontend/tests/unit/http-refresh.test.ts`

## Findings

- No blocking finding.
- The change is scoped to the existing HTML fallback guard and does not alter refresh-token, authorization, offline-demo, or toast error handling.
- The added test encodes the actual production risk: some fallback HTML responses start with `<html>` and may omit `text/html`.

## Evidence

- Target RED observed before implementation: the new test resolved with `<html><body>SPA fallback</body></html>` instead of rejecting.
- Target GREEN: `http-refresh.test.ts` passed 6/6.
- API-adjacent regression passed 12/12 across `http-refresh`, `knowledge-api`, `report-api`, and `audit-log-api`.

## Residual risk

- This is a frontend HTTP guard slice only. It does not change server routing or release gray observation status.
