# Gray incident review evidence generator

## Summary

Added `scripts/run-gray-incident-review.ps1` so the elapsed gray window can be closed only with a reviewed monitoring or incident-review PASS packet, not a free-form note.

## Evidence shape

The generated packet includes the fields already required by strict gray observation aggregation:

- `Status: REVIEWED` or `Status: PASS`
- `Reviewer`
- `ReviewedAt`
- `MonitoringSource`
- `ObservationStartedAt`
- `ObservationEndedAt`
- `P0/P1 incident counts: P0=0; P1=0`
- `Result: PASS`

The script rejects placeholders, future timestamps, observation windows shorter than 14 calendar days, non-zero P0/P1 counts, and missing repo-local incident query evidence references.

## Verification

- Parser check: `scripts/run-gray-incident-review.ps1` parsed successfully.
- Negative sample: DRAFT/placeholder evidence is rejected.
- Negative sample: 14-day window not met is rejected.
- Positive sample: REVIEWED packet with zero P0/P1 and a valid repo-local incident query reference is accepted.
- Architecture guard: `GrayIncidentReview_ShouldGenerateStrictReviewedMonitoringEvidencePacket`.

## Boundary

This does not claim strict v1.0.0 release PASS. It only provides the executable path for a real reviewer to generate the missing gray monitoring evidence packet.
