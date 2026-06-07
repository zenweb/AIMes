# Plan：Release B-track prerequisite recheck

## 成功标准

- 非破坏性检查 GitHub Actions、gh auth、Docker engine 和 release gate 状态。
- 判断 Hosted CI/staging 是否值得重跑。
- 若前置条件不满足，记录 fail-loud 证据，不重复运行已知阻塞脚本。

## 执行

1. 读取最新 GitHub Actions run。
2. 读取 `_docs/_reports/hosted-ci-20260607.md`。
3. 运行 `docker --version`、`docker compose version` 和 `docker info --format ...`。
4. 根据结果决定不重跑 staging。

## 结论

- Hosted CI 已满足：`_docs/_reports/hosted-ci-20260607.md` 为 `Result: PASS`，最新 GitHub Actions CI run `27089905065` 和 Agent Evaluation run `27089905061` 均为 `success`。
- PostgreSQL/staging 前置条件未满足：Docker CLI/Compose 存在，但 Docker Desktop Linux engine 当前不可用，`docker info` 无法连接 `dockerDesktopLinuxEngine`。
