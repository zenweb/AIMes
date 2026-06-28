# Release gate audit

- GeneratedAt: 2026-06-11T18:03:18.6108081+08:00
- Scope: v1.0.0 B-track hard release gates

## Gate summary

- Evidence packet status: FOUND or MISSING

| Gate | Status | Evidence packet status | Evidence packet | Required evidence |
| --- | --- | --- | --- | --- |
| Hosted CI | PASS | FOUND | _docs/_reports/hosted-ci-20260611-v1-pass.md | Hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary |
| PostgreSQL/staging | PASS | FOUND | _docs/_reports/staging-rehearsal-20260611-docker-restored.md | Production environment, PostgreSQL connection, Docker dependencies, EF migrations, API startup, /live, and /ready |
| Attack Chain A/B/C | FAIL | FOUND | _docs/_reports/attack-chain-verification-20260611-manual-pending.md | VERIFIED status, verifier, VerifiedAt, and Attack Chain A/B/C Manual verification PASS with non-placeholder evidence |
| Security signoff | FAIL | FOUND | _docs/_review/20260607-security-signoff.md | Human SIGNED decision, signer, SignedAt, evidence, self-assessment, and Attack Chain A/B/C PASS |
| Gray observation | FAIL | FOUND | _docs/_reports/gray-observation-20260607-not-started.md | PASS gray release id, observation timestamps, 14 calendar days, P0/P1=0, and evidence |

## Gate

- Result: FAIL

## Violations

- Attack Chain A/B/C release gate is not PASS.
- Security signoff release gate is not PASS.
- Gray observation release gate is not PASS.

This report cannot close the v1.0.0 release gate.
