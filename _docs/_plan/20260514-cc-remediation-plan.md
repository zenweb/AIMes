# AIMes v1 修复计划（Repo-local Evidence Bridge）

> 完整基线计划位于 `C:\AIWorks\AIMes\_docs\_plan\20260514-cc-remediation-plan.md`。
> 本文件是 `v1` 仓库内的审计桥接页，用于让实现、测试、review 和 release gate 证据能在当前 git 工作树内找到 CC plan 落点。

## Current Status

- Plan status: `ACTIVE`。
- Team model: `1 人 + AI（Claude + Codex）`。
- v1.0.0 scope: 阶段一 `Sprint 0-3` + 首次灰度 + 14 天无 P0/P1。
- v1.1 scope: 阶段二 `Sprint 4-6 + E1`。
- Scope rule: 范围保留；带宽不足时按 cut line 顺延阶段二，不删除任务。

## Authoritative Sources

- Full baseline plan: `C:\AIWorks\AIMes\_docs\_plan\20260514-cc-remediation-plan.md`。
- CEO plan: `C:\Users\陈奕铭\.gstack\projects\AIMes\ceo-plans\2026-05-29-aimes-v1-remediation.md`。
- Engineering test plan: `C:\Users\陈奕铭\.gstack\projects\AIMes\eng-review-test-plan-20260530.md`。
- Deferred items bridge: `_docs/_todo/20260530-deferred-from-ceo-review.md`。

## Sprint 0 Baseline Evidence

- `_docs/_changelog/20260605-sprint0-baseline-refresh.md` records the current Sprint 0 / 0.0 baseline refresh.
- `_docs/_review/20260605-sprint0-baseline-refresh.md` records the baseline review boundary.
- `_docs/_todo/20260605-backend-baseline-next-actions.md` records remaining baseline next actions.

## Current B-Track Release Gate Evidence

- Hosted CI: `_docs/_reports/hosted-ci-20260607.md` is `Result: PASS`; GitHub Actions CI run `27086705027` and Agent Evaluation run `27086705023` are queryable success evidence.
- PostgreSQL/staging: `_docs/_reports/staging-rehearsal-20260607-recheck.md` is `Result: FAIL`; local Docker Desktop Linux engine is currently unavailable, and previous dependency image resolution remained blocked.
- Security self-assessment: `_docs/_reports/security-self-assessment-20260607-current.md` is `Result: PASS`.
- Attack Chain automated support: `_docs/_reports/attack-chain-automated-evidence-20260607-current.md` is `Result: PASS`.
- Attack Chain manual verification: `_docs/_reports/attack-chain-verification-20260607-manual-pending.md` is `Result: FAIL`; verifier/evidence are missing.
- Security signoff: `_docs/_review/20260607-security-signoff.md` is `UNSIGNED`.
- Gray observation: `_docs/_reports/gray-observation-20260607-not-started.md` is `Result: FAIL`; first gray release has not started.
- Aggregate release gate: `_docs/_reports/release-gate-audit-20260607-hosted-ci-pass.md` is `Result: FAIL`; Hosted CI is closed, while staging, Attack Chain A/B/C, security signoff, and gray observation remain open.

## Execution Rule

Do not treat this bridge as a scope rewrite. It only makes the active CC plan discoverable from the `v1` repo. Implementation and audit continue to use current worktree evidence, command output, and release gate reports as authoritative proof.
