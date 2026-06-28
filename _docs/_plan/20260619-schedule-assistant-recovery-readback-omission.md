# 2026-06-19 Plan: Schedule Assistant Recovery Readback Omission

## Goal
Bring the existing Schedule Assistant recovery handoff closure path closer to boutique quality by preserving local closed evidence when backend readback omits the just-closed package.

## Scope
- Existing ScheduleBoard Assistant recovery handoff closure only.
- No new workflow, API contract, or backend behavior.
- No broad refactor of ScheduleBoard.

## Steps
1. Add a RED unit test for the backend-success-but-omitted-package branch.
2. Add minimal local retention logic for the closed package.
3. Confirm and fix the later refresh overwrite from `loadRiskTriggeredEvents()`.
4. Run targeted, component, full coverage, lint, build, and browser checks.
5. Record changelog, review, todo, issue, and plan artifacts.

## Stop Condition
- The closed package remains visible after backend readback omits it.
- The UI emits a fail-loud sync note naming the omitted package.
- Verification evidence is captured and documented.
