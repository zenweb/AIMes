# 2026-07-05 Gray Observation Monitoring Evidence Request

## Purpose

This packet defines the exact evidence required to convert the current gray observation from `OBSERVING` / strict `FAIL` into a strict v1.0.0 release PASS candidate.

It does not claim PASS.

## Current Facts

- GrayReleaseId: `gray-v1.0.0-20260613-001`
- GrayStartedAt: `2026-06-13T21:38:09+08:00`
- ObservationStartedAt: `2026-06-13T21:38:09+08:00`
- Required window: 14 calendar days
- Earliest valid ObservationEndedAt: `2026-06-27T21:38:09+08:00`
- Current date of this packet: `2026-07-05`
- Time window status: elapsed
- Current blocking issue: real P0/P1 incident counts are not collected in repo evidence; latest gray report still has `P0=-1; P1=-1`.

## Required Evidence

Provide one or more concrete evidence references proving all of the following:

1. Monitoring source name and query/export path.
2. Incident search window covers at least `2026-06-13T21:38:09+08:00` through `2026-06-27T21:38:09+08:00`.
3. P0 incident count during the window is exactly `0`.
4. P1 incident count during the window is exactly `0`.
5. Evidence is not a placeholder. It must cite an actual monitoring export, dashboard snapshot, incident query transcript, on-call report, or signed human review packet.

Suggested evidence wording:

```text
Monitoring export <path or ticket>: queried production incidents for gray release gray-v1.0.0-20260613-001 from 2026-06-13T21:38:09+08:00 through 2026-06-27T21:38:09+08:00; P0=0; P1=0; reviewer <name>; reviewedAt <timestamp>.
```

## Command To Generate Strict PASS Candidate

After real monitoring evidence exists, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-gray-observation.ps1 `
  -ReportPath _docs/_reports/gray-observation-20260705-pass.md `
  -Status PASS `
  -GrayReleaseId gray-v1.0.0-20260613-001 `
  -GrayStartedAt "2026-06-13T21:38:09+08:00" `
  -ObservationStartedAt "2026-06-13T21:38:09+08:00" `
  -ObservationEndedAt "2026-06-27T21:38:09+08:00" `
  -P0IncidentCount 0 `
  -P1IncidentCount 0 `
  -Evidence "<real monitoring evidence reference>"
```

Then rerun strict release gate with the current hosted CI packet:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 `
  -ReportPath _docs/_reports/release-gate-audit-20260705-strict-gray-pass.md `
  -HostedCiReportPath _docs/_reports/hosted-ci-20260705-v1-ecdd6d05-pass.md `
  -StagingReportPath _docs/_reports/staging-rehearsal-20260621-5003-ef-tools-aligned-pass.md `
  -AttackChainReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md `
  -SecuritySignoffPath _docs/_review/20260607-security-signoff.md `
  -GrayObservationReportPath _docs/_reports/gray-observation-20260705-pass.md
```

Current hosted CI tip context:

- Current committed hosted CI packet available to strict audit: `_docs/_reports/hosted-ci-20260705-v1-ecdd6d05-pass.md`.
- Follow-up release-gate sync commit: `3c349dfdd76f8c38bc6aacafcab66d8739d369d1`.
- Current GitHub `V1` tip after sealing release-gate sync: `3c349dfdd76f8c38bc6aacafcab66d8739d369d1`.
- Note: do not recurse indefinitely just to make the hosted CI packet name match each docs-only evidence commit. The strict blocker is gray P0/P1 evidence, not hosted CI availability.

## Current Fail-Loud Evidence

- `_docs/_reports/gray-observation-20260705-window-elapsed-monitoring-missing.md`
- `_docs/_reports/release-gate-audit-20260705-strict-gray-monitoring-missing.md`

These prove that time has elapsed but strict release completion is still unproven until real monitoring evidence is supplied.
