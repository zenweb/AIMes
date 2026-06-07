# Next Actions: Release B-track Docker Engine Recheck

日期：2026-06-06

## B 轨道

- [ ] Hosted CI：提供或创建真实 GitHub repo/remote，触发 Actions run，保存 run URL / run id / job summary。
- [ ] PostgreSQL/staging：解决 `docker pull postgres:16-alpine` 超时；当前 registry mirror 为空且本地依赖镜像未预拉。配置 registry mirror 或预拉取 `postgres:16-alpine`、`redis:7-alpine`、`rabbitmq:4-management-alpine`、`qdrant/qdrant:latest` 后复跑 `scripts/run-staging-rehearsal.ps1`。
- [ ] Attack Chain A/B/C：补 human verifier、`VerifiedAt`、三条手工 evidence。
- [ ] Security signoff：Attack Chain 手工验证通过后，由 human signer 更新 security signoff packet。
- [ ] Gray observation：首次灰度开始后记录观察窗口，满 14 个自然日且 P0/P1=0 后生成 PASS evidence。

## A 轨道

- [ ] 不用 A 轨道前端/单测证据替代 B 轨道发布闸门。
