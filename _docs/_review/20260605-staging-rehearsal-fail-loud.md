# 2026-06-05 Staging Rehearsal Fail-Loud Review

## Findings

- 审计结论：PostgreSQL/staging release gate 仍未关闭。
- 证据：Docker Desktop engine 已启动，`docker --version` 与 `docker compose version` 均可执行。
- 证据：`docker pull rabbitmq:4-management-alpine` 直连 Docker Hub 失败，错误指向 Docker Desktop 未配置 HTTPS proxy，无法访问 `registry-1.docker.io:443`。
- 证据：更新后的 `_docs/_reports/staging-rehearsal-20260605-local.md` 在 `Pull external dependency images` 段落 fail loud，没有进入 EF migrations、API 启动或健康检查。
- 证据：`_docs/_reports/release-gate-audit-20260605.md` 仍为 `Result: FAIL`，且 PostgreSQL/staging evidence packet 为 `FOUND` 但 gate 为 `FAIL`。

## Residual Risk

- 不能用 Docker CLI 可用、Docker Desktop engine ready 或本地测试通过替代真实 staging rehearsal。
- 需要配置 Docker Desktop HTTPS proxy/镜像源，或预先拉取 compose 所需镜像后复跑。
- Hosted CI、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察也仍为 release gate 红项。
