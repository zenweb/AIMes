# 2026-06-20 Review: Employee live entry offline mode fix

## Findings

- Root cause: ordinary local preview login was allowed to prefer demo credentials because `import.meta.env.DEV` / demo-hint mode was treated as an instruction to skip backend login. That could persist `aimes_offline_demo=true`, causing later employee reads to throw `OfflineDemoApiError`.
- Runtime environment issue: the built Nuxt production server on `4173` returned SPA HTML for `/api/*`, so login failed even after the backend account was restored. A local reverse proxy now keeps the requested 4173 entry usable while forwarding API calls to `5003`.
- Database state issue: the current Docker PostgreSQL `system_users` table did not contain `admin` or `operator1`; it only had staging/attack-chain probe users with unknown external passwords. A local demo admin was upserted for this workstation.

## Verification

- `npm run test:unit -- tests/unit/auth.store.test.ts tests/unit/offline-demo-mode.test.ts tests/unit/employee-board.test.ts`: PASS, 44 tests.
- `npm run build`: PASS.
- `POST http://127.0.0.1:4173/api/v1/auth/login` with `admin / admin123`: PASS.
- Real browser `http://127.0.0.1:4173/scheduling/employee`: no offline-demo skip message and no employee-list load failure.

## Residual Risk

- `scripts/local-proxy-4173.cjs` is a local operator helper, not a production deployment path.
- The top shell still displays a generic `离线` label in the browser evidence; this is separate from `aimes_offline_demo=false` and should be reviewed only if it blocks operator clarity.
