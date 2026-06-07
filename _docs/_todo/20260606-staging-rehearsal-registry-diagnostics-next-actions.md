# Next Actions: Staging Rehearsal Registry Diagnostics

日期：2026-06-06

## B 轨道

- [ ] 配置 Docker Desktop 可用 HTTPS proxy 或 registry mirror。
- [ ] 预拉取 staging 依赖镜像：`postgres:16-alpine`、`redis:7-alpine`、`rabbitmq:4-management-alpine`、`qdrant/qdrant:latest`。
- [ ] 复跑 `scripts/run-staging-rehearsal.ps1`，直到执行到 EF migration、API start、`/live`、`/ready`。
- [ ] 复跑 release gate audit，确认 PostgreSQL/staging gate 是否从 FAIL 变为 PASS。

## B 轨道其他闸门

- [ ] Hosted CI：仍需真实 GitHub repo/Actions run URL/run id/job summary。
- [ ] Attack Chain A/B/C：仍需 human verifier、VerifiedAt 和三条手工 evidence。
- [ ] Security signoff：仍需 human signer。
- [ ] Gray observation：仍需首次灰度和 14 天 P0/P1=0。
