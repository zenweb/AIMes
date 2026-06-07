# 2026-05-31 Sprint 3 H6 Review

## 审查结论

- H6 目标是默认保护 `/api/v1/*`，只白名单 `/auth` 和健康检查。
- `Program.cs` 中非 `/api/v1/auth` 的 API route group 已具备 group-level `RequireAuthorization()` 或带策略的 `RequireAuthorization("Admin")`。
- 新增架构门可防止后续新增 API group 时遗漏默认授权。
- 新增运行时集成测试覆盖匿名请求实际响应，避免只靠源码扫描。

## 风险与边界

- 本轮集成测试抽样验证 `/api/v1/equipment` 与 `/api/v1/dashboard`，没有逐个请求全部业务端点；完整覆盖由架构门承担。
- SignalR Hub `/hubs/*` 不属于本计划 H6 的 `/api/v1/*` 验收范围，后续如需要可单独审计 Hub 授权。
- 本轮发现并修复 `Equipment` 模型种子与 shadow `version` 的漂移；迁移/快照历史漂移仍按前序 issue 单独跟踪。

## 验证记录

- H6 集成测试：4/4 通过。
- H6 架构门：1/1 通过。
- 完整架构测试：15/15 通过。
- 后端 API build：0 warnings / 0 errors。
- `git diff --check`：通过，仅 LF/CRLF 提示。
