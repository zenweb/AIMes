# 2026-06-07 Gray Observation Start Readiness Packet

## Scope

- Goal: prepare the first gray release observation workflow without claiming gray has started.
- Boundary: this packet is not a gray observation PASS report.
- Current gate report: `_docs/_reports/gray-observation-20260607-not-started.md`, `Status: NOT_STARTED`, `Result: FAIL`.

## Preconditions Before First Gray

- Hosted CI: PASS at remote main `0e839720b32cb3fbbdc8befe8d14139b9e2ec0d2`.
- PostgreSQL/staging: still FAIL because Docker Desktop Linux engine is unavailable.
- Attack Chain A/B/C manual verification: still pending.
- Security signoff: still `UNSIGNED`.

The first gray release should not start until staging, Attack Chain manual verification, and security signoff are closed.

## Required Start Evidence

When first gray starts, collect these fields:

- `GrayReleaseId`: concrete release identifier, not a placeholder.
- `GrayStartedAt`: ISO-8601 timestamp when gray traffic starts.
- `ObservationStartedAt`: ISO-8601 timestamp for the two-week observation window start.
- Evidence: deployment/change record URL or dated internal release note proving gray start.

## OBSERVING Command Template

Use this after first gray starts. It must remain `FAIL` while the observation window is running:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-gray-observation.ps1 `
  -ReportPath _docs/_reports/gray-observation-20260607-observing.md `
  -Status OBSERVING `
  -GrayReleaseId "<real gray release id>" `
  -GrayStartedAt "<ISO-8601 gray start timestamp>" `
  -ObservationStartedAt "<ISO-8601 observation start timestamp>" `
  -P0IncidentCount -1 `
  -P1IncidentCount -1 `
  -Evidence "<dated gray release evidence>"
```

## PASS Command Template

Use this only after at least 14 calendar days have elapsed and incident evidence proves P0=0 and P1=0:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-gray-observation.ps1 `
  -ReportPath _docs/_reports/gray-observation-20260607-pass.md `
  -Status PASS `
  -GrayReleaseId "<real gray release id>" `
  -GrayStartedAt "<ISO-8601 gray start timestamp>" `
  -ObservationStartedAt "<ISO-8601 observation start timestamp>" `
  -ObservationEndedAt "<ISO-8601 observation end timestamp>" `
  -P0IncidentCount 0 `
  -P1IncidentCount 0 `
  -Evidence "<incident query / monitoring evidence proving P0=0 and P1=0>"
```

## Current Result

- Result: PREPARED_ONLY
- Gray observation release gate remains `FAIL`.
