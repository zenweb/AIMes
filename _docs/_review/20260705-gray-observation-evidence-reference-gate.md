# 2026-07-05 Review: Gray Observation Evidence Reference Gate

## Decision

`PASS_GATE_HARDENING`

Gray observation PASS evidence now fails loud when it names a repo-local `_docs/` or `output/` artifact that does not exist. This closes a strict-release audit gap where a future PASS packet could cite a missing monitoring export or incident-review file.

## Changed

- `scripts/run-gray-observation.ps1`
  - Added repo-root aware `Test-EvidenceReferenceExists`.
  - `OBSERVING` and `PASS` evidence still accepts non-placeholder external prose, but any repo-local `_docs/` or `output/` file reference must exist.
- `scripts/run-release-gate-audit.ps1`
  - Gray observation aggregation now rejects missing repo-local evidence references, matching the Attack Chain reference behavior.
- `src/tests/MES.ArchitectureTests/ArchitectureRuleTests.cs`
  - Added static guard tokens so gray evidence reference validation cannot be silently removed.

## Verification

```text
dotnet test src/tests/MES.ArchitectureTests/MES.ArchitectureTests.csproj --filter "FullyQualifiedName~GrayObservation|FullyQualifiedName~ReleaseGateAudit|FullyQualifiedName~AttackChainManualVerification"
Result: 15 passed / 0 failed / 0 skipped
```

```text
run-gray-observation.ps1 PASS sample with _docs/_reports/missing-gray-monitoring-export.md
Result: EXPECTED_FAIL
Reason: Gray observation evidence reference does not exist.
```

```text
run-gray-observation.ps1 PASS sample with _docs/_reports/gray-observation-monitoring-evidence-request-20260705.md
Result: PASS
```

```text
run-release-gate-audit.ps1 strict PASS sample with missing gray evidence reference
Result: EXPECTED_FAIL
Reason: Gray observation evidence reference does not exist.
```

```text
run-release-gate-audit.ps1 strict PASS sample with existing gray evidence reference
Result: PASS
```

## Boundary

- This hardens the gate only.
- It does not provide the missing production monitoring export.
- Strict v1.0.0 still requires real `P0=0` / `P1=0` monitoring or signed incident-review evidence for the gray window.
