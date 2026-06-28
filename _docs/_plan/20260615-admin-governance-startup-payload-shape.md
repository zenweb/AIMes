# 2026-06-15 Plan: Admin governance startup payload shape

## Objective

Harden the existing Admin Agent governance entry so malformed array-backed startup evidence is surfaced and isolated.

## Scope

- In scope: AdminBoard startup governance evidence payload validation and unit coverage.
- Out of scope: backend API contract changes, Docker/staging release evidence, unrelated AdminBoard refactors.

## Execution

1. Inspect AdminBoard startup evidence loaders and existing AdminBoard tests.
2. Add a failing test for non-array Agent config approval startup payload.
3. Add a small array-shape guard and route failures through the existing startup alert aggregation.
4. Run target tests and full frontend coverage.
5. Record changelog, review, todo, issue, and plan evidence.

## Success Criteria

- Non-array startup evidence payloads produce a fail-loud alert.
- Agent governance remains usable after the bad payload.
- Target AdminBoard tests pass.
- Full frontend coverage passes.

## Result

- Target suite passed 22/22.
- Full frontend coverage passed 111 files / 966 tests.
- Regression refresh on 2026-06-19 passed 111 files / 1083 tests.
