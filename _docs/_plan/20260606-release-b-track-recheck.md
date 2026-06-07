# 2026-06-06 B 轨发布闸门复检 Plan

## 成功标准

- 使用当前环境重新验证 hosted CI 和 staging gate。
- 若失败，报告必须说明真实阻断，而不是沿用旧的“gh/Docker 未配置”结论。
- 不把 B 轨失败误报为完成。

## 执行

1. 读取 B 轨脚本和旧报告。
2. 探测 `gh auth`、remote、`gh run list`。
3. 探测 Docker CLI、daemon、compose、镜像状态。
4. 启动 Docker Desktop daemon 并重跑 staging rehearsal。
5. 修复 staging 脚本 Missing 模式提前失败的问题。
6. 重跑 aggregate release gate。
7. 更新报告、changelog、review、todo、issue、plan。

## 结果

- `gh auth` 已通过，但 GitHub remote/Actions evidence 仍缺。
- Docker daemon 已可用，但 Docker Hub pull 仍因 HTTPS proxy/registry mirror 不可用而失败。
- Aggregate release gate 仍 FAIL。
