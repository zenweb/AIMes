# 2026-06-21 Plan - EF Tool Version Alignment

## Goal

Remove the non-blocking EF tools/runtime version skew warning found during staging rehearsal.

## Steps

1. Inspect local tool manifest and EF Core package versions.
2. Align `dotnet-ef` with `Microsoft.EntityFrameworkCore`.
3. Add architecture guard to prevent future drift.
4. Verify tool restore, EF tool version, guard, and migration command.

## Done

- `dotnet-ef` now matches EF Core `10.0.9`.
- Guard added and passed.
- EF database update command no longer emits the version skew warning.

## Next

- Continue release-candidate slicing for the dirty worktree.
