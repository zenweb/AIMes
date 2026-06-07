# Issue: Staging rehearsal blocked by Docker registry access

日期：2026-06-06

## 问题

Docker engine 已可用，但 staging rehearsal 无法拉取外部依赖镜像。

## 当前证据

- Registry mirrors: `[]`。
- HTTP proxy: `http.docker.internal:3128`。
- HTTPS proxy: `http.docker.internal:3128`。
- Local images: empty。
- `docker pull postgres:16-alpine` 在 25 秒诊断复跑中超时。

## 影响

- PostgreSQL/staging rehearsal 无法启动外部依赖。
- EF migration、API start、`/live`、`/ready` 均未执行到。
- v1.0.0 PostgreSQL/staging release gate 仍为 FAIL。

## 状态

- 已改进脚本诊断质量。
- 未关闭 staging gate。
