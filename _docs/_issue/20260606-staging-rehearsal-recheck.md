# 2026-06-06 Staging Rehearsal Recheck Issue

## Issue

PostgreSQL/staging rehearsal 仍无法关闭。Docker 可用，但外部依赖镜像未能拉取，当前失败点为 `postgres:16-alpine`。

## Status

- B 轨 PostgreSQL/staging：Open。
- 阻断类型：Docker registry/proxy/mirror 或镜像预拉缺失。
