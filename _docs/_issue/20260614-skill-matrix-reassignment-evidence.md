# 2026-06-14 Issue - Skill Matrix Reassignment Evidence

## Issue
- `SkillMatrixPanel.vue` had weak direct unit evidence for the positive reassignment path.
- Existing tests covered no-candidate blocking and sync failure, but did not assert that a valid replacement candidate writes auditable reassignment evidence.

## Resolution
- Added a qualified replacement fixture with matching heat-treatment skill, valid certificate, overtime availability, and schedule-source evidence.
- Added assertions for candidate ranking, reassignment write payload, audit id, trace id, reviewer, and UI note.

## Status
- Resolved for this slice.
- No production code change required.
