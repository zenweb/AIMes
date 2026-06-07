# B 轨道发布闸门复查报告

日期：2026-06-06

## 范围

- v1.0.0 B 轨道硬发布闸门。
- 本次只核验和推进 hosted CI、PostgreSQL/staging、聚合 release gate。
- 未修改业务代码。

## 执行命令

```powershell
gh auth status
git remote -v
gh repo view zenweb/AIMes --json nameWithOwner,url,isPrivate
gh run list --repo zenweb/AIMes --limit 5
docker version --format "Client={{.Client.Version}} Server={{.Server.Version}} OSType={{.Server.Os}}"
docker compose version
docker info --format "Mirrors={{json .RegistryConfig.Mirrors}} HTTP={{.HTTPProxy}} HTTPS={{.HTTPSProxy}}"
powershell -ExecutionPolicy Bypass -File scripts\run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260606-retry.md -ImagePullMode Missing -DockerPullTimeoutSeconds 180 -ReadyTimeoutSeconds 180
docker pull postgres:16-alpine
Test-NetConnection registry-1.docker.io -Port 443
Test-NetConnection auth.docker.io -Port 443
powershell -ExecutionPolicy Bypass -File scripts\run-hosted-ci-evidence.ps1 -ReportPath _docs/_reports/hosted-ci-20260606-retry.md
powershell -ExecutionPolicy Bypass -File scripts\run-release-gate-audit.ps1 -ReportPath _docs/_reports/release-gate-audit-20260606-retry.md -HostedCiReportPath _docs/_reports/hosted-ci-20260606-retry.md -StagingReportPath _docs/_reports/staging-rehearsal-20260606-retry.md -AttackChainReportPath _docs/_reports/attack-chain-verification-20260605.md -SecuritySignoffPath _docs/_review/20260605-security-signoff.md -GrayObservationReportPath _docs/_reports/gray-observation-20260605.md
```

## 结果

- Docker engine：PASS。
- Docker dependency images：FAIL。
- PostgreSQL/staging rehearsal：FAIL。
- GitHub CLI auth：PASS。
- GitHub repo/run discovery：FAIL。
- Hosted CI evidence：FAIL。
- Release gate audit：FAIL。

## 关键失败原因

- Docker Hub 访问失败：
  - `docker pull postgres:16-alpine` 报告 Docker Desktop 没有可用 HTTPS proxy，并直连 `registry-1.docker.io:443` 超时。
  - `Test-NetConnection registry-1.docker.io:443` 和 `auth.docker.io:443` 均失败。
- GitHub Actions 证据缺失：
  - 当前 `origin` 是 `https://git.code.tencent.com/zenweb/AIMes.git`。
  - `gh repo view zenweb/AIMes` 返回 repository not found。
  - `gh run list` 无法定位 GitHub base repo。

## 闸门状态

- `_docs/_reports/hosted-ci-20260606-retry.md`：Result FAIL。
- `_docs/_reports/staging-rehearsal-20260606-retry.md`：Result FAIL。
- `_docs/_reports/release-gate-audit-20260606-retry.md`：Result FAIL。

## 下一步

- 配置 GitHub remote 并触发 Actions，取得 RunUrl/RunId/job summary。
- 配置 Docker Desktop 可用 HTTPS proxy/registry mirror，或预拉 staging 所需四个镜像。
- 镜像和 GitHub Actions 证据就绪后再复跑 B 轨道脚本。
