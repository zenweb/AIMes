# Release B-track Docker Engine Recheck

日期：2026-06-06

## 范围

- B 轨道发布闸门复核。
- 目标：在 Docker Desktop engine 可用后，复跑 PostgreSQL/staging rehearsal，并刷新 v1.0.0 release gate audit。
- 本报告不关闭任何发布闸门，只记录当前真实外部状态。

## Hosted CI 复核

- `gh auth status`
  - Result: PASS。
  - Account: `zenweb`。
  - Token scopes include `repo` and `workflow`。
- `gh repo list zenweb --limit 30 --json nameWithOwner,url,visibility,defaultBranchRef`
  - Result: PASS。
  - Visible repos include `zenweb/sg-e55d8fd2`、`zenweb/MaoYan`、`zenweb/szgjj`。
  - 未发现 `zenweb/AIMes`。
- `gh repo view zenweb/AIMes --json nameWithOwner,url,defaultBranchRef,viewerPermission`
  - Result: FAIL。
  - Reason: GitHub repository `zenweb/AIMes` 不存在或当前账号不可见。
- `gh run list --limit 5`
  - Result: FAIL。
  - Reason: 当前 git remote 不指向 GitHub host，`gh` 无法确定 base repo。
- `git remote -v`
  - Current origin: `https://git.code.tencent.com/zenweb/AIMes.git`。

结论：Hosted CI 闸门仍缺真实 GitHub repository / Actions run URL / run id / job summary。

## PostgreSQL/Staging 复核

- `docker version --format '{{json .}}'`
  - First result: FAIL。
  - Reason: Docker CLI 存在，但 engine 未启动，`Server` 为 `null`。
- 启动 Docker Desktop 后等待 engine。
  - Result: PASS。
  - Server version: `29.5.2`。
- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260606-docker-engine.md`
  - Result: FAIL。
  - New evidence packet: `_docs/_reports/staging-rehearsal-20260606-docker-engine.md`。
  - Failure point: `Pull external dependency images`。
  - Failure detail: `docker pull postgres:16-alpine timed out after 90 seconds`。
  - Migrations、API start、`/live`、`/ready` 未执行到。

结论：PostgreSQL/staging 闸门仍未关闭；阻断点已收敛到 registry/image pull 或网络代理/镜像源。

## Release Gate Audit

- `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260606-docker-engine.md -HostedCiReportPath _docs/_reports/hosted-ci-20260606.md -StagingReportPath _docs/_reports/staging-rehearsal-20260606-docker-engine.md -AttackChainReportPath _docs/_reports/attack-chain-verification-20260605.md -SecuritySignoffPath _docs/_review/20260605-security-signoff.md -GrayObservationReportPath _docs/_reports/gray-observation-20260605.md`
  - Result: FAIL。
  - New evidence packet: `_docs/_reports/release-gate-audit-20260606-docker-engine.md`。
  - Failing gates: Hosted CI、PostgreSQL/staging、Attack Chain A/B/C、Security signoff、Gray observation。

## 下一步

- Hosted CI：需要真实 GitHub repo/remote 和 Actions run evidence；不能从腾讯工蜂 remote 推断。
- PostgreSQL/staging：需要先解决 Docker registry 拉取超时，或预拉取/配置 registry mirror 后复跑 staging rehearsal。
- Attack Chain A/B/C：仍需 human verifier、`VerifiedAt`、A/B/C 三条手工 evidence。
- Security signoff：仍需 human signer 在 Attack Chain 手工验证后签字。
- Gray observation：仍需首次灰度开始、14 个自然日观察、P0/P1=0 证据。
