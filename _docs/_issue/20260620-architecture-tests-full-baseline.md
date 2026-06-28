# Issue: Sprint 0.0 仍缺非架构层全量基线

## 当前状态
- ArchitectureTests 全量通过：118 passed。

## 仍缺
- 后端 Unit 全量。
- 后端 Integration 全量。
- 前端 Unit/coverage/e2e 全量。
- Docker/PostgreSQL live readback。
- hosted CI 当前 HEAD 证据。

## 处理建议
- 继续按层串行扩大基线，优先跑后端 Unit 全量，再跑 Integration。
- Docker API 恢复前，不声称 staging/live readback PASS。
