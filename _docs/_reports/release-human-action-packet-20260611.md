# Release human action packet

- GeneratedAt: 2026-06-11T10:08:00+08:00
- Status: PREPARED_ONLY
- Scope: remaining v1.0.0 human and wall-clock release gates.
- Boundary: this packet is executable guidance. It does not verify, sign, start gray, or complete the 14-day observation window.

## Current Automated Evidence

- Hosted CI: PASS, `_docs/_reports/hosted-ci-20260611-v1-pass.md`.
- PostgreSQL/staging: PASS, `_docs/_reports/staging-rehearsal-20260611-docker-restored.md`.
- Security self-assessment: PASS, `_docs/_reports/security-self-assessment-20260611-current.md`.
- Attack Chain automated support: PASS, `_docs/_reports/attack-chain-automated-evidence-20260611-current.md`.
- Attack Chain staging probes: PREPARED_ONLY, `_docs/_reports/attack-chain-staging-transcript-20260611.md`, `_docs/_reports/attack-chain-staging-account-probes-20260611.md`, `_docs/_reports/attack-chain-staging-audit-redaction-probe-20260611.md`.
- Real Chrome frontend evidence: PASS, `_docs/_reports/frontend-real-browser-evidence-20260611.md`.
- Current worktree recheck: FAIL on the same human/wall-clock gates, `_docs/_reports/release-gate-audit-20260612-current-worktree-recheck.md`.
- New排产 live staging evidence: `_docs/_changelog/20260612-schedule-save-status-evidence.md`, `output/playwright/20260612-schedule-live-staging/live-staging-dhtmlx-drag-save-status.png`.

## Required Human Sequence

1. Human verifier reviews Attack Chain A/B/C evidence.
2. Human verifier runs `scripts/run-attack-chain-verification.ps1` with real verifier, timestamp, and accepted A/B/C evidence; placeholders such as `TBD`, `TODO`, `PENDING`, `待补`, `待定`, or `Chain A: TBD` are rejected.
3. Human signer runs `scripts/run-security-signoff.ps1` so `_docs/_review/20260607-security-signoff.md` becomes a valid `Result: PASS` signoff with signer, SignedAt, evidence, and Attack Chain PASS.
4. First gray release starts only after the security signoff packet is valid PASS, not merely after `Status/Decision: SIGNED` appears.
5. Gray observation remains `OBSERVING` until at least 14 calendar days have elapsed.
6. Gray observation can become `PASS` only with P0=0 and P1=0 evidence for the full window.

## Attack Chain Verification Command

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-attack-chain-verification.ps1 `
  -ReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md `
  -Verifier "<human verifier name>" `
  -VerifiedAt "<ISO timestamp>" `
  -AttackChainA PASS `
  -AttackChainB PASS `
  -AttackChainC PASS `
  -AttackChainAEvidence "<dated concrete Chain A evidence accepted by verifier>" `
  -AttackChainBEvidence "<dated concrete Chain B evidence accepted by verifier>" `
  -AttackChainCEvidence "<dated concrete Chain C evidence accepted by verifier>" `
  -Notes "Human review packet: _docs/_reports/attack-chain-human-review-packet-20260611.md; hosted CI: _docs/_reports/hosted-ci-20260611-v1-pass.md; staging: _docs/_reports/staging-rehearsal-20260611-docker-restored.md; real Chrome: _docs/_reports/frontend-real-browser-evidence-20260611.md"
```

## Security Signoff Command

Run only after Attack Chain A/B/C verification is PASS:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-security-signoff.ps1 `
  -ReportPath _docs/_review/20260607-security-signoff.md `
  -Status SIGNED `
  -Signer "<human signer name>" `
  -SignedAt "<ISO timestamp>" `
  -Evidence "Attack Chain PASS report _docs/_reports/attack-chain-verification-20260611-manual-verified.md; hosted CI _docs/_reports/hosted-ci-20260611-v1-pass.md; staging _docs/_reports/staging-rehearsal-20260611-docker-restored.md; security self-assessment _docs/_reports/security-self-assessment-20260611-current.md." `
  -Notes "<human signoff note>" `
  -HostedCiReportPath _docs/_reports/hosted-ci-20260611-v1-pass.md `
  -StagingReportPath _docs/_reports/staging-rehearsal-20260611-docker-restored.md `
  -SecuritySelfAssessmentPath _docs/_reports/security-self-assessment-20260611-current.md `
  -AttackChainAutomatedPath _docs/_reports/attack-chain-automated-evidence-20260611-current.md `
  -AttackChainReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md `
  -FrontendEvidencePath _docs/_reports/frontend-real-browser-evidence-20260611.md
```

