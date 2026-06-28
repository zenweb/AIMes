# Production invalid route scan guard next actions

- Stop spending additional slices on basic route scan-code coverage unless production behavior changes.
- Next ProductionBoard candidates should move to remaining operator-visible branches:
  - barcode action rejection for completed/non-startable operations;
  - evidence archive failure variants not yet asserted;
  - real browser route handoff only if routing/UI behavior changes.
