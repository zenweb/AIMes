# 2026-06-22 Package Boundary Index - Labor Then Agent

## Changed

- Added a package boundary index for the current dirty worktree.
- Recorded the required order: staged labor retry package first, Agent E2E current-state evidence second.

## Validation

- `git diff --cached --check`: PASS

## Reason

`src/frontend/tests/e2e/scheduling.spec.ts` contains staged labor retry hunks and unstaged Agent E2E/current-worktree hunks. Package boundaries must be preserved by hunk review.
