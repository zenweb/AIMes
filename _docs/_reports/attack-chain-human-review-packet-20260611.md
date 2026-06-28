# Attack Chain A/B/C human review packet

- GeneratedAt: 2026-06-11T09:39:00+08:00
- Status: PREPARED_ONLY
- Scope: v1.0.0 Attack Chain A/B/C human verification support.
- Boundary: this packet organizes current machine evidence for a human verifier. It does not close the release gate by itself.

## Evidence Sources

- Automated support: `_docs/_reports/attack-chain-automated-evidence-20260611-current.md`
- Security self-assessment: `_docs/_reports/security-self-assessment-20260611-current.md`
- Staging rehearsal: `_docs/_reports/staging-rehearsal-20260611-docker-restored.md`
- Non-mutating staging HTTP transcript: `_docs/_reports/attack-chain-staging-transcript-20260611.md`
- Staging account-backed probes: `_docs/_reports/attack-chain-staging-account-probes-20260611.md`
- Staging audit redaction probe: `_docs/_reports/attack-chain-staging-audit-redaction-probe-20260611.md`
- Real Chrome frontend evidence: `_docs/_reports/frontend-real-browser-evidence-20260611.md`
- Real Chrome screenshot manifest: `output/playwright/20260611-real-browser/manifest.md`

## Attack Chain A: Authorization Boundary

Machine-collected support:

- Protected anonymous endpoints returned 401 in staging:
  - `/healthz/secured`
  - `/api/v1/equipment`
  - `/api/v1/admin/users`
  - `/api/v1/scheduling/agent/recommend`
- Malformed bearer token was rejected with 401 on `/api/v1/equipment`.
- `attack_chain_admin` authenticated as `Admin` and read `/api/v1/admin/users` with HTTP 200.
- `attack_chain_operator` authenticated as `Operator`, was rejected from `/api/v1/admin/users` with HTTP 403, and could read `/api/v1/equipment` with HTTP 200.
- Real Chrome frontend tests passed login/auth guard, audit replay, monitoring escalation, and quality evidence flows.
- Real Chrome screenshots captured login, audit replay, monitoring, and quality pages after DOM assertions.

Human verifier must confirm:

- The current role model and route/API policy match intended production access.
- Any Agent cross-domain action that can mutate state is restricted to the expected role and approval context.
- The prepared temporary accounts are either removed or rotated after verification.

Suggested evidence text:

`2026-06-11: reviewed staging transcript, account-backed probes, automated role matrix, and real Chrome e2e evidence. Admin-only API rejected Operator with 403, anonymous/malformed requests returned 401, and expected user-critical frontend auth flows passed in Chrome.`

## Attack Chain B: Credential And Evidence Leakage

Machine-collected support:

- Invalid login returned 401 and did not return token material.
- Staging account probe reports do not persist passwords or tokens.
- Audit redaction probe found `***REDACTED***` in `audit_logs.new_values`.
- The exact plain probe password was not found in `audit_logs.new_values`.
- Real Chrome fail-loud tests verify frontend does not forge evidence when audit, quality, monitoring, or storage writes fail.

Human verifier must confirm:

- Representative logs, audit records, exports, and screenshots do not expose credential material.
- Any retained temporary account or audit sample has an explicit retention reason.

Suggested evidence text:

`2026-06-11: reviewed invalid-login, account-backed, and audit-redaction staging evidence. No password/token material was written to reports; audit payload redacted the admin-created initial password and the plain probe password was absent from audit_logs.new_values.`

## Attack Chain C: Release Configuration

Machine-collected support:

- Docker Desktop Linux engine and staging dependencies were healthy in the 2026-06-11 rehearsal.
- EF migrations were up to date.
- `/live` and `/ready` returned HTTP 200.
- Disallowed Origin preflight did not receive `Access-Control-Allow-Origin`.
- Security self-assessment and Attack Chain automated support both passed.
- Hosted CI evidence is present in `_docs/_reports/hosted-ci-20260611-v1-pass.md`.

Human verifier must confirm:

- The reviewed environment is the intended staging/release candidate environment.
- No local-only bypass, unsafe CORS origin, missing secret handling, or dependency exception is being promoted.
- Security signoff is signed only after this manual verification is accepted.

Suggested evidence text:

`2026-06-11: reviewed hosted CI, staging rehearsal, security self-assessment, automated Attack Chain evidence, and CORS staging transcript. Staging health/migrations passed, disallowed Origin was not granted, and no release-configuration exception was accepted.`

## Verification Command Template

Verifier and per-chain evidence must be concrete. Placeholders such as `TBD`, `TODO`, `PENDING`, `待补`, `待定`, or evidence text whose final field is a placeholder such as `Chain A: TBD` are rejected by `scripts/run-attack-chain-verification.ps1`.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-attack-chain-verification.ps1 `
  -ReportPath _docs/_reports/attack-chain-verification-20260611-manual-verified.md `
  -Verifier "<human verifier name>" `
  -VerifiedAt "<ISO timestamp>" `
  -AttackChainA PASS `
  -AttackChainB PASS `
  -AttackChainC PASS `
  -AttackChainAEvidence "<dated concrete Chain A evidence>" `
  -AttackChainBEvidence "<dated concrete Chain B evidence>" `
  -AttackChainCEvidence "<dated concrete Chain C evidence>" `
  -Notes "Human review packet: _docs/_reports/attack-chain-human-review-packet-20260611.md; automated support: _docs/_reports/attack-chain-automated-evidence-20260611-current.md; staging probes: _docs/_reports/attack-chain-staging-account-probes-20260611.md; audit redaction: _docs/_reports/attack-chain-staging-audit-redaction-probe-20260611.md; real Chrome frontend evidence: _docs/_reports/frontend-real-browser-evidence-20260611.md"
```

## Result

- Result: PREPARED_ONLY
- Remaining:
  - Human verifier name.
  - VerifiedAt timestamp.
  - Accepted evidence text for Attack Chain A, B, and C.
  - Security signer after A/B/C verification.
  - Gray release start and 14 calendar days with P0/P1 = 0.
