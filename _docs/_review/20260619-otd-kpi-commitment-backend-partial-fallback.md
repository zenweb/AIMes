# 2026-06-19 Review - OTD KPI Commitment Backend Partial Fallback

## Scope
- Reviewed OTD KPI customer commitment backend-first readers used by report and schedule surfaces.
- Focused on preserving commitment auditability: OTD baseline, Agent OTD, lift, delayed order reduction, owner actions, audit ID, trace ID, and customer promise summary.

## Findings
- `readOtdKpiCommitmentPackagesBackendFirst` accepted any non-empty backend array, including partial records.
- `readLatestOtdKpiCommitmentPackageBackendFirst` accepted any truthy backend latest record.
- Local storage read already filtered invalid commitment packages; backend-first selection missed the same guard.

## Decision
- Filter backend list results through `isCommitmentPackage` before accepting them.
- Require backend latest commitment to pass `isCommitmentPackage`; otherwise return the local latest commitment.

## Residual Risk
- Backend list results with a mix of complete and partial packages now keep complete backend packages and drop partial ones. If every backend package is partial, the reader falls back to local complete evidence.
- Filtered report/schedule tests are adjacency checks, not full frontend regression.
