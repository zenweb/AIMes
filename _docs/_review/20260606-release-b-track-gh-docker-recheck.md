# Review：B 轨 Hosted CI / Docker staging 复查

## 结论

本轮没有关闭 B 轨发布闸门，但把当前真实阻断点定位清楚了。继续重复运行同一组命令不会推进发布，除非先补 GitHub Actions remote/run evidence 和 Docker 镜像通道。

## 已验证

- `gh auth status`：已登录 GitHub.com，账号 `zenweb`。
- `gh repo view` / `gh run list`：失败，原因是当前 repo remote 不指向 GitHub host。
- `git remote -v`：`origin` 指向 `https://git.code.tencent.com/zenweb/AIMes.git`。
- `docker --version` / `docker compose version`：可用。
- `run-staging-rehearsal.ps1`：失败于 `Resolve external dependency images`。
- `docker pull postgres:16-alpine`：失败，错误提示 Docker Desktop 没有 HTTPS proxy，直连 Docker Hub 超时。

## 残余风险

- Hosted CI 缺 RunUrl、RunId、job summary。
- PostgreSQL/staging 缺可拉取或本地可用的 Postgres/Redis/RabbitMQ/Qdrant 镜像。
- Attack Chain A/B/C 仍缺人工 verifier、VerifiedAt 和 A/B/C 证据。
- Security signoff 仍是 `UNSIGNED`。
- 首次灰度和 14 天 P0/P1=0 观察窗口仍未开始。
