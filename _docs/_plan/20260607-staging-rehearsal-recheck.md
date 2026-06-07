# Plan：PostgreSQL/Staging Rehearsal 复核

## 成功标准

- Docker engine 可用。
- Docker Compose 可用。
- 必要外部依赖镜像可用。
- PostgreSQL、Redis、RabbitMQ、Qdrant 启动成功。
- EF migration 成功。
- API 启动成功。
- `/live` 和 `/ready` 返回 2xx。

## 执行

1. 复核 Docker 与 Compose 版本。
2. 复核 Docker registry mirror、proxy 和本地 images。
3. 使用 `ImagePullMode Missing` 运行 staging rehearsal。
4. 若镜像拉取失败，停止重复尝试并记录环境阻断。

## 验证结果

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260607-recheck.md -ImagePullMode Missing -DockerPullTimeoutSeconds 45 -ReadyTimeoutSeconds 60
```

结果：`FAIL`。

失败点：`postgres:16-alpine` 拉取 45 秒超时，未执行到 EF migration、API start、`/live`、`/ready`。
