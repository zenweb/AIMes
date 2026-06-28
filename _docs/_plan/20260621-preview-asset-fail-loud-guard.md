# Plan - Preview Asset Fail-Loud Guard

## Success Criteria
- Preview startup detects missing client chunks before serving local URLs.
- The check is scoped to preview startup and does not alter application behavior.
- Current 4173 employee offline demo remains usable.

## Steps
1. Inspect current Nuxt output structure and client manifest.
2. Add a minimal asset-existence guard to `scripts/preview.mjs`.
3. Extract the guard into `scripts/preview-asset-check.mjs` and cover it with a focused unit test.
4. Verify normal current output reaches server startup.
5. Verify a missing chunk fails loud before listen.
6. Smoke the current 4173 employee offline demo path.

## Status
- Completed.
- 2026-06-21 refresh completed: recursive manifest asset scanning added and verified with unit 3/3, production build, and temporary 4174 preview listen smoke.
