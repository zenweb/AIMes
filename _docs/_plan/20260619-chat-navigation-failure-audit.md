# Plan: Chat navigation failure audit

Date: 2026-06-19
Status: Completed

## Success criteria

- Plain assistant navigation failure shows an assertive alert.
- Plain assistant navigation failure does not show the generic success status.
- Plain assistant navigation failure writes failed audit evidence.
- Failed audit writing is surfaced as a second assertive alert.
- Targeted RED/GREEN, ChatPanel suite, full frontend coverage, lint, and build pass.

## Execution

1. Extended the existing navigation failure test to require no success status and failed audit evidence.
2. Confirmed RED failed because a status message still rendered after route failure.
3. Updated `ChatPanel.vue` to return from the failed plain navigation branch after alerting and recording failed audit.
4. Added coverage for failed-audit write on the navigation failure path.
5. Ran targeted, component, full coverage, lint, and build verification.

## Result

All success criteria passed. The slice improves existing assistant correctness and audit truthfulness without broadening scope.
