# 2026-06-15 skill matrix review release coverage plan

## Success Criteria

- Pick a component by coverage leverage and user criticality.
- Add a test that encodes why the behavior matters, not just that text renders.
- Avoid production-code changes unless a real bug is found.
- Verify with focused and full frontend unit coverage runs.

## Execution

1. Read the current coverage summary.
2. Select `SkillMatrixPanel.vue` because it had the lowest component line coverage and sits on labor qualification/reassignment.
3. Read the component and existing tests.
4. Add the supervisor-review release path test.
5. Run targeted and full coverage verification.

## Stop Condition

Stop after one high-leverage slice and documented verification. Do not continue into lower-yield micro-slices in the same component without a new reason.
