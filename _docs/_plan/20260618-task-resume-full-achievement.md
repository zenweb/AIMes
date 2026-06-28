# 2026-06-18 Task Resume Full Achievement Plan

## Goal

Resume AIMes V1 CC remediation execution after owner explicitly cancelled `hold_on`.

## Success Criteria

- State is `active`.
- A fresh baseline is run before choosing the next implementation slice.
- Next work is selected by coverage leverage plus existing user-critical path value.
- Strict v1.0.0 wording remains honest while gray observation is deferred.

## Execution Plan

1. Validate `.omx/state/task-hold-on.json` parses and says `active`.
2. Run a fresh frontend unit coverage baseline serially.
3. Inspect low-coverage / user-critical candidates.
4. Select one focused existing-feature hardening slice.
5. Use TDD for production behavior changes.
6. Run targeted and broad regressions.
7. Update changelog, review, plan, todo, and issue.
