# Release gate audit

- GeneratedAt: 2026-06-06T19:11:40.5070465+08:00
- Scope: v1.0.0 B-track hard release gates

## Gate summary

- Evidence packet status: FOUND or MISSING

| Gate | Status | Evidence packet status | Evidence packet | Required evidence |
| --- | --- | --- | --- | --- |
| Hosted CI | FAIL | FOUND | _docs\_reports\hosted-ci-github-actions-evidence-20260606.md | Hosted runner RunUrl, RunId, and job summary |
| PostgreSQL/staging | FAIL | FOUND | _docs\_reports\staging-rehearsal-20260606-docker-recheck.md | Real staging rehearsal with migrations and /live /ready PASS |
| Attack Chain A/B/C | FAIL | FOUND | _docs\_reports\attack-chain-verification-20260606.md | Human verifier, timestamp, and A/B/C evidence |
| Security signoff | FAIL | FOUND | _docs\_review\20260606-security-signoff.md | Human signer changes Status/Decision to SIGNED with evidence |
| Gray observation | FAIL | FOUND | _docs\_reports\gray-observation-20260606.md | First gray release plus 14 calendar days with P0/P1 = 0 |

## Gate

- Result: FAIL

## Violations

- Hosted CI release gate is not PASS.
- PostgreSQL/staging release gate is not PASS.
- Attack Chain A/B/C release gate is not PASS.
- Security signoff release gate is not PASS.
- Gray observation release gate is not PASS.

This report cannot close the v1.0.0 release gate.
