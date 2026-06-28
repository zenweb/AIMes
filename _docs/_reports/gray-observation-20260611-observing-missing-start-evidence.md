# Gray observation

- GeneratedAt: 2026-06-11T10:44:49.3778293+08:00
- Status: OBSERVING
- GrayReleaseId: gray-missing-start-evidence
- GrayStartedAt: 2026-06-11T10:45:00+08:00
- ObservationStartedAt: 
- ObservationEndedAt: 
- Required observation window: 14 calendar days
- P0/P1 incident counts: P0=-1; P1=-1
- Evidence: TBD
- SecuritySignoffPath: _docs\_review\20260607-security-signoff.md

## Gate

- First gray release: required before v1.0.0.
- Observation window: 2 weeks with no P0/P1 incidents.
- Result: FAIL

## Violations

- Gray observation is still running.
- Security signoff must be SIGNED before gray release starts.
- ObservationStartedAt is required while gray observation is running.
- OBSERVING requires gray start evidence. Evidence cannot be a placeholder.

This report cannot close the v1.0.0 release gate.
