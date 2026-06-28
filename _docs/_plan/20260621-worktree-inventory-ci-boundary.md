# 2026-06-21 Plan - Worktree Inventory CI Boundary

## Goal

Make the current-head CI boundary explicit before attempting a release-candidate push or broader audit claim.

## Steps

1. Run GitHub V1 push readiness for the committed local HEAD.
2. Generate local dirty worktree inventory.
3. Add a guard that requires the inventory script/report and the hosted-CI boundary wording.
4. Update the repo-local CC plan bridge.

## Done

- GitHub V1 push readiness report generated.
- Worktree inventory report generated.
- Plan bridge updated.
- Guard passed.

## Next

- Decide an intentional release-candidate slice from the dirty worktree.
- Stage/push that exact slice, then regenerate hosted CI evidence against the new head SHA.
