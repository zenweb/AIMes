# 2026-06-21 Release Candidate Hunk Map

- Added `scripts/write-release-candidate-slice-hunk-map.ps1`.
- The script reads the same release-candidate manifest as the boundary guard, parses `git diff` hunks, and classifies each hunk as `KEEP_CANDIDATE`, `EXCLUDE_THEME`, `MIXED_REQUIRES_MANUAL_SPLIT`, or `NEUTRAL_REVIEW`.
- Generated working and staged hunk-map reports for `schedule-labor-evidence-retry`.

## Verification
- PowerShell parser: `syntax-ok`.
- Working report: `_docs/_reports/release-candidate-slice-hunk-map-20260621-schedule-labor-evidence-retry-working.md`.
- Staged report: `_docs/_reports/release-candidate-slice-hunk-map-20260621-schedule-labor-evidence-retry-staged.md`.
- Working summary: 58 hunks total; 7 `KEEP_CANDIDATE`, 11 `EXCLUDE_THEME`, 5 `MIXED_REQUIRES_MANUAL_SPLIT`, 35 `NEUTRAL_REVIEW`.
- Staged summary: 0 hunks because no candidate is currently staged.
