# 2026-06-15 Plan: Chat restricted action denial lock

## Objective

Harden the existing AI assistant action workflow so denied restricted actions cannot duplicate audit evidence after denial is recorded.

## Scope

- In scope: `ChatPanel.vue` restricted action denial behavior and unit coverage.
- Out of scope: backend audit de-duplication, permission model changes, Docker/staging release evidence.

## Execution

1. Inspect ChatPanel action execution flow and existing restricted-action tests.
2. Add a failing test for repeated clicks after denial.
3. Lock the action only after denial audit recording succeeds.
4. Run target tests and full frontend coverage.
5. Record changelog, review, todo, issue, and plan evidence.

## Success Criteria

- Denied restricted action button becomes disabled after denial audit succeeds.
- Re-clicking does not write duplicate denial evidence.
- Target ChatPanel tests pass.
- Full frontend coverage passes.

## Result

- Target suite passed 65/65.
- Full frontend coverage passed 111 files / 967 tests.
