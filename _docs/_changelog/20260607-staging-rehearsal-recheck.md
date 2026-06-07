# 2026-06-07 PostgreSQL/Staging Rehearsal 复核

## 变更

- 复核 Docker/staging 发布闸门。
- Docker engine 与 Docker Compose 均可用：
  - Docker `29.5.2`
  - Docker Compose `v5.1.4`
- 运行 staging rehearsal：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260607-recheck.md -ImagePullMode Missing -DockerPullTimeoutSeconds 45 -ReadyTimeoutSeconds 60
```

## 结果

- 报告：`_docs/_reports/staging-rehearsal-20260607-recheck.md`
- Result: `FAIL`
- 失败点：`Resolve external dependency images`
- `postgres:16-alpine` 拉取 45 秒超时。
- 本地 Docker images 为空，registry mirrors 为 `[]`。

## 结论

PostgreSQL/staging gate 未关闭；尚未执行到 EF migration、API start、`/live`、`/ready`。
