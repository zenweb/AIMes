# 2026-06-06 B 轨道发布闸门复查 Plan

## 成功标准

- hosted CI 报告包含 GitHub Actions RunUrl、RunId、job summary，并且 `gh run list` 能看到对应 RunId。
- staging rehearsal 报告包含 Docker version、external dependencies up、EF migrations、API up、`/live` 与 `/ready` 2xx。
- release gate audit 中 Hosted CI 与 PostgreSQL/staging 至少不再因为环境缺口失败。
- 不把 A 轨道测试通过误报为 v1.0.0 发布可用。

## 本次执行

1. 读取 B 轨道脚本和 docker-compose，确认 staging 会启动真实外部依赖并跑 EF migrations。
2. 核验 `gh`、git remote、Docker engine、Docker proxy、local images。
3. 运行 staging rehearsal。
4. 运行 hosted CI evidence。
5. 运行聚合 release gate audit。
6. 落账报告和下一步。

## 结果

- Docker engine 可用，但 Docker Hub HTTPS 拉取失败。
- `gh` 已认证，但当前 repo 没有 GitHub remote，且 `zenweb/AIMes` 在 GitHub 不存在或不可见。
- B 轨道仍为 FAIL。
