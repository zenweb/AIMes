# 2026-06-12 Review：排产拖拽保存 PostgreSQL/staging 闭环

## 审查结论

通过。排产拖拽保存链路已经从前端真实 dhtmlx 证据、后端 API 集成测试，推进到真实 PostgreSQL/staging API 探针闭环。

## 关键判断

- 原先 `RescheduleItemAsync` 使用 no-tracking `GetByIdAsync` 读取聚合再 `Update()`，在 PostgreSQL `xmin` 并发 token 下存在写路径风险。
- 新增 `GetByIdForUpdateAsync` 只服务写路径，未破坏读路径 `AsNoTracking()` 约束。
- staging 首次重跑仍 500 是旧 API 镜像，没有承载新代码；重建镜像后 PATCH 变为 200。
- 后续 GET 400 不是排产落库失败，而是 LLM 网关构造过早依赖缺失的云 API key；延迟构造 Kernel 后读回闭环通过。

## 风险

- PostgreSQL 定向测试依赖本机 `AIMES_RUN_POSTGRES_TESTS=true` 和本地 Docker PostgreSQL；默认 CI 不会强制跑这类外部依赖测试。
- `scripts/run-staging-rehearsal.ps1` 当前不会自动 `docker compose build api`，验证当前代码前必须先构建新镜像，否则会误测旧镜像。

## 结论

排产拖拽保存的真实 PostgreSQL/staging 证据已补齐；此片符合“现有核心功能精品化优先”的约定。
