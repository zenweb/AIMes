# Plan: Schedule workbench guidance links

Date: 2026-06-19

## Success criteria

- ScheduleBoard shows bilingual guidance before optimization, adoption, and drag writeback.
- Guidance links connect operators to audit replay, delivery reporting, and local help.
- A help anchor explains the expected pre-action review in both English and Simplified Chinese.
- Targeted, component, full unit coverage, and lint checks pass.

## Execution

1. Add a failing ScheduleBoard unit test for guidance copy, links, and help anchor.
2. Add the smallest ScheduleBoard template/style change that satisfies the test.
3. Run targeted and full component tests.
4. Run full frontend coverage and lint.
5. Record changelog, review, todo, issue, and plan documents.

## Outcome

Completed. The guidance and help affordances are covered by tests; frontend coverage, lint, and production build are green on the current worktree.
