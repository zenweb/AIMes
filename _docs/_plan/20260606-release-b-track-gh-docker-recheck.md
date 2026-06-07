# Plan：B 轨 Hosted CI / Docker staging 复查

## 成功标准

- Hosted CI：有真实 GitHub Actions RunUrl、RunId、job summary，并且脚本报告 `Result: PASS`。
- PostgreSQL/staging：依赖镜像可用，Docker compose 启动依赖和 API，EF migrations 成功，`/live` 与 `/ready` 返回 2xx/3xx，脚本报告 `Result: PASS`。
- Release gate audit：B 轨证据包被汇总，准确显示 PASS/FAIL。

## 本轮执行

1. 读取 Hosted CI、staging、release gate 脚本。
2. 检查 `gh auth status`、Git remote、Docker version/proxy/images。
3. 跑 Hosted CI evidence 脚本。
4. 跑 staging rehearsal 脚本。
5. 跑 release gate audit 汇总。
6. 记录 changelog、review、todo、issue、plan。

## 本轮结果

- Hosted CI：FAIL，当前 repo remote 不是 GitHub，且缺 RunUrl/RunId/job summary。
- PostgreSQL/staging：FAIL，Docker Hub 镜像拉取失败。
- Release gate audit：FAIL。

## 下一次进入条件

- 当前仓库能通过 GitHub remote 定位 Actions run，或用户直接提供 RunUrl/RunId/job summary。
- Docker Desktop HTTPS proxy/registry mirror 可用，或四个依赖镜像已在本地可用。
