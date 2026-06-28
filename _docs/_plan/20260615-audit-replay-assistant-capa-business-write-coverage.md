# 2026-06-15 Plan - Audit replay coverage leverage slice

## Objective

Harden the audit replay feature as a release-critical existing path without broadening scope.

## Completed

- Selected AuditDecisionReplayPanel because it was the lowest-covered user-critical component after AnomalyBoard.
- Added focused tests for:
  - AI assistant equipment downtime package replay;
  - quality CAPA closure replay and default selection;
  - quality-inspection business-write replay;
  - equipment business-write replay.
- Verified focused test, focused coverage, and full frontend coverage.

## Next Selection Rule

- Continue by current coverage gap and release/user criticality.
- Do not treat frontend coverage as proof that release gates such as gray observation are complete.

