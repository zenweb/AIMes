# 2026-05-31 Sprint 3 下一步

## 已完成

- H6：非 `/auth` 的 `/api/v1/*` route group 默认 `RequireAuthorization()` 已加运行时集成测试与架构门。
- H6：测试认证器支持显式匿名请求，避免默认测试身份掩盖未登录访问行为。
- H6 支撑修复：`Equipment` 模型种子补齐 shadow concurrency token `version`。
- H7：Admin/Bom/Inventory/Purchase/Employee/Routing 写端点已补 `AuditEndpointFilter` 并加架构门。
- H8：审计脱敏已补单元测试与 Admin 运行时集成测试，覆盖 password/token/secret/apiKey 等敏感字段。
- H9：Purchase submit/confirm/cancel 已补 `ValidationEndpointFilter` 并加架构门。
- H10：所有 endpoint 文件中的 Minimal API mapping 已由架构门要求 `WithTags(...)`，并补齐 Equipment/Scheduling 两个遗漏。
- M11：`ExceptionMiddleware` 已单独处理 `OperationCanceledException`，返回 499 且不写 500 ProblemDetails。
- M12：Domain 实体规则违反已收敛到 `DomainRuleViolationException`，API 显式映射为 400。
- H4：旧 MVC `ValidationFilter` / `AuditAttribute` 死代码已删除，并加架构门防回流。
- H3：`AuditEndpointFilter` 已改为通过 `IAuditLogAppService` 写审计，并加架构门防止直接 EF 持久化回流。
- H21：根 `Directory.Build.props` 已移除 `NU1903` 抑制；`Newtonsoft.Json` 传递高危漏洞已通过 `13.0.4` override 修复。
- H22：`Dockerfile` 已固定基础镜像 digest，后端/前端构建改为 cache-friendly restore/install 分层，runtime 切换非 root，并新增 `.dockerignore` 与架构门。
- H20：CI 已收敛到根 `.github/workflows/ci.yml`；删除不生效的 `v1/.github/workflows/ci.yml`，并把 format、ArchitectureTests、Unit/Integration、前端 lint/build、Docker build、依赖审计纳入根入口。
- 审计事务分层：Purchase submit/confirm/cancel 与 Inventory stock-in/stock-out/transfer/adjust 已在业务 UoW 内写内联审计；过滤器审计保留为事务外操作追踪；`AuditLogRepository.AddAsync` 不再自提交。
- 灰度前最小可观测性：Serilog 已接 Console/File/OTLP，OpenTelemetry 已接 EF Core/Npgsql trace，健康检查已拆 `/live`、`/ready`、`/startup`，并纳入 RabbitMQ/Qdrant readiness。
- Sprint 3 本地收口：完整架构测试、相关单元/集成测试、API build/publish、diff check 已串行验证。

## 下一步

- H20/H22 跟进：等待 GitHub Actions 实跑确认 hosted runner 上的 Docker build 与 npm audit 结果。
- 灰度跟进：在 staging 验证 OTLP/Seq/Tempo/RabbitMQ/Qdrant 的真实连通性和 `/ready` 结果。
