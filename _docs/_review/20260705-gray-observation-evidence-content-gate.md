# 2026-07-05 Review: Gray Observation Evidence Content Gate

## Decision

`PASS_GATE_HARDENING`

Gray observation repo-local evidence references now need to be reviewed monitoring or incident-review PASS packets, not merely existing files. This closes the follow-up audit gap where a request document or unrelated report under `_docs/` could be cited by a strict gray PASS packet.

## Changed

- `scripts/run-gray-observation.ps1`
  - Added `Test-GrayMonitoringEvidenceReferencePass`.
  - `PASS` evidence that names `_docs/` or `output/` must point to at least one file containing reviewed monitoring evidence fields.
- `scripts/run-release-gate-audit.ps1`
  - Strict gray aggregation now rejects existing repo-local references that are not reviewed monitoring or incident-review PASS packets.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`
  - Added guard tokens for `MonitoringSource`, `Reviewer`, `ReviewedAt`, and the reviewed PASS packet predicate.

## Accepted Repo-Local Evidence Shape

The referenced monitoring or incident-review file must include:

- `Status: REVIEWED` or `Status: PASS`
- `Reviewer`
- `ReviewedAt`
- `MonitoringSource`
- `ObservationStartedAt`
- `ObservationEndedAt`
- `P0/P1 incident counts: P0=0; P1=0`
- `Result: PASS`

The observation window must parse and cover at least 14 days, and the review/end timestamps must not be in the future.

## Verification

```text
dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~GrayObservation|FullyQualifiedName~ReleaseGateAudit|FullyQualifiedName~AttackChainManualVerification"
Result: 15 passed / 0 failed / 0 skipped
```

```text
PowerShell parser
run-gray-observation parse ok
run-release-gate-audit parse ok
```

```text
run-gray-observation.ps1 PASS sample with _docs/_reports/gray-observation-monitoring-evidence-request-20260705.md
Result: EXPECTED_FAIL
Reason: existing file is not a reviewed monitoring or incident-review PASS packet.
```

```text
run-gray-observation.ps1 PASS sample with output/gray-monitoring-valid-evidence-sample.md
Result: PASS
```

```text
run-release-gate-audit.ps1 strict PASS sample with the evidence-request document
Result: EXPECTED_FAIL
```

```text
run-release-gate-audit.ps1 strict PASS sample with reviewed monitoring PASS sample
Result: PASS
```

## Boundary

- This is gate hardening only.
- No production monitoring export was supplied in this slice.
- Strict v1.0.0 remains blocked until real gray monitoring or signed incident-review evidence proves `P0=0` and `P1=0`.
