# 2026-06-23 Todo: Equipment E2E auth entry closure next actions

- Keep Equipment focused-green evidence: `npm run test:e2e -- tests/e2e/equipment.spec.ts` passed 22 Chromium tests.
- Do not rework Equipment unless a new full-suite run shows a regression.
- Re-run `git diff --check` for the Equipment E2E and 20260623 docs before claiming the slice is clean.
- Continue full frontend E2E from the next artifact/red cluster after Equipment.
- Full frontend E2E remains unproven because the latest full run timed out after 20 minutes.
