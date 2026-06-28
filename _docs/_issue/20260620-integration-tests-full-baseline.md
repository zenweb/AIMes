# Issue: Sprint 0.0 仍缺前端与环境级基线

## 当前状态
- 后端 ArchitectureTests 全量通过：118 passed。
- 后端 Unit Tests 全量通过：444 passed。
- 后端 Integration Tests 全量通过：203 passed。

## 仍缺
- 前端 Unit/coverage/e2e 全量。
- Docker/PostgreSQL live readback。
- hosted CI 当前 HEAD 证据。

## 处理建议
- 下一步切到前端单元基线，或先恢复 Docker API 后补 staging/live readback。
- 不要把本地 Integration 通过误报为 Docker staging PASS。
