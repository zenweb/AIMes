# Security Policy

AIMes V1 contains authentication, authorization, audit logging, AI decision trace, and manufacturing workflow code. Please report security issues privately and include enough detail for maintainers to reproduce and assess impact.

## Supported Versions

| Version | Security Support |
|---------|------------------|
| `v1` active branch | Supported for critical and high-impact issues during active remediation. |
| Historical snapshots, demos, generated artifacts | Not supported unless the same issue affects the active `v1` code path. |

## Reporting a Vulnerability

Do not open a public GitHub issue for suspected vulnerabilities.

Report privately with:

- A concise description of the issue.
- Affected component or file path when known.
- Reproduction steps or proof of concept.
- Expected impact: authentication bypass, privilege escalation, data exposure, audit tampering, denial of service, supply-chain risk, or other category.
- Required privileges and environment assumptions.
- Suggested fix, if you have one.

If a private security advisory channel is configured on the hosting platform, use that channel. If not, contact the project maintainer through the private project communication channel already used for AIMes delivery. Do not post secrets, tokens, exploit payloads, or customer data in public discussions.

## Response Expectations

The maintainer will triage reports by severity:

| Severity | Examples | Expected Handling |
|----------|----------|-------------------|
| Critical | Auth bypass, admin privilege escalation, signing key exposure, remote code execution, irreversible audit tampering | Stop release work, patch before further rollout, document the issue record. |
| High | Tenant/data exposure, missing authorization on sensitive API, exploitable dependency vulnerability | Patch in the next security remediation batch and add regression tests. |
| Medium | Defense-in-depth gap, noisy but bounded denial of service, incomplete audit metadata | Track in `_docs/_issue` and schedule with risk context. |
| Low | Documentation ambiguity, non-exploitable hardening suggestion | Track as maintenance work. |

## Security Baseline

Security-sensitive changes should preserve these project rules:

- JWT signing keys must come from validated configuration in production.
- Password reset or first-login flows must not weaken existing rate limits or audit logging.
- Authorization decisions must be covered by tests for allowed and forbidden roles.
- AI and operator actions that affect business state must remain auditable with trace IDs and business keys.
- Sensitive fields must be redacted from logs and audit summaries.
- New dependencies must pass NuGet/npm vulnerability audit gates.
- CI security checks must fail loud; do not silence vulnerable package warnings without a documented risk decision.

## Disclosure

Public disclosure should happen only after a fix or documented mitigation is available. Release notes should describe the impact and affected versions without publishing exploit details that would put unpatched deployments at unnecessary risk.
