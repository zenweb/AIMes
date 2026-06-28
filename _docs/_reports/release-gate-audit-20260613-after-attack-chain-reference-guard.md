# Release gate audit

- GeneratedAt: 2026-06-13T22:07:41.4393597+08:00
- Scope: v1.0.0 B-track hard release gates

## Gate summary

- Evidence packet status: FOUND or MISSING

| Gate | Status | Evidence packet status | Evidence packet | Required evidence |
| --- | --- | --- | --- | --- |
| Hosted CI | PASS | FOUND | _docs/_reports/hosted-ci-20260611-v1-pass.md | Hosted runner RunUrl, RunId, release repository, release branch, head SHA, and job summary |
| PostgreSQL/staging | PASS | FOUND | _docs/_reports/staging-rehearsal-20260611-docker-restored.md | Production environment, PostgreSQL connection, Docker dependencies, EF migrations, API startup, /live, and /ready |
| Attack Chain A/B/C | PASS | FOUND | _docs/_reports/attack-chain-verification-20260611-manual-verified.md | VERIFIED status, verifier, VerifiedAt, and Attack Chain A/B/C Manual verification PASS with non-placeholder evidence |
| Security signoff | PASS | FOUND | _docs/_review/20260607-security-signoff.md | Human SIGNED decision, signer, SignedAt, evidence, self-assessment, and Attack Chain A/B/C PASS |
| Gray observation | FAIL | FOUND | _docs/_reports/gray-observation-20260611-observing.md | PASS gray release id, observation timestamps, 14 calendar days, P0/P1=0, and evidence |

## Gate

- Result: FAIL

## Violations

- Attack Chain A evidence reference does not exist. Evidence reference does not exist: 2026-06-11 攻击链A自动化证据：_docs/_reports/attack-chain-automated-evidence-20260611-current.md，人工复核通过
- Attack Chain B evidence reference does not exist. Evidence reference does not exist: 2026-06-11 预发布环境攻击链B探针记录：_docs/_reports/attack-chain-staging-transcript-20260611.md，以及 _docs/_reports/attack-chain-staging-account-probes-20260611.md，权限提升尝试均被阻断
- Attack Chain C evidence reference does not exist. Evidence reference does not exist: 2026-06-11 预发布环境审计脱敏探针：_docs/_reports/attack-chain-staging-audit-redaction-probe-20260611.md，脱敏规则生效；人工确认无信息泄露
- Gray observation release gate is not PASS.

This report cannot close the v1.0.0 release gate.
