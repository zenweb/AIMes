# Issue：Staging Rehearsal 历史阻断已修复

## 状态

- Status: RESOLVED for PostgreSQL/staging gate.
- Overall release: still BLOCKED by non-staging gates.

## 已修复阻断

- Docker engine/API 原阻断：用户修复后已验证。
- 镜像拉取阻断：所需镜像已预拉并可用。
- Qdrant healthcheck 使用缺失 `curl`：已改为内置 bash TCP HTTP 探测。
- EF migration clean database 阻断：已修复 hstore、xmin、system_users 数据操作、jsonb cast。
- API startup 阻断：MassTransit v9 license 要求已通过退回 v8.5.7 解决。
- `/ready` RabbitMQ 阻断：healthcheck 包/API/URI scheme 已修复。

## 当前未解决阻断

- Attack Chain A/B/C manual verification。
- Security signoff。
- First gray release + 14-day observation。
