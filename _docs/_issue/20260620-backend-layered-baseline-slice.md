# Issue: 后端分层基线仍缺 Docker Live Readback

## 现象
- 后端 Architecture / Unit / Integration 过滤切片均通过。
- Docker API 查询失败，无法启动或确认容器状态。

## 影响
- 可以继续用本地 dotnet 测试推进后端基线和审计入口稳定性。
- 不能闭合 PostgreSQL/staging live readback。

## 证据缺口
- 缺 `/api/v1/...` 在 Docker API + PostgreSQL 容器上的真实读写证据。
- 缺全量后端测试套件的最新红绿基线。

## 后续处理
- 恢复 Docker Desktop Linux Engine 在当前 shell 的可达性。
- 再跑 staging/live readback 或 release-gate 相关脚本。
