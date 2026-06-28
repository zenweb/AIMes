# TODO - Release Candidate Hunk Map Next Actions

- Use `_docs/_reports/release-candidate-slice-hunk-map-20260621-schedule-labor-evidence-retry-working.md` before staging the labor retry candidate.
- Manually split all `MIXED_REQUIRES_MANUAL_SPLIT` hunks.
- Do not stage `EXCLUDE_THEME` hunks into the labor retry candidate.
- Review every `NEUTRAL_REVIEW` hunk as a dependency; include only if required by a keep hunk.
- After staging, rerun both the boundary guard and hunk map in `staged` mode.
