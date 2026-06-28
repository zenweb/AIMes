# Release gate audit

- GeneratedAt: 2026-06-11T10:57:31.3954384+08:00
- Scope: v1.0.0 B-track hard release gates

## Gate summary

- Evidence packet status: FOUND or MISSING

| Gate | Status | Evidence packet status | Evidence packet | Required evidence |
| --- | --- | --- | --- | --- |
| Hosted CI | PASS | FOUND | _docs\_reports\hosted-ci-20260611-v1-pass.md | Hosted runner RunUrl, RunId, and job summary |
| PostgreSQL/staging | PASS | FOUND | _docs\_reports\staging-rehearsal-20260611-current.md | Real staging rehearsal with migrations and /live /ready PASS |
| Attack Chain A/B/C | FAIL | FOUND | _docs\_reports\attack-chain-verification-20260611-manual-pending.md | Human verifier, timestamp, and A/B/C evidence |
| Security signoff | FAIL | FOUND | _docs\_review\20260607-security-signoff.md | Human signer changes Status/Decision to SIGNED with evidence |
| Gray observation | FAIL | FOUND | _docs\_reports\gray-observation-20260607-not-started.md | First gray release plus 14 calendar days with P0/P1 = 0 |

## Gate

- Result: FAIL

## Violations

- Attack Chain A/B/C release gate is not PASS.
- Security signoff release gate is not PASS.
- Gray observation release gate is not PASS.

This report cannot close the v1.0.0 release gate.
