# Gray incident review content gate

## Summary

Hardened `scripts/run-gray-incident-review.ps1` so `IncidentQueryEvidence` cannot pass by citing any existing repo-local file.

## Rule

A PASS incident review now requires repo-local text evidence that contains:

- the `GrayReleaseId`
- the observation start date
- the observation end date
- monitoring or incident-query context
- `P0=0`
- `P1=0`

## Validation

- Architecture guard now requires `Test-IncidentQueryEvidenceContentPass`.
- Negative sample: unrelated repo-local review document is rejected.
- Positive sample: repo-local incident transcript containing gray release id, window dates, monitoring context, `P0=0`, and `P1=0` is accepted.

## Boundary

This still does not create real production evidence. It only prevents unrelated files from being accepted as incident-query proof.
