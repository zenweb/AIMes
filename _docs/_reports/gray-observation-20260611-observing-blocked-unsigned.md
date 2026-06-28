# Gray observation

- GeneratedAt: 2026-06-11T10:22:50.4712917+08:00
- Status: OBSERVING
- GrayReleaseId: gray-dry-run-blocked
- GrayStartedAt: 2026-06-11T10:15:00+08:00
- ObservationStartedAt: 2026-06-11T10:15:00+08:00
- ObservationEndedAt: 
- Required observation window: 14 calendar days
- P0/P1 incident counts: P0=-1; P1=-1
- Evidence: Dry-run blocked because security signoff is still unsigned.
- SecuritySignoffPath: _docs/_review/20260607-security-signoff.md

## Gate

- First gray release: required before v1.0.0.
- Observation window: 2 weeks with no P0/P1 incidents.
- Result: FAIL

## Violations

- Gray observation is still running.
- Security signoff must be SIGNED before gray release starts.

This report cannot close the v1.0.0 release gate.
