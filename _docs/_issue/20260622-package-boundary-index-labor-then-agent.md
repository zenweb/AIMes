# Issue - Package Boundary Risk

## Risk

The current worktree contains multiple verified slices touching `src/frontend/tests/e2e/scheduling.spec.ts`.

If stale boundary text is trusted, the current index can be mislabeled. The current staged package is Agent E2E, not the older labor retry package.

## Resolution

Use `_docs/_review/20260622-package-boundary-index-labor-then-agent.md` as the staging guide.

## Status

Open until the current Agent E2E staged package is committed, reset, or intentionally replaced by a regenerated labor package.