After signing, rerun the gate audit. Expected result before gray completion: Attack Chain and Security signoff should be PASS; Gray observation should still FAIL.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 `
  -ReportPath _docs/_reports/release-gate-audit-20260611-after-security-signoff.md `
  -HostedCiReportPath _docs/_reports/hosted-ci-20260611-v1-pass.md `
  -StagingReportPath _docs/_reports/staging-rehearsal-20260611-docker-restored.md `
  -AttackChainReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md `
  -SecuritySignoffPath _docs/_review/20260607-security-signoff.md `
  -GrayObservationReportPath _docs/_reports/gray-observation-20260607-not-started.md
```

## Gray Start Command

Use only after security signoff is `Result: PASS` with signer, SignedAt, evidence, and Attack Chain PASS:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-gray-observation.ps1 `
  -ReportPath _docs/_reports/gray-observation-20260611-observing.md `
  -Status OBSERVING `
  -GrayReleaseId "<real gray release id>" `
  -GrayStartedAt "<ISO timestamp>" `
  -ObservationStartedAt "<ISO timestamp>" `
  -P0IncidentCount -1 `
  -P1IncidentCount -1 `
  -Evidence "<dated gray start evidence>" `
  -SecuritySignoffPath _docs/_review/20260607-security-signoff.md
```

After gray starts, rerun the gate audit using the observing report. Expected result: Gray observation still FAIL while the 14-day window is running.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 `
  -ReportPath _docs/_reports/release-gate-audit-20260611-after-gray-start.md `
  -HostedCiReportPath _docs/_reports/hosted-ci-20260611-v1-pass.md `
  -StagingReportPath _docs/_reports/staging-rehearsal-20260611-docker-restored.md `
  -AttackChainReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md `
  -SecuritySignoffPath _docs/_review/20260607-security-signoff.md `
  -GrayObservationReportPath _docs/_reports/gray-observation-20260611-observing.md
```

## Gray PASS Command

Use only after at least 14 calendar days and real incident evidence proves P0=0 and P1=0.
First generate a reviewed incident packet:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-gray-incident-review.ps1 `
  -ReportPath _docs/_reports/gray-incident-review-20260611-pass.md `
  -Status REVIEWED `
  -Reviewer "<human reviewer name>" `
  -ReviewedAt "<ISO timestamp>" `
  -MonitoringSource "<monitoring source name and query/export path>" `
  -ObservationStartedAt "<ISO timestamp>" `
  -ObservationEndedAt "<ISO timestamp at least 14 days later>" `
  -P0IncidentCount 0 `
  -P1IncidentCount 0 `
  -IncidentQueryEvidence "<repo-local incident query / monitoring evidence proving P0=0 and P1=0>" `
  -GrayReleaseId "<real gray release id>" `
  -Notes "<human review note>"
```

Then use that reviewed packet as the gray observation evidence:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-gray-observation.ps1 `
  -ReportPath _docs/_reports/gray-observation-20260611-pass.md `
  -Status PASS `
  -GrayReleaseId "<real gray release id>" `
  -GrayStartedAt "<ISO timestamp>" `
  -ObservationStartedAt "<ISO timestamp>" `
  -ObservationEndedAt "<ISO timestamp at least 14 days later>" `
  -P0IncidentCount 0 `
  -P1IncidentCount 0 `
  -Evidence "_docs/_reports/gray-incident-review-20260611-pass.md" `
  -SecuritySignoffPath _docs/_review/20260607-security-signoff.md
```

After gray PASS, rerun the final release gate audit. Expected result: all gates PASS.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 `
  -ReportPath _docs/_reports/release-gate-audit-20260611-final.md `
  -HostedCiReportPath _docs/_reports/hosted-ci-20260611-v1-pass.md `
  -StagingReportPath _docs/_reports/staging-rehearsal-20260611-docker-restored.md `
  -AttackChainReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md `
  -SecuritySignoffPath _docs/_review/20260607-security-signoff.md `
  -GrayObservationReportPath _docs/_reports/gray-observation-20260611-pass.md
```

## Staging Cleanup Command

Use only after human Attack Chain verification screenshots/evidence are captured, or after a human decides these staging samples are no longer needed:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/prepare-attack-chain-staging-accounts.ps1 `
  -ReportPath _docs/_reports/attack-chain-staging-cleanup-20260611-removed.md `
  -Remove `
  -IncludeAuditProbe
```

Dry-run evidence before removal: `_docs/_reports/attack-chain-staging-cleanup-20260611-dry-run.md`.

## Result

- Result: PREPARED_ONLY
- Remaining gates:
  - Attack Chain A/B/C human verification.
  - Security signoff.
  - Gray observation start and 14 calendar days with P0/P1=0.
  - Staging temporary account cleanup after human evidence capture.
  - Current codebase also includes a visible schedule save-status marker and live staging proof; it does not remove the human gates above.
