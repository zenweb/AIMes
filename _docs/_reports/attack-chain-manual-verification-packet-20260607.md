# 2026-06-07 Attack Chain A/B/C Manual Verification Packet

## Scope

- Goal: prepare the human verification packet required before security signoff.
- Boundary: this packet is not a PASS report and does not replace the verifier, `VerifiedAt`, or per-chain manual evidence required by `scripts/run-attack-chain-verification.ps1`.
- Current automated support evidence: `_docs/_reports/attack-chain-automated-evidence-20260607-current.md`, `Result: PASS`.
- Current security self-assessment: `_docs/_reports/security-self-assessment-20260607-current.md`, `Result: PASS`.

## Gate Rules

The release gate accepts Attack Chain evidence only when all of these are true:

- `Status: VERIFIED`
- parseable non-future `VerifiedAt`
- non-placeholder `Verifier`
- Attack Chain A/B/C each has `Manual verification: PASS`
- Attack Chain A/B/C each has non-placeholder `Evidence`
- report contains anchored `Result: PASS`

## Attack Chain A Checklist

Scenario: anonymous or low-privilege access to authenticated APIs, admin APIs, and Agent actions.

Automated support already passed:

- `EndpointAuthorizationTests`: 5 integration tests passed in Release.
- `AgentPermissionPolicyTests`: 37 unit tests passed in Release.

Human verifier should confirm:

- Anonymous users cannot access protected API/admin/agent endpoints.
- Low-privilege users cannot execute admin-only or Agent-governance actions.
- The role matrix still matches the intended operator/admin boundaries.
- Any manually tested request IDs, endpoint paths, screenshots, or terminal transcripts are recorded as evidence.

Suggested evidence text:

```text
Manual verifier exercised anonymous and low-privilege requests against protected API/admin/agent endpoints; confirmed unauthorized/forbidden responses and reviewed EndpointAuthorizationTests + AgentPermissionPolicyTests automated PASS evidence dated 2026-06-07.
```

## Attack Chain B Checklist

Scenario: credential, token, log, audit, frontend state, or export leakage.

Automated support already passed:

- `AdminControllerTests.CreateUser_ShouldRedactPasswordInAuditLog`
- `AuthControllerTests.Login_ShouldPersistOnlyHashedRefreshToken`
- `AuthControllerTests.Login_WithInvalidPassword_ShouldReturnUnauthorized`

Human verifier should confirm:

- Passwords and refresh tokens are not persisted or displayed in clear text.
- Audit logs redact credential material while preserving useful context.
- Login failure does not leak sensitive account or token details.
- Any inspected audit/export/log samples are named and dated.

Suggested evidence text:

```text
Manual verifier inspected auth/audit paths and representative logs/exports; confirmed password/token material is redacted or hashed and reviewed credential leakage automated PASS evidence dated 2026-06-07.
```

## Attack Chain C Checklist

Scenario: unsafe release configuration, weak CORS/JWT configuration, missing audit gates, or vulnerable package promotion.

Automated support already passed:

- JWT configuration uses validated options.
- CORS configuration uses validated options.
- high-severity NuGet audit warnings are not suppressed.
- vulnerable package output fails loud.
- security self-assessment reported no vulnerable NuGet/npm packages.

Human verifier should confirm:

- Production CORS origins are intentional and not wildcard.
- JWT signing/validation settings are not raw ad-hoc configuration.
- NuGet/npm vulnerability audits are clean in the dated security self-assessment.
- Release gate scripts still reject placeholder Attack Chain and signoff evidence.

Suggested evidence text:

```text
Manual verifier reviewed release security configuration, CORS/JWT validation gates, package audit outputs, and release gate placeholder rejection; confirmed no vulnerable package promotion or weak release configuration in the 2026-06-07 evidence set.
```

## Command Template

After human verification is complete, run this with real verifier and evidence values:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-attack-chain-verification.ps1 `
  -ReportPath _docs/_reports/attack-chain-verification-20260607-manual-verified.md `
  -Verifier "<human verifier name>" `
  -VerifiedAt "<ISO-8601 timestamp>" `
  -AttackChainA PASS `
  -AttackChainB PASS `
  -AttackChainC PASS `
  -AttackChainAEvidence "<dated concrete evidence for Chain A>" `
  -AttackChainBEvidence "<dated concrete evidence for Chain B>" `
  -AttackChainCEvidence "<dated concrete evidence for Chain C>" `
  -Notes "Automated support evidence: _docs/_reports/attack-chain-automated-evidence-20260607-current.md"
```

## Current Result

- Result: PREPARED_ONLY
- Attack Chain release gate remains `FAIL` until the command above is run with real human verification evidence.
