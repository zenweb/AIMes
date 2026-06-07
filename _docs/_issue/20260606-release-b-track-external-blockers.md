# 2026-06-06 Release B-track External Blockers

## Summary

v1.0.0 发布 B 轨仍被外部环境和人工证据阻断。`gh` 与 Docker engine 已可用，但不足以关闭 Hosted CI 或 PostgreSQL/staging gate。

## Blockers

1. Hosted CI
   - Current state: `gh auth status` PASS as `zenweb`.
   - Current state: `origin` is `https://git.code.tencent.com/zenweb/AIMes.git`.
   - Current state: `gh repo view zenweb/AIMes` FAIL; repo does not exist or is not visible.
   - Required: GitHub repo/remote, Actions run URL, run id, job summary.

2. PostgreSQL/staging
   - Current state: Docker engine PASS, server version `29.5.2`.
   - Current state: `docker pull postgres:16-alpine` timed out.
   - Required: Docker Hub proxy/mirror or pre-pulled dependency images.
   - Not reached: EF migrations, API start, `/live`, `/ready`.

3. Attack Chain A/B/C
   - Current state: automated support evidence exists.
   - Required: human verifier, verified timestamp, dated evidence for A/B/C.

4. Security signoff
   - Current state: UNSIGNED.
   - Required: human signer after A/B/C evidence is complete.

5. Gray observation
   - Current state: not PASS.
   - Required: first gray release plus 14 calendar days with P0/P1 = 0.

## Evidence

- `_docs/_reports/hosted-ci-20260606.md`
- `_docs/_reports/staging-rehearsal-20260606-local.md`
- `_docs/_reports/release-gate-audit-20260606.md`

## Stop Condition

Do not mark v1.0.0 release-ready until all five B-track gates are PASS in `_docs/_reports/release-gate-audit-*.md`.
