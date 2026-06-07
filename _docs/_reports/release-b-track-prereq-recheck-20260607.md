# Release B-track prerequisite recheck

日期：2026-06-07

## 目标

低成本复查 Hosted CI 和 PostgreSQL/staging 的前置条件是否已变化，避免在已知外部阻塞未解除时反复重跑门禁脚本。

## 检查结果

### Git remote

```text
origin  https://git.code.tencent.com/zenweb/AIMes.git (fetch)
origin  https://git.code.tencent.com/zenweb/AIMes.git (push)
```

结论：`origin` 仍指向腾讯代码仓库，不是 GitHub remote。Hosted CI evidence 仍无法取得 GitHub Actions hosted runner `RunUrl`、`RunId` 和 job summary。

### gh auth

```text
github.com
  Logged in to github.com account zenweb
  Git operations protocol: https
  Token scopes: gist, read:org, repo, workflow
```

结论：GitHub CLI 登录已可用，但当前仓库 remote 未指向 GitHub，`gh run` 仍缺 base repo。

### Docker local images

```text
docker images --format "{{.Repository}}:{{.Tag}}"
```

输出为空。

结论：staging rehearsal 依赖镜像仍未预拉取。

### Docker registry/proxy

```text
Mirrors=[] HTTP="http.docker.internal:3128" HTTPS="http.docker.internal:3128"
```

结论：registry mirrors 仍为空。结合最新 staging 报告，`postgres:16-alpine` 拉取仍是当前 blocker。

## 本轮决策

- 不重跑 hosted CI evidence：GitHub remote 前置条件未满足。
- 不重跑 staging rehearsal：本地依赖镜像为空，registry mirror 未配置，已知 `postgres:16-alpine` 拉取阻塞未解除。
- 保持 release gate audit 红灯，不用 A 轨浏览器证据或本地安全自评替代 B 轨硬门禁。

## 待解除前置条件

- Hosted CI：将 remote 指向真实 GitHub 仓库，或提供可被 `gh` 识别的 GitHub base repo。
- PostgreSQL/staging：配置 Docker Desktop HTTPS proxy/registry mirror，或预拉取：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`
