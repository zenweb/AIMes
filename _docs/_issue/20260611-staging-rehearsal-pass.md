# 2026-06-11 Issue: Docker unavailable staging blocker resolved

## 症状

- 旧证据 `_docs/_reports/staging-rehearsal-20260607-engine-unavailable.md` 显示 Docker daemon 不可用，PostgreSQL/staging release gate 为 FAIL。
- 当前 Codex 会话最初也遇到 `dockerDesktopLinuxEngine` pipe 不存在；启动 Docker Desktop 后 Docker API 恢复。

## 根因

Docker Desktop daemon 未在当前会话可用状态。项目代码和 staging 脚本不是根因。

## 修复/处置

- 启动 Docker Desktop。
- 重新运行 staging rehearsal，并使用本地已有依赖镜像。
- 生成当前 PASS 证据：`_docs/_reports/staging-rehearsal-20260611-current.md`。
- Docker 修复确认后再次运行 staging rehearsal，生成复跑 PASS 证据：`_docs/_reports/staging-rehearsal-20260611-docker-restored.md`。

## 当前状态

- Docker engine：PASS。
- PostgreSQL/staging：PASS。
- Docker-restored staging rehearsal：PASS。
- v1.0.0 aggregate release gate：仍 FAIL，因为 Attack Chain A/B/C、security signoff、gray observation 未关闭。
