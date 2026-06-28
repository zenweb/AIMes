# Plan: MainLayout module guidance links

Date: 2026-06-19
Status: Completed

## Success criteria

- The active scheduling module has visible Simplified Chinese and English guidance.
- The shell exposes contextual links to the active module, report evidence, audit replay, and help.
- The help link resolves to a real in-page `#module-help` section.
- The regression test fails before implementation and passes after it.
- MainLayout tests, full frontend unit coverage, lint, build, and production-preview browser evidence pass.

## Execution

1. Added a RED test in `main-layout.test.ts` for module guidance copy, related links, and help.
2. Confirmed RED failed because `.module-guidance` did not exist.
3. Added the smallest shell-level guidance implementation in `MainLayout.vue`.
4. Added responsive styles in `MainLayout.css`.
5. Ran targeted, component, full coverage, lint, build, and browser evidence verification.

## Result

All success criteria passed. This slice strengthens an existing user-critical shell path and keeps the overall CC remediation goal active.
