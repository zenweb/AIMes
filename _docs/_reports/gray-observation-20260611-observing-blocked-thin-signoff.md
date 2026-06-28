# Gray observation

- GeneratedAt: 2026-06-11T10:53:22.7024428+08:00
- Status: OBSERVING
- GrayReleaseId: gray-thin-signoff-blocked
- GrayStartedAt: 2026-06-11T10:55:00+08:00
- ObservationStartedAt: 2026-06-11T10:55:00+08:00
- ObservationEndedAt: 
- Required observation window: 14 calendar days
- P0/P1 incident counts: P0=-1; P1=-1
- Evidence: Dated gray start evidence sample for thin signoff guard.
- SecuritySignoffPath: output\tmp-gray-thin-signoff\thin-signoff.md

## Gate

- First gray release: required before v1.0.0.
- Observation window: 2 weeks with no P0/P1 incidents.
- Result: FAIL

## Violations

- Gray observation is still running.
- Security signoff must be SIGNED and PASS with signer, SignedAt, evidence, and Attack Chain PASS before gray release starts.

This report cannot close the v1.0.0 release gate.
