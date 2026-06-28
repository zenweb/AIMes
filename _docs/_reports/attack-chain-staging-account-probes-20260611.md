# Attack Chain staging account probes

- GeneratedAt: 2026-06-11T09:06:28.1602425+08:00
- Scope: account-backed staging probes for human Attack Chain A/B/C review.
- Boundary: this report is machine-collected support evidence. It does not replace the human verifier, VerifiedAt, per-chain evidence, or security signoff.
- Password handling: passwords are supplied by the caller and are not written to this report.

## Prepared accounts

| Username | Expected role | Login status | Actual role | MustChangePassword | HasToken |
| --- | --- | --- | --- | --- | --- |
| attack_chain_admin | Admin | 200 | Admin | False | True |
| attack_chain_operator | Operator | 200 | Operator | False | True |

## Probes

| Probe | Method | Path | Expected | Actual | Evidence |
| --- | --- | --- | --- | --- | --- |
| Admin token reads admin users | GET | /api/v1/admin/users | 200 | 200 | {"items":[{"id":"attack-chain-admin","username":"attack_chain_admin","displayName":"Attack Chain Admin","role":"Admin","isActive":true,"mustChangePassword":false,"createdAt":"2026- |
| Operator token rejected from admin users | GET | /api/v1/admin/users | 403 | 403 | no response body |
| Operator token reads equipment | GET | /api/v1/equipment | 200 | 200 | {"items":[{"id":"eq-001","equipmentCode":"CNC-001","equipmentName":"CNC加工中心1号","equipmentType":"CNC","workshopId":"ws-001","workshopName":"精密加工车间","status":"Available","capacity":1 |
| Operator token posts agent recommend validation path | POST | /api/v1/scheduling/agent/recommend | 400 | 400 | {"type":"https://httpstatuses.io/400","title":"Validation Error","status":400,"detail":"The value cannot be an empty string or composed entirely of whitespace. (Parameter 'request. |

## Attack Chain mapping

- Attack Chain A support: real staging admin and operator identities authenticate; admin-only endpoint rejects operator.
- Attack Chain B support: report does not persist passwords; login tokens are not written to the evidence file.
- Attack Chain C support: account-backed probes run against current staging API and PostgreSQL state.

## Remaining human checks

- Manually review Agent cross-domain action policy using the automated role-matrix evidence and, if needed, a valid existing Agent decision.
- Run scripts/run-attack-chain-verification.ps1 with human verifier, timestamp, and A/B/C evidence.
- Rotate or remove staging probe accounts after verification.

Result: PREPARED_ONLY
