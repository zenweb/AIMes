# Gray evidence request repo-local wording

## Summary

Aligned the human-facing gray evidence request with the current strict script behavior.

## Change

- `_docs/_reports/gray-observation-monitoring-evidence-request-20260705.md` now says external-only ticket IDs, dashboard URLs, or prose are insufficient.
- The request now requires repo-local text evidence under `_docs/` or `output/`.
- `_docs/_reports/release-human-action-packet-20260611.md` now uses the same repo-local wording for `IncidentQueryEvidence`.
- Architecture guards now pin this wording so the packet cannot drift back to external-only evidence.

## Boundary

This is documentation alignment only. It does not provide real production monitoring evidence.
