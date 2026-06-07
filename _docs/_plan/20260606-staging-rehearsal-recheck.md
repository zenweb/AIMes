# 2026-06-06 Staging Rehearsal Recheck Plan

## Success Criteria

- 外部依赖镜像可用。
- `docker compose up -d postgresql redis rabbitmq qdrant` 成功。
- EF migrations 成功。
- API `/live` 与 `/ready` 返回 2xx。

## Current Stop Condition

- 当前卡在 `postgres:16-alpine` 拉取超时，不能关闭 staging gate。
