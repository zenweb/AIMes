# Plan：Release B-track prerequisite recheck

## 成功标准

- 非破坏性检查 Git remote、gh auth、Docker local images 和 Docker registry/proxy 状态。
- 判断 Hosted CI/staging 是否值得重跑。
- 若前置条件不满足，记录 fail-loud 证据，不重复运行已知阻塞脚本。

## 执行

1. 运行 `git remote -v`。
2. 运行 `gh auth status`。
3. 运行 `docker images --format "{{.Repository}}:{{.Tag}}"`。
4. 运行 `docker info --format ...` 查看 registry mirrors/proxy。
5. 根据结果决定不重跑 hosted CI/staging。

## 结论

- Hosted CI 前置条件未满足：remote 不是 GitHub。
- PostgreSQL/staging 前置条件未满足：依赖镜像未预拉取，registry mirrors 为空。
