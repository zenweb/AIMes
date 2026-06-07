# Issue：PostgreSQL/Staging Rehearsal 镜像拉取阻断

## 状态

未解决。

## 问题

Docker engine 与 Compose 可用，但 staging rehearsal 在拉取外部依赖镜像时失败：

```text
docker pull postgres:16-alpine timed out after 45 seconds.
```

## 影响

PostgreSQL/staging gate 无法关闭。当前还没有迁移、API 启动、`/live`、`/ready` 的真实证据。

## 需要的处理

- 配置 Docker Desktop HTTPS proxy / registry mirror。
- 或预拉：
  - `postgres:16-alpine`
  - `redis:7-alpine`
  - `rabbitmq:4-management-alpine`
  - `qdrant/qdrant:latest`
