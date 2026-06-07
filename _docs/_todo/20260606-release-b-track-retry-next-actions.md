# 2026-06-06 B 轨道发布闸门 Next Actions

## 需要人工/环境先处理

- 建立或确认 GitHub 仓库，并把当前 repo 增加 GitHub remote。
- 推送当前分支或 release 候选 commit 到 GitHub。
- 触发 GitHub Actions hosted CI，并提供/记录 RunUrl、RunId、job summary。
- 修复 Docker Desktop 镜像拉取路径：配置真实可用 HTTPS proxy、registry mirror，或手动预拉以下镜像：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`
- 镜像可用后复跑：
  - `powershell -ExecutionPolicy Bypass -File scripts\run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260606-pass-candidate.md -ImagePullMode Missing -DockerPullTimeoutSeconds 180 -ReadyTimeoutSeconds 180`

## 仍需人工签署

- 完成 Attack Chain A/B/C 手动验证，填 verifier、VerifiedAt、每条链路证据。
- 完成 security signoff，把 `Status/Decision` 改为 `SIGNED` 并附证据。
- 首次灰度后等待 14 calendar days，记录 P0/P1=0 观察证据。
