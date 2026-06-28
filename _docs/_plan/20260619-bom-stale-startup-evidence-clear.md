# Plan: BOM stale startup evidence clear

Date: 2026-06-19

## Success criteria

- A startup engineering evidence failure is visible when it occurs.
- After selecting a BOM and successfully refreshing engineering evidence, the stale startup alert disappears.
- Unrelated BOM list, detail, explosion, and current operation errors are not cleared by the recovery path.
- Targeted test, BOM component suite, full frontend unit coverage, and lint pass.

## Execution

1. Add a RED test for startup evidence failure followed by successful selection refresh.
2. Confirm the RED test fails because the old alert remains visible.
3. Implement a scoped helper for clearing startup engineering evidence errors.
4. Run targeted, component, full coverage, and lint verification.
5. Record changelog, review, todo, issue, and plan artifacts.

## Result

All success criteria passed. This is a boutique hardening slice for an existing BOM workflow, not a new feature expansion.
