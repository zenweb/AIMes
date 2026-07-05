# Gray aggregate incident evidence content gate

## Summary

Hardened the aggregate gray evidence checks in:

- `scripts/run-gray-observation.ps1`
- `scripts/run-release-gate-audit.ps1`

Both scripts now require a reviewed gray evidence packet to include `IncidentQueryEvidence`, and the referenced repo-local text evidence must contain the gray release id, observation window dates, monitoring context, `P0=0`, and `P1=0`.

## Why

`scripts/run-gray-incident-review.ps1` already validates the raw incident evidence, but the aggregate scripts still accepted any hand-written packet with the expected summary fields. This change prevents a free-form reviewed packet from bypassing the raw incident transcript/content check.

## Boundary

This does not claim strict v1.0.0 PASS. It only strengthens the gate that will evaluate future real production monitoring evidence.
