# 2026-06-21 Plan - Release Candidate Slice Boundary

## Objective

Turn the release-candidate slice split from a written recommendation into an executable guard.

## Success Criteria

- A script reads the slice manifest.
- The script inspects current code diff for first-slice and excluded-theme tokens.
- The script emits a markdown report.
- The script fails loudly while excluded themes are still present.

## Status

- Done: `scripts/test-release-candidate-slice-boundary.ps1` added.
- Done: `-DiffMode working|staged` added.
- Done: report generated at `_docs/_reports/release-candidate-slice-boundary-20260621-schedule-labor-evidence-retry.md`.
- Done: working diff report fails because excluded themes are present.
- Done: staged diff report now fails when no first-slice candidate tokens are staged.
- Done: PowerShell parser syntax check reports `syntax-ok`.
- Done: working report includes token locations for split guidance.

## Next

- Split labor evidence retry/offline fallback into a cleaner diff.
- Rerun working and staged guards after the split before push.
