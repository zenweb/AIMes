# 2026-06-06 Staging Rehearsal Recheck Next Actions

## 下一步

- 配置 Docker Desktop registry mirror 或 HTTPS proxy。
- 或预拉所需镜像：`postgres:16-alpine`、`redis:7-alpine`、`rabbitmq:4-management-alpine`、`qdrant/qdrant:latest`。
- 复跑 staging rehearsal，直到迁移和 `/live`、`/ready` 均通过。
