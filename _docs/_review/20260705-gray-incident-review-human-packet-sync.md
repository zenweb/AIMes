# Gray incident review human packet sync

## Summary

Updated the human execution path so strict gray PASS evidence routes through `scripts/run-gray-incident-review.ps1` before `scripts/run-gray-observation.ps1`.

## Files

- `_docs/_reports/gray-observation-monitoring-evidence-request-20260705.md`
- `_docs/_reports/release-human-action-packet-20260611.md`
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`

## Validation

- Architecture guard requires the human action packet to include `scripts/run-gray-incident-review.ps1`.
- Architecture guard requires the current gray evidence request to include reviewer, reviewed timestamp, monitoring source, incident query evidence, and zero P0/P1 parameters.

## Boundary

This only updates the executable human path. It does not create or claim real production monitoring evidence.
