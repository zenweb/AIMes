# Gray observation

- GeneratedAt: 2026-07-05T16:55:21.0751952+08:00
- Status: OBSERVING
- GrayReleaseId: gray-v1.0.0-20260613-001
- GrayStartedAt: 2026-06-13T21:38:09+08:00
- ObservationStartedAt: 2026-06-13T21:38:09+08:00
- ObservationEndedAt:
- Required observation window: 14 calendar days
- P0/P1 incident counts: P0=-1; P1=-1
- Evidence: Gray window elapsed by 2026-07-05, but strict PASS still requires real monitoring incident evidence for 2026-06-13T21:38:09+08:00 through 2026-06-27T21:38:09+08:00; current latest report has P0=-1 and P1=-1 sentinel values.
- SecuritySignoffPath: _docs/_review/20260607-security-signoff.md

## Gate

- First gray release: required before v1.0.0.
- Observation window: 2 weeks with no P0/P1 incidents.
- Result: FAIL

## Violations

- Gray observation is still running.

This report cannot close the v1.0.0 release gate.
