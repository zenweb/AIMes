# Release gate audit

- GeneratedAt: 2026-06-06T22:54:20.2801821+08:00
- Scope: v1.0.0 B-track hard release gates

## Gate summary

- Evidence packet status: FOUND or MISSING

| Gate | Status | Evidence packet status | Evidence packet | Required evidence |
| --- | --- | --- | --- | --- |
| Hosted CI | FAIL | FOUND | _docs/_reports/hosted-ci-github-actions-evidence-20260606-gh-recheck.md | Hosted runner RunUrl, RunId, and job summary |
| PostgreSQL/staging | FAIL | FOUND | _docs/_reports/staging-rehearsal-20260606-docker-gh-recheck.md | Real staging rehearsal with migrations and /live /ready PASS |
| Attack Chain A/B/C | FAIL | FOUND | _docs/_reports/attack-chain-verification-20260606-recheck.md | Human verifier, timestamp, and A/B/C evidence |
| Security signoff | FAIL | FOUND | _docs/_review/20260605-security-signoff.md | Human signer changes Status/Decision to SIGNED with evidence |
| Gray observation | FAIL | FOUND | _docs/_reports/gray-observation-20260602.md | First gray release plus 14 calendar days with P0/P1 = 0 |

## Gate

- Result: FAIL

## Violations

- Hosted CI release gate is not PASS.
- PostgreSQL/staging release gate is not PASS.
- Attack Chain A/B/C release gate is not PASS.
- Security signoff release gate is not PASS.
- Gray observation release gate is not PASS.

This report cannot close the v1.0.0 release gate.
