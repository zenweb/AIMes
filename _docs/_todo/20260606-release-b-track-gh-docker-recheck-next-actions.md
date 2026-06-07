# Todo：B 轨 Hosted CI / Docker staging 下一步

## 需要用户/环境处理

- 为当前仓库配置 GitHub remote，或提供真实 GitHub Actions RunUrl、RunId、job summary evidence。
- 在 Docker Desktop 中配置可用 HTTPS proxy 或 registry mirror。
- 或手动预拉/导入这些镜像：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`

## 环境处理后重跑

```powershell
.\scripts\run-hosted-ci-evidence.ps1 -ReportPath "_docs/_reports/hosted-ci-github-actions-evidence-20260606-after-remote.md" -RemoteName origin -RunUrl "<GitHub Actions run URL>" -RunId "<run id>" -Evidence "<job summary>"
.\scripts\run-staging-rehearsal.ps1 -ReportPath "_docs/_reports/staging-rehearsal-20260606-after-docker-proxy.md" -ImagePullMode Missing
.\scripts\run-release-gate-audit.ps1 -ReportPath "_docs/_reports/release-gate-audit-20260606-after-b-track-recheck.md" -HostedCiReportPath "_docs/_reports/hosted-ci-github-actions-evidence-20260606-after-remote.md" -StagingReportPath "_docs/_reports/staging-rehearsal-20260606-after-docker-proxy.md" -AttackChainReportPath "_docs/_reports/attack-chain-verification-20260606-recheck.md" -SecuritySignoffPath "_docs/_review/20260605-security-signoff.md" -GrayObservationReportPath "_docs/_reports/gray-observation-20260602.md"
```

## 不建议继续做的事

- 不要在没有 GitHub remote/run evidence 时反复跑 Hosted CI gate。
- 不要在 Docker daemon 仍无法拉 Docker Hub 镜像时反复跑 staging rehearsal。
