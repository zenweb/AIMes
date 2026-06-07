# Todo：PostgreSQL/Staging Rehearsal 复核下一步

## 需要先处理的环境项

- 配置 Docker Desktop 可用的 HTTPS proxy 或 registry mirror。
- 或手动预拉以下镜像：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`

## 复跑命令

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/run-staging-rehearsal.ps1 -ReportPath _docs/_reports/staging-rehearsal-20260607-rerun.md -ImagePullMode Missing -DockerPullTimeoutSeconds 90 -ReadyTimeoutSeconds 120
```

## 通过标准

- 外部依赖容器启动成功。
- EF migration 成功。
- API 容器启动成功。
- `/live` 返回 2xx。
- `/ready` 返回 2xx。

## 暂不继续

- 不重复短间隔拉取镜像，避免空转。
- 不把 Docker engine 可用误判为 staging gate 已关闭。
