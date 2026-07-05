# 2026-07-05 Gray incident review evidence generator

- Added `scripts/run-gray-incident-review.ps1`.
- Added an architecture guard requiring the generator to validate reviewer, monitoring source, observation timestamps, 14-day window, zero P0/P1 counts, non-placeholder incident evidence, and repo-local evidence references.
- Added review note `_docs/_review/20260705-gray-incident-review-evidence-generator.md`.

Release boundary: strict v1.0.0 remains blocked until real gray monitoring or signed incident-review evidence proves `P0=0` and `P1=0`.
