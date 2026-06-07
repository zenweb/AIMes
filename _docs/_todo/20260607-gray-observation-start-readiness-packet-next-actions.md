# 2026-06-07 Gray Observation Start Readiness Packet Next Actions

## Before Gray

- Close PostgreSQL/staging rehearsal.
- Close Attack Chain A/B/C manual verification.
- Close security signoff.

## When Gray Starts

- Record real `GrayReleaseId`.
- Record `GrayStartedAt`.
- Record `ObservationStartedAt`.
- Run `scripts/run-gray-observation.ps1 -Status OBSERVING` with real start evidence.

## After 14 Calendar Days

- Query incident source for the observation window.
- Confirm P0=0 and P1=0.
- Run `scripts/run-gray-observation.ps1 -Status PASS` with real incident evidence.
