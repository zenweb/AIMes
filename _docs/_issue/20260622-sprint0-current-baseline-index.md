# 2026-06-22 Issue: Sprint 0 baseline bridge pointed at stale evidence

Issue:
- `_docs/_plan/20260514-cc-remediation-plan.md` still listed the 20260605 Sprint 0 baseline refresh as the main repo-local baseline evidence.
- The worktree already contains newer 20260620/20260621 baseline evidence for backend unit, backend integration, architecture tests, frontend unit, frontend coverage, focused frontend E2E, hosted CI, and staging.

Impact:
- Future review could mistake the older bridge for the current task 0.0 baseline state.
- It would be harder to distinguish full-suite baseline evidence from focused slice evidence.

Resolution:
- Added a current Sprint 0 baseline index dated 20260622.
- Updated the plan bridge to point to the current evidence layers.
- Explicitly documented that focused E2E packs do not equal a single all-spec frontend E2E green run.

Status:
- Resolved as documentation/evidence indexing.
- No product source change was made.
