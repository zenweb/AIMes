# 2026-06-04 Release Gate Evidence Issues

## Hosted CI 仍缺授权远端证据

- 现象：`gh auth status` 已登录 `zenweb`；`gh run list --limit 5` 仍失败，因为当前仓库没有指向 GitHub host 的 remote；`git ls-remote origin` 返回 `Git:Project not found.`。
- 影响：无法证明 GitHub hosted runner 真实跑过 CI/eval，也无法提供可审计 RunUrl、RunId 和 job summary。
- 状态：GitHub CLI 登录项已解除；2026-06-04 23:05 CST 复核 `gh auth status -h github.com` 通过，`origin` 仍是腾讯工蜂，`gh repo view zenweb/AIMes` 仍不可解析。仍需确认或创建可访问的 GitHub 仓库 remote，并确保 Actions 有成功 run。

## PostgreSQL/staging 镜像拉取失败

- 现象：Docker 已可用；2026-06-04 23:33 CST 复跑 staging rehearsal 后，`docker compose` 拉取 `redis:7-alpine` 失败，错误为 Docker Desktop 没有 HTTPS proxy，直连 `registry-1.docker.io:443` 超时；`postgres`、`rabbitmq`、`qdrant` 拉取被中断。
- 影响：外部依赖未启动，EF migration、API 启动、`/live`、`/ready` 均无法进入真实 staging rehearsal。
- 状态：需要配置 Docker Desktop HTTPS proxy/镜像源，或预先拉取所需镜像。

## 人工和墙钟 gate 仍未完成

- Attack Chain A/B/C：仍缺 verifier、VerifiedAt 和三段 evidence。
- Security signoff：`20260604-security-signoff.md` 仍为 `UNSIGNED`。
- Gray observation：首次灰度仍未开始，14 天无 P0/P1 窗口无法关闭。
