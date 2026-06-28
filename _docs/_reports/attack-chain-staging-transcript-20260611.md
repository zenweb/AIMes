# Attack Chain staging transcript

- GeneratedAt: 2026-06-11T09:16:00.2433023+08:00
- Scope: non-mutating staging HTTP probes for Attack Chain A/B/C human review.
- API base URL: http://localhost:5000
- Staging evidence source: _docs/_reports/staging-rehearsal-20260611-docker-restored.md
- Boundary: this transcript is machine-collected support evidence only. It does not replace the required human verifier, VerifiedAt, per-chain manual evidence, or security signoff.

## Staging identity precheck

```text
select count(*) from system_users;
3
```

The current staging database has 3 system user(s). This transcript still does not replace human low-privilege/admin verification, but account-backed manual checks can proceed.

## HTTP probes

| Probe | Method | Path | Expected | Actual | Evidence |
| --- | --- | --- | --- | --- | --- |
| live public probe | GET | /live | 200 | 200 | Healthy |
| ready public probe | GET | /ready | 200 | 200 | Healthy |
| secured health anonymous rejection | GET | /healthz/secured | 401 | 401 | no response body |
| equipment anonymous rejection | GET | /api/v1/equipment | 401 | 401 | no response body |
| admin users anonymous rejection | GET | /api/v1/admin/users | 401 | 401 | no response body |
| scheduling agent anonymous rejection | POST | /api/v1/scheduling/agent/recommend | 401 | 401 | no response body |
| equipment malformed bearer rejection | GET | /api/v1/equipment | 401 | 401 | no response body |
| invalid login no token | POST | /api/v1/auth/login | 401 | 401 | no response body, no token payload |
| CORS disallowed origin preflight | OPTIONS | /api/v1/equipment | 204 | 204 | Access-Control-Allow-Origin absent for https://evil.example.invalid |

## Attack Chain mapping

- Attack Chain A support: protected API/admin/agent endpoints reject anonymous or malformed bearer requests.
- Attack Chain B support: invalid login does not return credential/token material.
- Attack Chain C support: disallowed Origin is not granted Access-Control-Allow-Origin; /live and /ready remain intentionally public.

## Remaining human checks

- Create or use a real low-privilege staging account and confirm admin-only and cross-domain Agent actions are forbidden.
- Create or use a real admin staging account and confirm authorized admin flows work as intended.
- Inspect representative audit/log/export samples after a controlled user-management operation and confirm credential material is redacted or hashed.
- Record verifier, timestamp, and dated evidence in scripts/run-attack-chain-verification.ps1.

Result: PREPARED_ONLY
