# 2026-05-31 阶段一 Sprint 0-3 验收审计

## 结论

- 阶段一代码侧已覆盖 Sprint 0-3 的主要本地验收门，并补上 Sprint 3 决策门缺失的 `100 工单排产 < 3s` 本地测试。
- 不能宣称 v1.0.0 发布完成：首次灰度、2 周无 P0/P1、安全自评签字、staging 外部依赖验证仍未完成。
- 不能宣称生产灰度已可直接执行：CI hosted runner、Docker build、OTLP/Seq/Tempo、RabbitMQ、Qdrant `/ready` 仍需真实环境验证。

## Sprint 0 审计

| 验收项 | 状态 | 证据 |
|---|---|---|
| JWT SigningKey 缺失或过短拒启动 | 已本地验证 | `JwtStartupValidationTests`，`20260530-sprint0-baseline.md` |
| Production CORS 禁止 `AllowAnyOrigin` | 已本地验证 | `CorsPolicyTests`，`Program.cs` |
| 5 个核心模块真实数据持久化 | 已本地验证 | Sprint 0/2 控制器与仓储测试 |
| dashboard 报表移除随机值 | 已本地验证 | `ReportControllerTests` 与架构门 |
| `eval.ps1` 读取真实 golden 数据 | 已本地验证 | `EvalScriptTests` |
| Production 不自动迁移，启动只校验 schema | 已本地验证 | `DatabaseStartupValidatorTests`，SOP 已更新 |
| E1 架构防火墙 | 已本地验证 | `MES.ArchitectureTests` |

## Sprint 1 审计

| 验收项 | 状态 | 证据 |
|---|---|---|
| 异常模块 URL 双前缀修复 | 已本地验证 | 前端 API 与 e2e 变更记录 |
| ChatPanel XSS escape/DOMPurify | 已本地验证 | `chat.spec.ts`，Sprint 1 review |
| 默认密码/空 hash 移除，首次改密 | 已本地验证 | `SystemUserTests`，`AdminControllerTests` |
| Refresh Token 哈希存储 | 已本地验证 | `AuthControllerTests` |
| SignalR 频道白名单与角色映射 | 已本地验证 | `NotificationHubChannelPolicyTests` |
| 6 个 Agent 每个 >= 5 单测 | 已本地验证 | `MES.Tests.Unit` AI 测试集 |
| Metrics 异常走结构化日志 | 已本地验证 | Sprint 1 review |
| 登录按 IP + 用户名限流 | 已本地验证 | `AuthRateLimitPartitionKeyTests` |

## Sprint 2 审计

| 验收项 | 状态 | 证据 |
|---|---|---|
| 仓储读查询 `AsNoTracking()` | 已本地验证 | 架构门与仓储测试 |
| `ScheduleRepository` 使用 `AsSplitQuery()` 并稳定分页 | 已本地验证 | `ScheduleRepositoryTests` |
| Scheduling/Equipment/Admin 数据库分页 | 已本地验证 | `SchedulingAppServiceTests` 等 |
| Anomaly/Inventory/Purchase 关键事务 | 已本地验证 | `AnomalyTransaction`、`InventoryTransaction`、`PurchaseTransaction` 测试 |
| AppService 传播 `CancellationToken` | 已本地验证 | Sprint 2 H1 review |
| 并发 token 与索引/jsonb 迁移 | 已本地验证 | Sprint 2 M7/M8-M10 review |

## Sprint 3 审计

| 验收项 | 状态 | 证据 |
|---|---|---|
| `/api/v1/*` 默认鉴权，匿名白名单收敛 | 已本地验证 | `EndpointAuthorizationTests`，H6 架构门 |
| 写端点审计记录与敏感字段脱敏 | 已本地验证 | `AuditRedactionTests`，H7/H8 架构门 |
| Purchase 写端点验证过滤器 | 已本地验证 | H9 架构门 |
| 状态变更审计进入业务 UoW | 已本地验证 | `PurchaseAppServiceTests`，`InventoryAppServiceTests`，事务仓储测试 |
| `OperationCanceledException` 不进 500 | 已本地验证 | M11 测试 |
| Dockerfile 非 root、digest pin、cache-friendly | 已静态验证 | H22 架构门；本机无 Docker，未 build |
| 根 CI 合并且包含质量门 | 已静态验证 | H20 架构门；未触发 GitHub Actions |
| 最小可观测性 | 已静态/本地构建验证 | `Sprint3GrayReleaseObservability` 架构门，`dotnet build` |

## Sprint 3 决策门

| 决策项 | 状态 | 说明 |
|---|---|---|
| Sprint 0-3 全部验收标准通过 | 部分外部待验证 | 本地门通过；CI/staging/Docker 尚未实跑 |
| 性能基线 `100 工单排产 < 3s` | 已本地验证 | 新增 `GenerateInitialSchedule_OneHundredWorkOrders_CompletesUnderGrayReleaseGate`，单测通过 |
| SOP 完整 | 已更新，待演练 | `_docs/SOP.md` 已覆盖部署、显式迁移、回滚、健康检查、日志/OTLP、故障排查 |
| 最小可观测性就绪 | 已接线，待 staging | Console/File/OTLP、EF/Npgsql trace、`/live`/`/startup`/`/ready` 已接入；外部后端未验证 |

## v1.0.0 发布判据

| 判据 | 状态 |
|---|---|
| Showstopper + Critical 闭环 | 本地证据充分，外部审计待补 |
| Sprint 0-3 全部验收标准通过 | 外部待验证 |
| README/SOP/ADR/CHANGELOG 完整 | SOP 已补；README/ADR 仍需发布前复核 |
| 安全自评 + 攻击链 A/B/C 人工验证 + 签字 | 未完成 |
| 首次灰度后 2 周无 P0/P1 | 未开始 |

## 验证命令

- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore --filter "FullyQualifiedName~SchedulingRuleEngineTests.GenerateInitialSchedule_OneHundredWorkOrders_CompletesUnderGrayReleaseGate"`：1/1 passed。
