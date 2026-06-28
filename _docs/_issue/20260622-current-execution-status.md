# 2026-06-22 Issue: Dirty worktree execution state was spread across multiple tracks

Issue:
- Current work spans at least three tracks:
  - staged `schedule-labor-evidence-retry`
  - Sprint 0 baseline indexing
  - next Agent E2E combo validation
- Without one execution-status report, it is easy to mix staged candidate files with unrelated docs or `tmp/*.patch` artifacts.

Risk:
- Broad staging could pollute the staged labor retry candidate.
- Focused validation could be mistaken for full baseline or release completion evidence.
- Agent E2E patch could be applied blindly into a dirty E2E file.

Resolution:
- Added `_docs/_reports/current-execution-status-20260622.md`.
- Added explicit "do" and "do not" boundaries for each track.
- Kept the current staged package unchanged.
