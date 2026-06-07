# 2026-05-31 Sprint 6 下一步

## 已完成

- 6.7 局部：新增 backend `Console.Write*` 架构门禁。
- 6.7 局部：`MES.Api/Program.cs` 启动横幅已迁移到 `ILogger<Program>` 结构化日志。
- 6.7 局部：新增 `.github/pull_request_template.md`，覆盖 `static List`、`Console.Write*`、`.Result`、`.Wait()` 和 `ArchitectureTests` 人工检查。
- 6.7 局部：新增 PR 模板架构门禁，防止模板缺失或遗漏关键检查项。
- 6.7 局部：相关架构门禁与 `MES.Api` 构建已通过。
- 6.2 局部：`TestAuthHandler` 已支持多角色参数化，`X-Test-Role` 多值/逗号分隔会展开为多个 role claim。
- 6.2 局部：新增多角色授权集成测试，覆盖 `Operator` + `Admin` 身份访问 Admin-only 端点。
- 6.3 局部：新增 `IntegrationSerialCollection`，集成测试 `*Tests` 类已显式标注 `[Collection("IntegrationSerial")]`。
- 6.3 局部：新增架构门禁，防止新增集成测试类遗漏显式 serial collection。
- 6.4 局部：`PerformanceTests` 已迁到 `PerformanceTestWebApplicationFactory`，使用独立 `Performance_Test_DB`。
- 6.4 局部：新增 `PerformanceTestDataSeedFilter` 和性能测试隔离架构门禁。
- 6.5：E2E `waitForTimeout` 已清零，并新增硬等待架构门禁。
- 6.5：`dashboard.spec.ts`、`modules.spec.ts`、`demo-asset-capture.spec.ts` 已通过针对性 E2E 验证。
- 6.6 局部：已引入 `vitest`、`@vue/test-utils`、`jsdom` 和 `npm run test:unit`。
- 6.6 局部：新增 `auth` store 单测，覆盖后端登录持久化、离线 demo 登录、Vue 组件响应式登出。
- 6.6 局部：`npm run lint` 已纳入 `tests/unit` 和 `vitest.config.ts`。
- 6.6 局部：新增 `error-message` 单测，覆盖 API message、ProblemDetails title 和 fallback。
- 6.6 局部：新增 `offline-demo-mode` 单测，覆盖 demo mode 开关、离线错误识别、日志抑制和 `/scheduling/` 资产路径。
- 6.6 局部：根 CI frontend job 已接入 `npm run test:unit`。
- 6.6 局部：新增 `schedule-feedback-sync` 单测，覆盖排产反馈 snapshot 与 OTD 证据链镜像。
- 6.6 局部：新增 `risk-action-sync` 单测，覆盖风险处置 trace、OTD 证据链镜像、backend-first fallback、去重、截断和坏 JSON 自清理。
- 6.8 局部：新增 Cobertura 覆盖率阈值脚本，已验证低于阈值会失败。
- 6.8 局部：根 CI backend job 已接入 Coverage Threshold，当前阈值 line `10%` / branch `20%`。
- 6.9 局部：`v1` 仓库根新增 `CONTRIBUTING.md` 与 `SECURITY.md`。
- 6.9 局部：`README.md` 文档索引已补充贡献与安全入口。
- 6.10 局部：新增 `_docs/_adr/ADR-001` 至 `ADR-006` 与 `ADR-010`。
- 6.11 局部：新增 `VERSION`，当前为 `0.1.0-remediation.20260531`。
- 6.11 局部：`CHANGELOG.md` 新增 `Release Process` 和 `Unreleased` 治理变更汇总。
- 6.1 局部：`BomAppService` 新增 3 条单测，并修正齐套计算忽略 `LossRate` 的缺口。
- 6.1 局部：`BomExplosionService` / `MaterialKittingChecker` 增加损耗率单测，并统一排产齐套源头需求口径。
- 6.1 局部：`AnomalyAppService` 新增 4 条单测，并修正严重度输入大小写/空格导致紧急异常降级的缺口。
- 6.1 局部：`AuditLogAppService` 新增 3 条单测，并修正 `AuditEndpointFilter` 审计写入未落库的缺口。
- 6.1 局部：`RoutingAppService` 新增 3 条单测，并修正工艺路线创建丢失步骤工时/设备/质检/参数和乱序步骤排序漂移的缺口。
- 6.1 局部：`KnowledgeAppService` 新增 3 条单测，并修正空白/短文档分块无限循环的缺口。
- 6.1 局部：`DashboardKpiService` 新增 3 条单测，并统一 Dashboard / Report OTD 口径，把超期未完成工单纳入排产达成率分母。
- 6.1 局部：`RiskAppService` 新增 3 条单测，并把风险面板生成时间改为 UTC。
- 6.1 局部：已复核 `ExportAppService` 在 Application 层仅为接口，真实实现位于 Infrastructure；不为接口强行补 Application AppService 单测。
- 6.1 局部：`ScheduleAgentService` 新增 3 条单测，并修正策略拒绝审计 payload 缺默认拒绝原因的缺口。
- 6.1/ScheduleAgent evidence 局部：新增风险处置 trace evidence 映射单测，并让后端 evidence 排序时间使用 `RiskActionTraceDto.CreatedAt` 事件时间。
- 6.1/ScheduleAgent evidence 局部：新增助手动作审计 evidence 映射单测，并让后端 evidence 排序时间使用 `AssistantActionAuditRecordDto.CreatedAt` 动作时间。
- 6.1/ScheduleAgent evidence 局部：新增异常分流 evidence 映射单测，并让后端 evidence 排序时间使用 `AnomalyDispatchRecordDto.CreatedAt` 分流事件时间。
- 6.1/ScheduleAgent evidence 局部：新增现场态势升级 evidence 映射单测，并让后端闭环记录使用 `MonitoringSituationEscalationDto.ClosedAt` 排序，未闭环记录使用 `CreatedAt`。
- 6.1/ScheduleAgent evidence 局部：新增风险 SLA 复核 evidence 映射单测，并让后端闭环记录使用 `RiskSlaReviewRecordDto.ClosedAt` 排序，未闭环记录使用 `CreatedAt`。
- 6.1/ScheduleAgent evidence 局部：新增交付恢复包 evidence 映射单测，并让后端闭环记录使用 `AssistantRecoveryPackageDto.ClosedAt` 排序，未闭环记录使用 `CreatedAt`。
- 6.1/ScheduleAgent evidence 局部：新增助手异常处置包 evidence 映射单测，并让后端 evidence 排序时间使用 `AssistantAnomalyDispositionPackageDto.CreatedAt` 创建事件时间。
- 6.1/ScheduleAgent evidence 局部：新增助手工程约束包 evidence 映射单测，并让后端 evidence 排序时间使用 `AssistantEngineeringConstraintPackageDto.CreatedAt` 创建事件时间。
- 6.1/ScheduleAgent evidence 局部：新增生产异常事件 evidence 映射单测，并让后端 evidence 排序时间使用 `ProductionAnomalyEventDto.DetectedAt` 发现事件时间。
- 6.1/ScheduleAgent evidence 局部：新增人力调拨 evidence 映射单测，并让后端 evidence 排序时间使用 `LaborReassignmentRecordDto.CreatedAt` 调拨事件时间。
- 6.1/ScheduleAgent evidence 局部：新增人员资质阻断 evidence 映射单测，并让后端释放态使用 `LaborQualificationBlockRecordDto.ReleasedAt` 排序，未释放记录使用 `CreatedAt`。
- 6.1/ScheduleAgent evidence 局部：新增扫码追溯 evidence 映射单测，并让后端 evidence 排序时间使用 `BarcodeScanEvidenceRecordDto.CreatedAt` 扫码事件时间。
- 6.1/ScheduleAgent evidence 局部：新增质量 CAPA 闭环 evidence 映射单测，并让后端 evidence 排序时间使用 `QualityCapaClosureDto.VerifiedAt` 验证事件时间。
- 6.1/ScheduleAgent evidence 局部：新增 Agent 配置审批 evidence 映射单测，并让后端决策态使用 `AgentConfigApprovalRecordDto.DecidedAt` 排序，未决策记录使用 `SubmittedAt`。
- 6.1/ScheduleAgent evidence 局部：新增 Agent 推荐 `ScheduleRequest` evidence 映射单测，并让 AddEvidenceLink 路径显式使用 `AgentDecision.CreatedAt` 排序。
- 6.1/ScheduleAgent evidence 局部：`ScheduleAgentService` 真实 evidence upsert 中 `CreatedAt = DateTime.UtcNow` 已清零；剩余 `DateTime.UtcNow` 属于 `WriteAuditAsync` 审计写入时刻。
- 6.1/ScheduleAgent evidence 局部：新增 `Sprint6ScheduleAgentEvidenceLinks_ShouldSetBusinessEventTimestamp` 架构门禁，防止新增 `AgentEvidenceLink` 漏写业务事件时间或回退到保存时刻。
- 6.1/ScheduleAgent evidence 局部：新增风险处置查询防回归测试，锁定坏 JSON evidence 跳过和默认 `take = 12`。
- 6.1/ScheduleAgent code hygiene 局部：新增 null-forgiving 架构门禁，并移除 `ScheduleAgentService` 查询映射链路中的 `item!`。
- 6.7 局部：新增跨文件 null-forgiving 架构门禁，覆盖 `SchedulingContextProvider` 与 `ReportEndpoints`。
- 6.7 局部：已移除 `SchedulingContextProvider.RouteCode!` 和 `ReportEndpoints.ActualEndDate!`，改用可空安全投影。
- 6.7 局部：新增 Admin/Token 仓储 null-forgiving 架构门禁，覆盖 `NotificationConfigRepository` 与 `RefreshTokenRepository`。
- 6.7 局部：已移除通知配置和刷新令牌仓储中的 DbSet `!` 压制。
- 6.7 局部：新增 Auth token claim null-forgiving 架构门禁，覆盖 `AuthEndpoints` 的 `role!` / `displayName!`。
- 6.7 局部：`AuthEndpoints.LoginAsync` 已改为认证成功后显式收窄 `role` 与 `displayName`，缺失时不签发 token。
- 6.7 局部：新增 ExceptionMiddleware ProblemDetails.Status null-forgiving 架构门禁，覆盖 `problem.Status!.Value`。
- 6.7 局部：`ExceptionMiddleware` 已改为显式读取 `ProblemDetails.Status`，缺失时 fail loud，不再使用 `!` 压制。
- 6.7 局部：新增 Endpoint handler `default!` 架构门禁，覆盖 `MES.Api/Endpoints/*.cs` 中的 `= default!`。
- 6.7 局部：已通过参数重排移除 `AuditLog`、`Inventory`、`Bom`、`Quality`、`Knowledge` 与 `Scheduling.GetWorkOrders` handler 中的 `default!`。
- 6.7 局部：后端生产代码 `identifier!` / `default!` 扫描已无命中。
- 6.1 局部：`OperationService` 新增 3 条单测，并修正开工未同步启动关联工单导致完工上报断链的缺口。
- 6.1 局部：`ProductionControllerTests` 新增扫码 → 开工 → 完工正向集成回归，验证工单、工序执行、报工记录最终状态。
- Sprint 2/B4 延伸：新增生产报工仓储自提交门禁，`OperationRepository` 与 `WorkOrderRepository.UpdateAsync` 不再在 UoW 事务边界内自 `SaveChangesAsync`。
- Sprint 2/B4 延伸：`OperationService.ScanAsync` 写路径已纳入 `IUnitOfWork.ExecuteAsync`，修复仓储去自提交后扫码执行记录不落库的问题。
- Sprint 2/B4 延伸：新增 SQLite in-memory 关系型 provider 回滚测试，验证 `CompleteAsync` 报工写入失败时工序执行、工单完成数和报工记录不会部分提交。

## 下一步

- 继续推进 6.6：扩展前端关键 store/composable 单测，优先覆盖更多业务 store 或剩余高价值 sync util。
- 继续推进 6.1：对照 Sprint 6 “9 个无测 AppService 各 3 个单测”逐项复核，当前已补 BOM、Anomaly、AuditLog、Routing、Knowledge、DashboardKpi、Risk、ScheduleAgent、Operation；若补 Export，应按 Infrastructure 实现另列测试范围。
- 继续为 `ScheduleAgentService` 的 evidence upsert/query 方法按高风险证据链分批补测；当前 CreatedAt 初始化已有架构门禁兜底，后续重点转向剩余未测 DTO 映射、查询反序列化和非时间字段契约。
- 继续清理项目硬规则中的 null-forgiving 压制：本轮只封住 `ScheduleAgentService`，下一步可按风险评估 `SchedulingContextProvider`、`ReportEndpoints`、EF DbSet 历史用法。
- 继续清理项目硬规则中的 null-forgiving 压制：`ScheduleAgentService`、`SchedulingContextProvider`、`ReportEndpoints` 已封住；下一步按风险评估 EF DbSet 历史用法和 AI/基础设施路径。
- 继续清理项目硬规则中的 null-forgiving 压制：Admin/Token 仓储、Auth token claim、ExceptionMiddleware ProblemDetails.Status 与 Endpoint handler `default!` 已封住；下一步转向测试代码或新增 analyzer/format 门禁评估。
- 已处理：`SchedulingControllerTests` 全类中的 evidence 审计失败已定位为 `WriteAuditAsync` 未通过 UoW 提交，本地重新验证 `61/61 passed`；后续只保留 CI / PostgreSQL / staging 稳定性跟踪。
- 评估 `RiskAppService` 真实风险计算接入计划；当前单测只锁定演示数据契约、计数汇总和 UTC 时间，不代表生产风险模型可用。
- 评估 Dashboard KPI 是否需要注入 clock，避免 `DateTime.UtcNow` 在边界时间影响 OTD 单测和运行时解释。
- 评估 `KnowledgeAppService` 进程内 `_chatHistories` 是否需要持久化或分布式缓存；当前单测只覆盖单实例会话历史。
- 评估 `RoutingAppService.GetAllRoutesAsync` 是否需要从仓储全量读取后内存分页改为仓储/数据库分页；若改造，先扩展 `IRoutingRepository` 并补红灯测试。
- 继续扩展过滤器审计落库回归覆盖到其他挂载 `AuditEndpointFilter` 的代表性模块，特别是 `Bom` / `Routing` / `Knowledge` 这类不一定有内联事务审计的路径。
- 视发布口径决定是否同步前端 BOM 静态 demo 的含损耗 `totalQuantity`，避免演示数据与后端真实计算产生解释差异。
- 在 GitHub Actions hosted runner 实跑根 CI，确认新增 frontend unit test step 在 Linux/Node 22 下通过。
- 在 GitHub Actions hosted runner 实跑根 CI，确认新增 backend Coverage Threshold step 能读取 Unit + Integration coverage。
- 随 Sprint 6 补测继续提高 coverage threshold，避免长期停留在当前保守基线。
- 清理 Node `DEP0180` deprecation warning，避免 E2E 输出误导 CI 日志。
- 跟踪 `npm install` 的 `whatwg-encoding@3.1.1` deprecation warning；当前来自 `jsdom` 依赖链。
- 后续需要多轮采样集成测试运行时间，验证标准差是否小于 10%。
- 不要并行运行同一解决方案输出目录下的 .NET 测试项目；本轮已复现 `MES.Application.dll` 文件锁，后续验证需串行或隔离输出目录。
- 评估是否将现有 `.Result` / `.Wait()` / `Console.Write*` 架构测试升级为 Roslyn analyzer；若没有独立 analyzer 项目，继续以架构测试作为 CI 门禁。
- 继续推进 Sprint 6 中尚未落地的代码卫生项，并保持每项都有红灯、绿灯和文档记录。
- 确认对外发布入口是否需要在外层 `C:\AIWorks\AIMes` 也放置 README/LICENSE/CONTRIBUTING/SECURITY；当前仅 `v1` git 仓库根补齐。
- GitHub Release 自动化尚未实跑；后续在满足 `CHANGELOG.md` Release Process 门槛后再创建 `v1.0.0` tag。
- v1.0.0 仍需外部灰度、安全签字和 2 周观察窗口，不能因本地门禁通过而标记发布完成。
## 2026-05-31 Scheduling Evidence Audit 更新

- 已完成：`ScheduleAgentService.WriteAuditAsync` 已纳入 `IUnitOfWork.ExecuteAsync`，修复 evidence 已落库但 audit 未提交的问题。
- 已完成：`ScheduleAgentServiceTests` 已补 UoW mock 执行桩，`ScheduleAgentServiceTests` `19/19 passed`，`SchedulingControllerTests` `61/61 passed`。
- 下一步：继续跟踪 `SchedulingControllerTests` 在 CI / PostgreSQL / staging 环境的稳定性；本地 InMemory 集成测试已从 `20 failed / 61 total` 修复为 `61/61 passed`，但还不能替代外部环境证据。

## 2026-05-31 6.6 Notifications Store 更新

- 已完成：新增 `notifications.store.test.ts`，覆盖 SignalR critical 质量预警触发浏览器通知时使用 `/scheduling/favicon.ico`。
- 已完成：`notifications.ts` 复用 `appAssetPath`，不再硬编码根路径 `/favicon.ico`。
- 已验证：`npm run test:unit -- tests/unit/notifications.store.test.ts` `1/1 passed`，`npm run test:unit` `6 files / 21 tests passed`。
- 下一步：继续扩展 6.6 到剩余高价值 sync util 或业务 store，例如 `equipment-risk-sync`、`shortage-risk-sync`、`quality-capa-sync`。

## 2026-05-31 6.6 Quality CAPA Sync 更新

- 已完成：新增 `quality-capa-sync.test.ts`，覆盖 CAPA 闭环 localStorage 持久化、OTD 证据链镜像、backend best-effort upsert、backend-first fallback 和坏 JSON 清理。
- 已完成：`readQualityCapaClosureBackendFirst` 后端失败时回退本地记录，不再让质量面板因网络错误丢失本地闭环证据。
- 已验证：`npm run test:unit -- tests/unit/quality-capa-sync.test.ts` `3/3 passed`，`npm run test:unit` `7 files / 24 tests passed`。
- 下一步：继续扩展 6.6 到 `equipment-risk-sync`、`shortage-risk-sync` 等剩余高价值证据同步模块。

## 2026-05-31 6.6 Equipment Risk Sync 更新

- 已完成：新增 `equipment-risk-sync.test.ts`，覆盖设备停机本地持久化、backend best-effort upsert、backend-first fallback、坏 JSON 清理、不完整记录清理和客户故障样例默认字段。
- 已完成：`readEquipmentDowntimeEvent` 会清理缺少影响工单/维护窗口/保护策略等关键字段的旧本地记录，避免排产复核复用不完整设备风险。
- 已验证：`npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` `5/5 passed`，`npm run test:unit` `8 files / 29 tests passed`，`npm run lint` 通过。
- 下一步：继续扩展 6.6 到 `shortage-risk-sync` 等剩余高价值证据同步模块。

## 2026-05-31 6.6 Shortage Risk Sync 更新

- 已完成：新增 `shortage-risk-sync.test.ts`，覆盖 BOM 齐套包持久化、backend best-effort upsert、派生缺料齐套事件、backend-first fallback、坏 JSON 清理和物料编码匹配。
- 已完成：`writeBomKittingPackage` 派生 shortage event 时优先保留 BOM 包 `summary` 作为影响说明，避免跨工单缺料影响被缩窄成单个工单号。
- 已验证：`npm run test:unit -- tests/unit/shortage-risk-sync.test.ts` `4/4 passed`，`npm run test:unit` `9 files / 33 tests passed`，`npm run lint` 通过。
- 下一步：继续扩展 6.6 到剩余高价值证据同步模块，或转入前端 unit coverage 阈值提升评估。

## 2026-05-31 6.6 Agent Config Approval Sync 更新

- 已完成：新增 `agent-config-approval-sync.test.ts`，覆盖审批决策本地持久化、backend best-effort upsert、backend-first fallback、坏 JSON 清理和非法 override 忽略。
- 已完成：`readAgentConfigApprovals` 读取本地 override 时校验审批状态枚举，损坏 JSON 会清理，非法状态不会污染治理审批门禁。
- 已验证：`npm run test:unit -- tests/unit/agent-config-approval-sync.test.ts` `4/4 passed`，`npm run test:unit` `10 files / 37 tests passed`，`npm run lint` 通过。
- 下一步：继续扩展 6.6 到 `risk-sla-review-sync`、`anomaly-dispatch-sync`、`labor-assignment-sync` 等剩余高价值证据同步模块。

## 2026-05-31 6.6 Risk SLA Review Sync 更新

- 已完成：新增 `risk-sla-review-sync.test.ts`，覆盖晨会复核包写入、闭环、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、坏 JSON 清理和不完整记录清理。
- 已完成：`readRiskSlaReviewRecord` 对结构不完整的本地复核记录会清理 `aimes_risk_sla_review`，避免风险看板反复读取无法解释影响工单的旧状态。
- 已验证：`npm run test:unit -- tests/unit/risk-sla-review-sync.test.ts` `5/5 passed`，`npm run test:unit` `11 files / 42 tests passed`，`npm run lint` 通过。
- 下一步：继续扩展 6.6 到 `anomaly-dispatch-sync`、`labor-assignment-sync` 等剩余高价值证据同步模块。

## 2026-05-31 6.6 Anomaly Dispatch Sync 更新

- 已完成：新增 `anomaly-dispatch-sync.test.ts`，覆盖异常分流写入、按类型读取、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、同 ID 去重、12 条截断、坏 JSON 清理和不完整记录清理。
- 已完成：`readAnomalyDispatchRecords` 现在校验异常分流关键字段，并在本地数组包含坏结构时清理或重写 `aimes_anomaly_dispatch_records`。
- 已验证：`npm run test:unit -- tests/unit/anomaly-dispatch-sync.test.ts` `5/5 passed`，`npm run test:unit` `12 files / 47 tests passed`，`npm run lint` 通过。
- 下一步：继续扩展 6.6 到 `labor-assignment-sync` 等剩余高价值证据同步模块，或转入前端 coverage threshold 提升评估。

## 2026-05-31 6.6 Labor Assignment Sync 更新

- 已完成：新增 `labor-assignment-sync.test.ts`，覆盖人员资质阻断写入、替班互斥清理、主管复核、释放、生产开工 OTD 证据、backend-first fallback、坏 JSON 清理和不完整记录清理。
- 已完成：`readLaborReassignments` / `readLaborQualificationBlocks` 在本地数组包含坏结构时会写回有效记录，全部无效时清理对应 localStorage key。
- 已验证：`npm run test:unit -- tests/unit/labor-assignment-sync.test.ts` `6/6 passed`，`npm run test:unit` `13 files / 53 tests passed`，`npm run lint` 通过。
- 下一步：评估剩余未覆盖 sync util，或转入前端 coverage threshold 提升与 CI 门禁加固。

## 2026-05-31 6.6 Barcode Scan Evidence Sync 更新

- 已完成：新增 `barcode-scan-evidence-sync.test.ts`，覆盖工单/设备/物料扫码记录生成、写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、后端失败 fallback、去重、20 条截断、坏 JSON 清理和不完整记录清理。
- 已完成：`readBarcodeScanEvidenceRecords` 在本地数组包含坏结构时会写回有效记录，全部无效时清理 `aimes_barcode_scan_evidence`。
- 已验证：`npm run test:unit -- tests/unit/barcode-scan-evidence-sync.test.ts` `7/7 passed`，`npm run test:unit` `14 files / 60 tests passed`，`npm run lint` 通过。
- 下一步：评估剩余未覆盖 sync util，或转入前端 coverage threshold 提升与 CI 门禁加固。

## 2026-05-31 6.6 Production Anomaly Sync 更新

- 已完成：新增 `production-anomaly-sync.test.ts`，覆盖生产异常本地持久化、backend best-effort upsert、backend-first fallback、列表/详情 DTO 映射、坏 JSON 清理和不完整事件清理。
- 已完成：`readProductionAnomalyEvent` 现在校验生产异常事件关键字段，坏 JSON 和坏结构都会清理 `aimes_production_anomaly_event`。
- 已验证：`npm run test:unit -- tests/unit/production-anomaly-sync.test.ts` `5/5 passed`，`npm run test:unit` `15 files / 65 tests passed`，`npm run lint` 通过。
- 下一步：评估剩余未覆盖 sync util，或转入前端 coverage threshold 提升与 CI 门禁加固。

## 2026-05-31 6.6 Monitoring Situation Escalation Sync 更新

- 已完成：新增 `monitoring-situation-escalation-sync.test.ts`，覆盖现场态势升级包写入、闭环、OTD active/closed 镜像、backend best-effort upsert、backend-first fallback、同 ID 去重、8 条截断、坏 JSON 清理和不完整记录清理。
- 已完成：`readMonitoringSituationEscalations` 现在校验责任、排产、风险、OTD、审计和状态字段，坏结构会被剔除并同步清理本地键。
- 已验证：`npm run test:unit -- tests/unit/monitoring-situation-escalation-sync.test.ts` `6/6 passed`，`npm run test:unit` `16 files / 71 tests passed`，`npm run lint` 通过。
- 下一步：评估剩余未覆盖 sync util，或转入前端 coverage threshold 提升与 CI 门禁加固。

## 2026-05-31 6.6 Assistant Action Audit 更新

- 已完成：新增 `assistant-action-audit.test.ts`，覆盖 permitted/denied 审计写入、后端 best-effort upsert、backend-first 空结果 fallback、12 条截断、坏 JSON 清理和不完整记录清理。
- 已完成：`readAssistantActionAudits` 现在校验 action type 与完整权限解释字段；坏 JSON、非数组和坏结构会清理或写回有效记录。
- 已验证：`npm run test:unit -- tests/unit/assistant-action-audit.test.ts` `6/6 passed`，`npm run test:unit` `17 files / 77 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余未覆盖前端 store/composable/sync util，或转入 coverage threshold 提升与 CI 门禁加固。

## 2026-05-31 6.6 Assistant Recovery Package Sync 更新

- 已完成：新增 `assistant-action-package-sync.test.ts`，覆盖交期恢复包写入、OTD active 镜像、backend best-effort upsert、backend-first fallback、采购/质量/整包闭环 OTD 镜像、容量截断、坏 JSON 清理和不完整记录清理。
- 已完成：`readAssistantRecoveryPackages` 现在校验恢复包责任、排产、风险、OTD 和 dispatch step 字段；坏结构会清理或写回有效记录。
- 已验证：`npm run test:unit -- tests/unit/assistant-action-package-sync.test.ts` `6/6 passed`，`npm run test:unit` `18 files / 83 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余未覆盖的助手包 sync util，例如 `assistant-anomaly-card-sync`、`assistant-engineering-constraint-package-sync`，或转入 coverage threshold 提升。

## 2026-05-31 6.6 Assistant Anomaly Card Sync 更新

- 已完成：新增 `assistant-anomaly-card-sync.test.ts`，覆盖助手异常处置包写入、生产异常镜像、异常分流镜像、OTD active 镜像、backend best-effort upsert、backend-first fallback、容量截断、坏 JSON 清理和不完整记录清理。
- 已完成：`readAssistantAnomalyDispositionPackages` 现在校验异常处置包责任、异常、设备、交付影响、排产窗口和 dispatch step 字段；坏结构会清理或写回有效记录。
- 已验证：`npm run test:unit -- tests/unit/assistant-anomaly-card-sync.test.ts` `5/5 passed`，`npm run test:unit` `19 files / 88 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余未覆盖助手包 sync util，例如 `assistant-engineering-constraint-package-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 Assistant Engineering Constraint Package Sync 更新

- 已完成：新增 `assistant-engineering-constraint-package-sync.test.ts`，覆盖工程约束包写入、工程变更影响种子、工艺能力种子、OTD active 镜像、backend best-effort upsert、backend-first fallback、容量截断、坏 JSON 清理和不完整记录清理。
- 已完成：`readAssistantEngineeringConstraintPackages` 现在校验工程约束包责任、BOM、ECN、工艺路线、工序、OTD 和 dispatch step 字段；坏结构会清理或写回有效记录。
- 已验证：`npm run test:unit -- tests/unit/assistant-engineering-constraint-package-sync.test.ts` `5/5 passed`，`npm run test:unit` `20 files / 93 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 OTD KPI Commitment Sync 更新

- 已完成：新增 `otd-kpi-commitment-sync.test.ts`，覆盖客户承诺包写入、OTD active 镜像、backend best-effort upsert、backend-first fallback、latest fallback、容量截断、坏 JSON 清理和不完整记录清理。
- 已完成：`readOtdKpiCommitmentPackages` 现在校验客户承诺包维度、OTD 数值、责任、承诺和 action 字段；坏结构会清理或写回有效记录。
- 已验证：`npm run test:unit -- tests/unit/otd-kpi-commitment-sync.test.ts` `6/6 passed`，`npm run test:unit` `21 files / 99 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `outsourcing-commitment-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 Outsourcing Commitment Sync 更新

- 已完成：新增 `outsourcing-commitment-sync.test.ts`，覆盖外协承诺包写入、OTD active 镜像、backend best-effort upsert、backend-first fallback、latest fallback、外协到货闭环、排产释放闭环、容量截断、坏 JSON 清理和不完整记录清理。
- 已完成：`readOutsourcingCommitmentPackages` 现在校验外协承诺包维度、OTD 数值、责任、承诺、外协伙伴、影响工单和 action 字段；坏结构会清理或写回有效记录。
- 已验证：`npm run test:unit -- tests/unit/outsourcing-commitment-sync.test.ts` `7/7 passed`，`npm run test:unit` `22 files / 106 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 OTD Evidence Chain Sync 更新

- 已完成：新增 `otd-evidence-chain-sync.test.ts`，覆盖 OTD 证据 upsert 去重、24 条截断、backend best-effort upsert、backend-first fallback、闭环匹配、坏 JSON 清理和不完整记录清理。
- 已完成：`readOtdEvidenceChainRecords` 现在会在本地数组包含坏结构时写回有效记录，全部无效或非数组时清理 `aimes_otd_evidence_chain`。
- 已验证：`npm run test:unit -- tests/unit/otd-evidence-chain-sync.test.ts` `5/5 passed`，`npm run test:unit` `23 files / 111 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 Customer Order Import Sync 更新

- 已完成：新增 `customer-order-import-sync.test.ts`，覆盖客户工单导入证据写入、backend best-effort upsert、backend-first fallback、坏 JSON 清理和不完整证据清理。
- 已完成：`readCustomerOrderImportEvidence` 现在校验批次、文件名、来源、订单/风险数量、映射字段和准备时间；坏 JSON 或坏结构会清理 `aimes_customer_order_import`。
- 已验证：红灯为目标测试 `2 failed / 2 passed`，修复后 `npm run test:unit -- tests/unit/customer-order-import-sync.test.ts` `4/4 passed`，`npm run test:unit` `24 files / 115 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `engineering-change-sync`、`knowledge-governance-sync` 或 `poc-hypercare-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 Engineering Change Sync 更新

- 已完成：新增 `engineering-change-sync.test.ts`，覆盖替代料批准、工程变更影响、工艺能力校验写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback 和三类本地坏结构清理。
- 已完成：`readAlternateMaterialApproval`、`readEngineeringChangeImpactAnalysis`、`readRouteCapabilityValidation` 现在校验完整工程证据字段；不完整本地记录会清理对应 key。
- 已验证：红灯为目标测试 `3 failed / 2 passed`，修复后 `npm run test:unit -- tests/unit/engineering-change-sync.test.ts` `5/5 passed`，`npm run test:unit` `25 files / 120 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `knowledge-governance-sync`、`poc-hypercare-sync` 或 `poc-pilot-run-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 Knowledge Governance Sync 更新

- 已完成：新增 `knowledge-governance-sync.test.ts`，覆盖知识治理复核写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、混合坏结构写回和全坏结构清理。
- 已完成：`readKnowledgeGovernanceReviews` 现在会在本地数组包含坏结构时写回有效记录，全部无效或非数组时清理 `aimes_knowledge_governance_reviews`。
- 已验证：红灯为目标测试 `2 failed / 2 passed`，修复后 `npm run test:unit -- tests/unit/knowledge-governance-sync.test.ts` `4/4 passed`，`npm run test:unit` `26 files / 124 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `poc-hypercare-sync`、`poc-pilot-run-sync` 或 `poc-review-signoff-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 POC Hypercare Sync 更新

- 已完成：新增 `poc-hypercare-sync.test.ts`，覆盖上线验收写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、坏 JSON 清理、不完整验收清理和坏监控/检查点清理。
- 已完成：`readPocHypercareAcceptanceRecord` 现在校验完整 Hypercare 监控指标和检查点动作；坏结构会清理 `aimes_poc_hypercare_acceptance`。
- 已验证：红灯为目标测试 `2 failed / 3 passed`，修复后 `npm run test:unit -- tests/unit/poc-hypercare-sync.test.ts` `5/5 passed`，`npm run test:unit` `27 files / 129 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `poc-pilot-run-sync`、`poc-review-signoff-sync` 或 `poc-rollout-package-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 POC Pilot Run Sync 更新

- 已完成：新增 `poc-pilot-run-sync.test.ts`，覆盖试点运行写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、坏 JSON 清理、不完整试点记录清理和坏工单/检查点清理。
- 已完成：`readPocPilotRunRecord` 现在校验完整试点工单和检查点证据；坏结构会清理 `aimes_poc_pilot_run`。
- 已验证：红灯为目标测试 `2 failed / 3 passed`，修复后 `npm run test:unit -- tests/unit/poc-pilot-run-sync.test.ts` `5/5 passed`，`npm run test:unit` `28 files / 134 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `poc-review-signoff-sync`、`poc-rollout-package-sync` 或 `quality-mrb-disposition-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 POC Review Signoff Sync 更新

- 已完成：新增 `poc-review-signoff-sync.test.ts`，覆盖复盘签署写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、坏 JSON 清理和不完整签署记录清理。
- 已完成：`readPocReviewSignoffRecord` 现在校验完整评分、签署人、复核人、证据批次和摘要；坏结构会清理 `aimes_poc_review_signoff`。
- 已验证：红灯为目标测试 `2 failed / 2 passed`，修复后 `npm run test:unit -- tests/unit/poc-review-signoff-sync.test.ts` `4/4 passed`，`npm run test:unit` `29 files / 138 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `poc-rollout-package-sync`、`quality-mrb-disposition-sync` 或 `quality-rework-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 POC Rollout Package Sync 更新

- 已完成：新增 `poc-rollout-package-sync.test.ts`，覆盖上线交付包写入、OTD 证据链镜像、backend best-effort upsert、backend-first fallback、坏 JSON 清理、不完整交付包清理和坏行动项清理。
- 已完成：`readPocRolloutPackageRecord` 现在校验完整上线行动项；坏结构会清理 `aimes_poc_rollout_package`。
- 已验证：红灯为目标测试 `2 failed / 3 passed`，修复后 `npm run test:unit -- tests/unit/poc-rollout-package-sync.test.ts` `5/5 passed`，`npm run test:unit` `30 files / 143 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `quality-mrb-disposition-sync`、`quality-rework-sync` 或 `quality-knowledge-sample-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 Quality Rework Sync 更新

- 已完成：新增 `quality-rework-sync.test.ts`，覆盖返工影响写入、backend best-effort upsert、backend-first fallback、返工优先选择、impact 构建、坏 JSON 清理和不完整记录清理。
- 已完成：`readQualityReworkImpact` 现在校验完整返工影响字段；坏 JSON 或坏结构会清理 `aimes_quality_rework_impact`。
- 已验证：红灯为目标测试 `1 failed / 4 passed`，修复后 `npm run test:unit -- tests/unit/quality-rework-sync.test.ts` `5/5 passed`，`npm run test:unit` `31 files / 148 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `quality-mrb-disposition-sync` 或 `quality-knowledge-sample-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 Quality MRB Disposition Sync 更新

- 已完成：新增 `quality-mrb-disposition-sync.test.ts`，覆盖 MRB 处置写入、OTD active 镜像、backend best-effort upsert、backend-first fallback、闭环 action result、OTD closed 镜像、坏 JSON 清理、不完整记录清理和坏 action 清理。
- 已完成：`readQualityMrbDispositionRecord` 现在校验完整 MRB 处置和 action 字段；坏 JSON 或坏结构会清理 `aimes_quality_mrb_disposition`。
- 已验证：红灯为目标测试 `2 failed / 4 passed`，修复后 `npm run test:unit -- tests/unit/quality-mrb-disposition-sync.test.ts` `6/6 passed`，`npm run test:unit` `32 files / 154 tests passed`，`npm run lint` 通过。
- 下一步：继续评估剩余高价值前端 sync util，例如 `quality-knowledge-sample-sync`，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 Quality Knowledge Sample Sync 更新

- 已完成：新增 `quality-knowledge-sample-sync.test.ts`，覆盖质量知识样本写入、OTD 镜像、backend best-effort upsert、backend-first fallback、混合坏样本写回、全坏样本清理、坏 JSON 清理、复用草案和复核队列坏结构写回。
- 已完成：`readQualityKnowledgeSamples` 等质量知识本地数组读取入口现在会在坏结构出现时写回有效记录，全部无效、非数组或坏 JSON 时清理对应 localStorage key。
- 已验证：红灯为目标测试 `3 failed / 2 passed`，修复后 `npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` `5/5 passed`，`npm run test:unit` `33 files / 159 tests passed`，`npm run lint` 通过。
- 下一步：评估是否转入前端 coverage threshold 提升，或继续抽样审计剩余未覆盖 store/composable。

## 2026-05-31 6.6 Customer Equipment Fault Evidence 更新

- 已完成：扩展 `equipment-risk-sync.test.ts`，覆盖客户设备故障 POC 证据坏结构清理。
- 已完成：`readCustomerEquipmentFaultEvidence` 现在校验完整文件来源、设备、样本数、影响工单、停机小时、采集信号和准备时间；坏 JSON 或坏结构会清理 `aimes_customer_equipment_fault_evidence`。
- 已验证：红灯为目标测试 `1 failed / 5 passed`，修复后 `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` `6/6 passed`，`npm run test:unit` `33 files / 160 tests passed`，`npm run lint` 通过。
- 下一步：继续抽样审计 POC evidence governance 的聚合输出，或转入前端 coverage threshold 提升。

## 2026-05-31 6.6 POC Evidence Governance / Customer Order Import 更新

- 已完成：新增 `poc-evidence-governance.test.ts`，覆盖客户工单导入与客户设备故障样例聚合成 POC evidence governance 记录。
- 已完成：扩展 `customer-order-import-sync.test.ts`，覆盖空字段映射的客户工单导入证据清理；`readCustomerOrderImportEvidence` 现在要求 `mappedFields` 非空且每项为非空字符串。
- 已验证：红灯为目标测试 `1 failed / 4 passed`，修复后 `npm run test:unit -- tests/unit/customer-order-import-sync.test.ts` `5/5 passed`，`poc-evidence-governance.test.ts` `2/2 passed`，`npm run test:unit` `34 files / 163 tests passed`，`npm run lint` 通过。
- 下一步：继续评估前端 coverage threshold 提升，或抽样覆盖 `knowledge-citations` / `gantt-mapper` 等剩余无测纯工具。

## 2026-05-31 6.6 Customer Equipment Fault Signal Lineage 更新

- 已完成：继续扩展 `equipment-risk-sync.test.ts`，覆盖客户设备故障证据 `capturedSignals` 为空时的清理行为。
- 已完成：`readCustomerEquipmentFaultEvidence` 现在要求 `capturedSignals` 非空且每一项为非空字符串，避免 POC evidence governance 生成无遥测/点检来源的设备故障证据。
- 已验证：红灯为目标测试 `1 failed / 6 passed`，修复后 `npm run test:unit -- tests/unit/equipment-risk-sync.test.ts` `7/7 passed`，`npm run test:unit` `34 files / 164 tests passed`，`npm run lint` 通过。
- 下一步：继续评估前端 coverage threshold 提升，或抽样覆盖 `knowledge-citations` / `gantt-mapper` 等剩余无测纯工具。

## 2026-05-31 6.6 Knowledge Citations / Quality Knowledge Evidence Lineage 更新

- 已完成：新增 `knowledge-citations.test.ts`，覆盖空质量知识 CAPA 推荐、复用范围和证据 trace 时聊天引用必须保持“需复核”。
- 已完成：`readQualityKnowledgeSamples` 现在要求质量知识样本的 `capaRecommendations/reuseTargets/evidenceTraceIds` 均非空且每项为非空字符串，避免空 citation 被包装成正式来源。
- 已验证：红灯为目标测试 `1 failed / 0 passed`，修复后 `npm run test:unit -- tests/unit/knowledge-citations.test.ts` `1/1 passed`，`npm run test:unit -- tests/unit/quality-knowledge-sample-sync.test.ts` `5/5 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可抽样覆盖 `gantt-mapper` 或评估 coverage threshold 提升。

## 2026-05-31 6.6 Gantt Mapper Conflict Window 更新

- 已完成：新增 `gantt-mapper.test.ts`，覆盖同一设备上一条长任务覆盖多个后续短任务时必须逐个标记冲突。
- 已完成：`detectConflicts` 现在用结束时间最晚的前序任务作为 active window，避免只比较相邻任务导致后续重叠漏报。
- 已验证：红灯为目标测试 `1 failed / 0 passed`，修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` `1/1 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可评估 coverage threshold 提升或继续抽样排产相关工具。

## 2026-05-31 6.6 Gantt Mapper Setup Time Lineage 更新

- 已完成：扩展 `gantt-mapper.test.ts`，覆盖 `1 小时 30 分钟` 换型准备标签必须映射为 90 分钟。
- 已完成：`parseSetupTime` 现在支持小时/分钟组合解析，避免甘特图任务和排产审计低估 setup minutes。
- 已验证：红灯为目标测试 `1 failed / 1 passed`，修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` `2/2 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可评估 coverage threshold 提升。

## 2026-05-31 6.6 Gantt Mapper Conflict Marker Lineage 更新

- 已完成：继续扩展 `gantt-mapper.test.ts`，覆盖 `planToGanttData` 输出任务必须携带冲突标记和冲突说明。
- 已完成：`planToGanttData` 现在统一调用 `detectConflicts` 并写入 `hasConflict/conflictMessage`，避免只有主排产板后处理能看到冲突。
- 已验证：红灯为目标测试 `1 failed / 2 passed`，修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` `3/3 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可评估 coverage threshold 提升。

## 2026-05-31 6.6 Gantt Mapper Dependency Link Dedup 更新

- 已完成：继续扩展 `gantt-mapper.test.ts`，覆盖重复 dependent item 只生成一条甘特图依赖 link。
- 已完成：`planToGanttData` 现在按 link id 去重，避免重复依赖箭头和审计计数。
- 已验证：红灯为目标测试 `1 failed / 3 passed`，修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` `4/4 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可评估 coverage threshold 提升。

## 2026-05-31 6.6 Gantt Mapper Invalid Time Window 更新

- 已完成：继续扩展 `gantt-mapper.test.ts`，覆盖计划结束早于计划开始时必须在任务上标记冲突。
- 已完成：`planToGanttData` 现在保留最小展示时长，同时把异常时间窗口写入 `hasConflict/conflictMessage`。
- 已验证：红灯为目标测试 `1 failed / 4 passed`，修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` `5/5 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可评估 coverage threshold 提升。

## 2026-05-31 6.6 Gantt Mapper Flat Task Invalid Time Window 更新

- 已完成：继续扩展 `gantt-mapper.test.ts`，覆盖 `itemsToFlatTasks` 对结束早于开始的扁平任务也必须标记冲突。
- 已完成：`itemsToFlatTasks` 现在保持最小展示时长，同时写入异常时间窗口冲突说明。
- 已验证：红灯为目标测试 `1 failed / 5 passed`，修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` `6/6 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可评估 coverage threshold 提升。

## 2026-05-31 6.6 Gantt Mapper Flat Task Setup Time Lineage 更新

- 已完成：继续扩展 `gantt-mapper.test.ts`，覆盖 `itemsToFlatTasks` 也必须保留换型准备分钟数。
- 已完成：`itemsToFlatTasks` 现在复用 `parseSetupTime`，`1 小时 30 分钟` 会映射为 `setupMinutes: 90`。
- 已验证：红灯为目标测试 `1 failed / 6 passed`，修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` `7/7 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可评估 coverage threshold 提升。

## 2026-05-31 6.6 Gantt Mapper Decimal Setup Time 更新

- 已完成：继续扩展 `gantt-mapper.test.ts`，覆盖 `setupTime: "1.5 小时"` 必须映射为 `setupMinutes: 90`。
- 已完成：`parseSetupTime` 现在支持小数小时/分钟，并避免整数正则从小数尾部误匹配为更大的小时数。
- 已验证：红灯为目标测试 `1 failed / 7 passed`，失败值为 `300`；修复后 `npm run test:unit -- tests/unit/gantt-mapper.test.ts` `8/8 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可评估 coverage threshold 提升。

## 2026-05-31 6.6 CSV Export Header Escaping 更新

- 已完成：新增 `export.test.ts`，覆盖 CSV 表头包含逗号、双引号和换行时必须按 CSV 单元格规则转义。
- 已完成：`exportToCsv` 现在让表头和数据行共用转义逻辑，避免审计导出首行列结构漂移。
- 已验证：红灯为目标测试 `1 failed / 0 passed`，修复后 `npm run test:unit -- tests/unit/export.test.ts` `1/1 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可评估 `useExport` 是否也需要统一到同一 CSV 转义工具。

## 2026-05-31 6.6 useExport CSV Header Escaping 更新

- 已完成：新增 `use-export.test.ts`，覆盖排产/报表 CSV 导出表头包含逗号、双引号和换行时必须转义。
- 已完成：`useExport.downloadCsv` 现在让 headers 和 rows 共用转义逻辑，避免排产计划和报表导出列结构漂移。
- 已验证：红灯为目标测试 `1 failed / 0 passed`，修复后 `npm run test:unit -- tests/unit/use-export.test.ts` `1/1 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后评估是否抽出共享 CSV helper，避免 `exportToCsv` 与 `useExport` 长期双实现。

## 2026-05-31 6.6 Shortage BOM Kitting Package Item Guard 更新

- 已完成：扩展 `shortage-risk-sync.test.ts`，覆盖 BOM 齐套包 `items` 明细缺少关键字段时必须清理本地证据。
- 已完成：`readBomKittingPackage` 现在校验外层齐套包字段和每条物料明细的物料、数量、单位、动作字段。
- 已验证：红灯为目标测试 `1 failed / 4 passed`，修复后 `npm run test:unit -- tests/unit/shortage-risk-sync.test.ts` `5/5 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可继续补 `ShortageRiskResolution` / `SupplyRiskEscalation` / `SupplierNetworkDecision` 的坏结构清理。

## 2026-05-31 6.6 Shortage Resolution Guard 更新

- 已完成：继续扩展 `shortage-risk-sync.test.ts`，覆盖不完整缺料闭环记录必须清理本地证据。
- 已完成：`readShortageRiskResolution` 现在校验物料、影响订单、来源工单、到货数量、单位、可用量、闭环时间和说明字段。
- 已验证：红灯为目标测试 `1 failed / 5 passed`，修复后 `npm run test:unit -- tests/unit/shortage-risk-sync.test.ts` `6/6 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可继续补 `SupplyRiskEscalation` / `SupplierNetworkDecision` 的坏结构清理。

## 2026-05-31 6.6 Auth Store Local User Cache Guard 更新

- 已完成：扩展 `auth.store.test.ts`，覆盖 auth 启动遇到损坏 `aimes_user` 时必须清理坏身份缓存。
- 已完成：`auth.ts` 改为复用 `getLocalUser()`，并在恢复登录态前校验完整缓存用户字段，避免身份解析规则和 `router` / `ChatPanel` / `ScannerBoard` 分叉。
- 已验证：红灯为目标测试 `1 failed / 3 passed`，失败点为坏 `aimes_user` 未清理；修复后 `auth.store.test.ts` `4/4 passed`，`local-user.test.ts` `2/2 passed`。
- 下一步：继续扫描剩余 `aimes_user` 直读入口，例如报表签名、auth refresh 相关路径；每次仍按红绿测试推进。

## 2026-05-31 6.6 Report Actor Local User Cache Guard 更新

- 已完成：扩展 `local-user.test.ts`，覆盖报表 actor 签名必须优先使用 username，并在身份缓存损坏时清理 `aimes_user`。
- 已完成：`ReportBoard.vue` 的报表承诺 actor 改为使用 `getLocalUserReportActor()`，移除组件内私有 `aimes_user` JSON 解析。
- 已验证：红灯为目标测试 `1 failed / 2 passed`，失败点为共享报表 actor 函数不存在；修复后 `local-user.test.ts` `3/3 passed`，生产代码搜索未再发现 `ReportBoard.vue` 直读 `aimes_user`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；之后可转向 `api/http.ts` 的 refresh 身份缓存常量/行为复核或剩余 evidence sync 抽样。

## 2026-05-31 6.6 HTTP Refresh Response Guard 更新

- 已完成：新增 `http-refresh.test.ts`，覆盖 refresh token 响应缺少 `token` 时不能写入坏 token 或重试业务请求。
- 已完成：`api/http.ts` 在持久化 refresh 响应前校验非空 `token` / `refreshToken`，无效响应复用既有清理登录态路径。
- 已验证：红灯为目标测试 `1 failed / 0 passed`，失败点为坏 refresh 响应仍 resolve 并重试；修复后 `http-refresh.test.ts` `1/1 passed`，`auth.store.test.ts` + `local-user.test.ts` `7/7 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；后续可补 refresh 成功路径/并发共享 promise 的单测，或继续抽样剩余 evidence sync。

## 2026-05-31 6.6 HTTP Refresh Retry Header Guard 更新

- 已完成：扩展 `http-refresh.test.ts`，覆盖 refresh 成功但原 401 请求缺少 `headers` 对象时仍必须带新 Authorization 重试。
- 已完成：`api/http.ts` 重试前初始化 `config.headers`，避免 headers 缺失被误判为 refresh 失败。
- 已验证：红灯为目标测试 `1 failed / 1 passed`，失败点为 promise rejected；修复后 `http-refresh.test.ts` `2/2 passed`，`auth.store.test.ts` + `local-user.test.ts` `7/7 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；后续可补 refresh 并发共享 promise 的单测，或继续抽样剩余 evidence sync。

## 2026-05-31 6.6 HTTP Request Authorization Header Guard 更新

- 已完成：继续扩展 `http-refresh.test.ts`，覆盖请求拦截器在 config 缺少 `headers` 时仍能附加 `Authorization`。
- 已完成：`api/http.ts` 请求拦截器在写 token 前初始化 `config.headers`。
- 已验证：红灯为目标测试 `1 failed / 2 passed`，失败点为 `Cannot set properties of undefined`；修复后 `http-refresh.test.ts` `3/3 passed`，`auth.store.test.ts` + `local-user.test.ts` `7/7 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；后续可补 refresh 并发共享 promise 的单测，或继续抽样剩余 evidence sync。

## 2026-05-31 6.6 HTTP / SignalR Access Token Shared Guard 更新

- 已完成：新增 `auth-token.test.ts`，覆盖空白 `aimes_token` 必须返回 `null`，非空 token 保持返回原值。
- 已完成：新增 `getLocalAccessToken()`，并让 HTTP 请求拦截器、通知 hub、Dashboard hub 和 Monitoring hub 复用同一读取入口。
- 已验证：红灯为目标测试 import 失败；修复后 `auth-token.test.ts` `1/1 passed`，`http-refresh.test.ts` + `notifications.store.test.ts` `4/4 passed`。
- 下一步：继续跑全量前端单测、lint 和 touched-file 审计；后续可评估是否把 `TOKEN_KEY` 常量也抽到共享模块，或补 SignalR factory options 的更直接单测。

## 2026-05-31 6.6 Access Token Whitespace Normalization 更新

- 已完成：扩展 `auth-token.test.ts`，覆盖带边界空白的 `aimes_token` 必须归一化为真实 token。
- 已完成：`getLocalAccessToken()` 返回 trim 后的 token，空白 token 仍返回 `null`。
- 已验证：红灯为目标测试收到 `"  access-token  "`；修复后 `auth-token.test.ts` `2/2 passed`，`http-refresh.test.ts` + `notifications.store.test.ts` `4/4 passed`。
- 下一步：继续全量前端验证与 touched-file 审计；后续可补 router/auth store 对空白 token 的启动态一致性检查。

## 2026-05-31 6.6 Auth Boot / Router Token Guard 更新

- 已完成：扩展 `auth.store.test.ts`，覆盖空白 `aimes_token` + 完整 `aimes_user` 不能恢复登录态。
- 已完成：新增 `router-auth.test.ts`，覆盖空白 `aimes_token` 访问受保护路由必须跳转 `/login`。
- 已完成：`auth.ts` 与 `router/index.ts` 复用 `getLocalAccessToken()`，和 HTTP/SignalR 共享同一 token guard。
- 已验证：auth store 红灯为 `1 failed / 4 passed`，router 红灯为路径停在 `/dashboard`；修复后 `router-auth.test.ts` + `auth.store.test.ts` + `auth-token.test.ts` `8/8 passed`。
- 下一步：继续全量前端验证与 touched-file 审计；后续可补登录页对已有有效 token 的 redirect 单测，或转回剩余 evidence sync 抽样。

## 2026-05-31 6.6 Router Role Whitespace Normalization 更新

- 已完成：扩展 `local-user.test.ts`，覆盖缓存角色 `"  Admin  "` 必须归一化为 `Admin`。
- 已完成：扩展 `router-auth.test.ts`，覆盖归一化后的 Admin 缓存角色可进入 Admin-only `/admin` 路由。
- 已完成：`getLocalUserRole()` 返回 trim 后的 role，避免路由角色比对被边界空白误拒。
- 已验证：红灯为 `local-user.test.ts` 收到 `"  Admin  "`；修复后 `local-user.test.ts` + `router-auth.test.ts` `6/6 passed`。
- 下一步：继续全量前端验证与 touched-file 审计；后续可审计 displayName/report actor 是否也需要 trim 输出。

## 2026-05-31 6.6 Local User Actor Whitespace Normalization 更新

- 已完成：扩展 `local-user.test.ts`，覆盖缓存 displayName / username 带边界空白时，审计 display name 和报表 actor 必须输出归一化值。
- 已完成：`getLocalUserDisplayName()` 与 `getLocalUserReportActor()` 返回 trim 后的 displayName / username。
- 已验证：红灯为 `local-user.test.ts` 收到 `"  报表管理员  "`；修复后 `local-user.test.ts` + `auth.store.test.ts` + `router-auth.test.ts` `12/12 passed`。
- 下一步：继续全量前端验证与 touched-file 审计；后续可转回剩余 evidence sync 抽样或 coverage threshold 提升。

## 2026-05-31 6.6 Auth Boot Cached Identity Normalization 更新

- 已完成：扩展 `auth.store.test.ts`，覆盖启动恢复登录态时必须把缓存 `username/displayName/role` 归一化后写入 `AuthUser`。
- 已完成：`local-user.ts` 在共享读取边界归一化缓存身份对象，避免 auth store 单独恢复出带边界空白的身份状态。
- 已验证：红灯为 `auth.store.test.ts` 收到 `"  alice  "` / `"  Alice Zhang  "` / `"  Engineer  "`；修复后 `auth.store.test.ts` + `local-user.test.ts` + `router-auth.test.ts` `13/13 passed`，前端全量 Vitest `42 files / 199 tests passed`，`npm run lint` 通过。
- 下一步：继续转回剩余 evidence sync 抽样或 coverage threshold 提升；发布级证据仍需 CI / PostgreSQL / staging / 灰度 / 安全签字 / 两周观察窗口。

## 2026-05-31 6.6 HTTP Refresh Token Whitespace Normalization 更新

- 已完成：扩展 `http-refresh.test.ts`，覆盖 refresh 成功响应中的 access token / refresh token 带边界空白时必须先归一化。
- 已完成：`performRefresh()` 现在把新 token pair trim 后再持久化，并用 trim 后 access token 重试原 401 请求。
- 已验证：红灯为重试请求收到 `Bearer   new-access-token  `；修复后 `http-refresh.test.ts` + `auth-token.test.ts` + `auth.store.test.ts` `12/12 passed`，前端全量 Vitest `42 files / 200 tests passed`，`npm run lint` 通过。
- 下一步：继续 touched-file 审计；之后可继续评估 refresh 并发共享 promise 或 coverage threshold 提升。

## 2026-05-31 6.6 Cached Refresh Token Whitespace Normalization 更新

- 已完成：扩展 `http-refresh.test.ts`，覆盖旧缓存 `aimes_refresh_token` 带边界空白时，refresh 请求体必须发送归一化 token。
- 已完成：`performRefresh()` 读取旧 refresh token 后先 trim，空白旧 token 继续走 refresh 失败清理路径。
- 已验证：红灯为 `/api/v1/auth/refresh` 请求体收到 `"  refresh-token  "`；修复后 `http-refresh.test.ts` + `auth-token.test.ts` + `auth.store.test.ts` `13/13 passed`，前端全量 Vitest `42 files / 201 tests passed`，`npm run lint` 通过。
- 下一步：继续 touched-file 审计；之后可继续评估 refresh 并发共享 promise 或 coverage threshold 提升。

## 2026-05-31 6.6 Backend Login Token Persistence Normalization 更新

- 已完成：扩展 `auth.store.test.ts`，覆盖后端登录响应 token pair 带边界空白时，返回用户状态和 localStorage 凭据必须归一化。
- 已完成：`auth.ts` 后端登录成功构造 `AuthUser` 时 trim access token，`saveUser()` 写入 access token / refresh token 前也统一 trim。
- 已验证：红灯为 `useAuth().login()` 返回 `"  backend-access-token  "`；修复后 `auth.store.test.ts` + `http-refresh.test.ts` + `auth-token.test.ts` `14/14 passed`，前端全量 Vitest `42 files / 202 tests passed`，`npm run lint` 通过。
- 下一步：继续 touched-file 审计；之后可继续评估 refresh 并发共享 promise 或 coverage threshold 提升。

## 2026-05-31 6.6 Frontend Unit Coverage CI Gate 更新

- 已完成：新增 `frontend-ci-coverage.test.ts`，锁定 `package.json` 必须提供 `test:unit:coverage`，外层 CI workflow 必须运行 `npm run test:unit:coverage`。
- 已完成：新增 `test:unit:coverage` 脚本、`@vitest/coverage-v8` dev dependency、Vitest v8 coverage 阈值配置，以及 CI frontend `Unit coverage` step。
- 已完成：`.gitignore` 忽略 `src/frontend/coverage/`，避免本地 coverage 报告进入待提交源码。
- 已验证：红灯为 coverage script 未定义；修复后目标测试通过，`npm run test:unit:coverage` `43 files / 203 tests passed`，coverage total lines/statements `17.05%`、branches `69.79%`、functions `60.77%`。
- 已验证：前端全量 `npm run test:unit` `43 files / 203 tests passed`，`npm run lint` 通过。
- 下一步：继续 touched-file 审计；后续可逐步提高 coverage threshold，并等待 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口补齐发布级证据。

## 2026-05-31 6.6 Frontend Coverage Threshold Raise 更新

- 已完成：扩展 `frontend-ci-coverage.test.ts`，锁定前端 coverage thresholds 不得停留在初始 10% 安全线。
- 已完成：`vitest.config.ts` 将 lines/branches/functions/statements threshold 从 `10` 提升到 `15`。
- 已验证：红灯为目标测试缺少 `lines: 15`，修复后 `frontend-ci-coverage.test.ts` `2/2 passed`。
- 已验证：`npm run test:unit:coverage` 在 15% 阈值下通过，`43 files / 204 tests passed`，coverage total lines/statements `17.05%`、branches `69.79%`、functions `60.77%`。
- 已验证：前端全量 `npm run test:unit` `43 files / 204 tests passed`，`npm run lint` 通过。
- 下一步：继续补页面/组件级测试后再评估下一次 threshold 提升；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Login Page Whitespace Credential Guard 更新

- 已完成：新增 `login-page.test.ts`，覆盖登录页不能把纯空白用户名/密码提交给 auth store。
- 已完成：`LoginPage.vue` 提交入口 trim 用户名和密码，空白凭据显示 `请输入用户名和密码` 并停止登录流程。
- 已验证：红灯为 `login('   ', '   ')` 被调用；修复后 `login-page.test.ts` `1/1 passed`，相邻 `auth.store.test.ts` `7/7 passed`。
- 已验证：`npm run test:unit:coverage` `44 files / 205 tests passed`，coverage total lines/statements `17.51%`、branches `69.74%`、functions `61.05%`，`LoginPage.vue` 行覆盖 `96.05%`。
- 已验证：前端全量 `npm run test:unit` `44 files / 205 tests passed`，`npm run lint` 通过。
- 下一步：继续补登录成功跳转、后端错误展示、loading/disabled 状态，或转向其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Login Page Whitespace Submit Button Guard 更新

- 已完成：扩展 `login-page.test.ts`，覆盖纯空白用户名/密码时提交按钮必须禁用。
- 已完成：`LoginPage.vue` 新增 trim 后 `canSubmit`，按钮禁用条件与提交 guard 规则一致。
- 已验证：红灯为 `disabled` 属性缺失；修复后 `login-page.test.ts` `2/2 passed`，相邻 `auth.store.test.ts` `7/7 passed`。
- 已验证：`npm run test:unit:coverage` `44 files / 206 tests passed`，coverage total lines/statements `17.51%`、branches `69.70%`、functions `61.05%`，`LoginPage.vue` 行覆盖 `96.06%`。
- 已验证：前端全量 `npm run test:unit` `44 files / 206 tests passed`，`npm run lint` 通过。
- 下一步：继续补登录成功跳转、后端错误展示和 loading 状态，或转向其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Toast Container Alert Semantics 更新

- 已完成：新增 `toast-container.test.ts`，覆盖错误 toast 必须以 alert 语义暴露标题和消息。
- 已完成：`ToastContainer.vue` 为 error toast 设置 `role="alert"` / `aria-live="assertive"`，其他类型设置 `role="status"` / `aria-live="polite"`。
- 已验证：红灯为找不到 `[role="alert"]`；修复后 `toast-container.test.ts` `1/1 passed`，相邻 `notifications.store.test.ts` `1/1 passed`。
- 已验证：`npm run test:unit:coverage` `45 files / 207 tests passed`，coverage total lines/statements `17.70%`、branches `69.67%`、functions `61.15%`，`ToastContainer.vue` 行覆盖 `100%`。
- 已验证：前端全量 `npm run test:unit` `45 files / 207 tests passed`，`npm run lint` 通过。
- 下一步：继续补 warning/info/success toast 的 polite status 语义或转向其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Toast Decorative Icon Semantics 更新

- 已完成：扩展 `toast-container.test.ts`，覆盖 toast 装饰性图标必须对辅助技术隐藏。
- 已完成：`ToastContainer.vue` 为 `.toast-icon` 设置 `aria-hidden="true"`，避免图标符号与 toast 文案重复播报。
- 已验证：红灯为 `.toast-icon` 的 `aria-hidden` 为 `undefined`；修复后 `toast-container.test.ts` `2/2 passed`，相邻 `notifications.store.test.ts` `1/1 passed`。
- 已验证：`npm run test:unit:coverage` `45 files / 208 tests passed`，coverage total lines/statements `17.70%`、branches `69.73%`、functions `61.15%`，`ToastContainer.vue` 行覆盖 `100%`。
- 已验证：前端全量 `npm run test:unit` `45 files / 208 tests passed`，`npm run lint` 通过。
- 下一步：继续补 warning/info/success toast 的 polite status 语义、多 toast 顺序，或转向其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Toast Atomic Live Region 更新

- 已完成：扩展 `toast-container.test.ts`，覆盖非错误 toast 必须作为 atomic polite live region 播报。
- 已完成：`ToastContainer.vue` 为每条 `.toast-item` 设置 `aria-atomic="true"`，让标题和消息作为完整通知一起被辅助技术处理。
- 已验证：红灯为 `aria-atomic` 为 `undefined`；修复后 `toast-container.test.ts` `3/3 passed`，相邻 `notifications.store.test.ts` `1/1 passed`。
- 已验证：`npm run test:unit:coverage` `45 files / 209 tests passed`，coverage total lines/statements `17.70%`、branches `69.78%`、functions `61.15%`，`ToastContainer.vue` 行覆盖 `100%`。
- 已验证：前端全量 `npm run test:unit` `45 files / 209 tests passed`，`npm run lint` 通过。
- 下一步：继续补多 toast 顺序、自动移除语义或转向其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Login Page Error Alert Semantics 更新

- 已完成：扩展 `login-page.test.ts`，锁定有效凭据带边界空白时会 trim 后提交并成功跳转；该测试立即通过，作为既有成功路径防回归。
- 已完成：扩展 `login-page.test.ts`，覆盖登录校验错误必须以 assertive alert 暴露给辅助技术。
- 已完成：`LoginPage.vue` 为 `.login-error` 设置 `role="alert"` / `aria-live="assertive"`。
- 已验证：红灯为找不到 `[role="alert"]`；修复后 `login-page.test.ts` `4/4 passed`，相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 已验证：`npm run test:unit:coverage` `45 files / 211 tests passed`，coverage total lines/statements `17.72%`、branches `70.01%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `99.56%`。
- 已验证：前端全量 `npm run test:unit` `45 files / 211 tests passed`，`npm run lint` 通过。
- 下一步：继续补登录页后端错误展示、loading 状态，或转向其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Login Page Busy Submit Semantics 更新

- 已完成：扩展 `login-page.test.ts`，覆盖登录请求 pending 时 submit button 必须显示忙碌文案、保持禁用并暴露 `aria-busy="true"`。
- 已完成：`LoginPage.vue` 在 `loading` 为 true 时为 submit button 设置 `aria-busy="true"`。
- 已验证：红灯为按钮 `aria-busy` 为 `undefined`；修复后 `login-page.test.ts` `5/5 passed`，相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 已验证：`npm run test:unit:coverage` `45 files / 212 tests passed`，coverage total lines/statements `17.73%`、branches `70.03%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `99.57%`。
- 已验证：前端全量 `npm run test:unit` `45 files / 212 tests passed`，`npm run lint` 通过。
- 下一步：继续补登录页后端错误展示，或转向其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Login Page Error Field Association 更新

- 已完成：扩展 `login-page.test.ts`，覆盖登录错误 alert 必须有稳定 id，用户名/密码输入框必须通过 `aria-describedby` 关联错误说明并标记 invalid。
- 已完成：`LoginPage.vue` 为 `.login-error` 设置 `id="login-error"`；错误存在时，两个凭据输入框设置 `aria-invalid="true"` 与 `aria-describedby="login-error"`。
- 已验证：红灯为 alert `id` 为 `undefined`；修复后 `login-page.test.ts` `6/6 passed`，相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 已验证：`npm run test:unit:coverage` `45 files / 213 tests passed`，coverage total lines/statements `17.74%`、branches `70.16%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `99.58%`。
- 已验证：前端全量 `npm run test:unit` `45 files / 213 tests passed`，`npm run lint` 通过。
- 下一步：继续补登录页后端错误展示，或转向其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Login Page Failed Login Password Clear 更新

- 已完成：扩展 `login-page.test.ts`，覆盖登录失败后必须显示错误、保留用户名、清空密码且不跳转。
- 已完成：`LoginPage.vue` 在登录失败 catch 分支清空 `password`。
- 已验证：红灯为密码输入框仍保留 `wrong-password`；修复后 `login-page.test.ts` `7/7 passed`，相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`。
- 已验证：`npm run test:unit:coverage` `45 files / 214 tests passed`，coverage total lines/statements `17.74%`、branches `70.18%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `100%`。
- 已验证：前端全量 `npm run test:unit` `45 files / 214 tests passed`，`npm run lint` 通过。
- 下一步：评估失败后焦点是否需要回到密码框，或转向其他 0 覆盖关键组件；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。

## 2026-05-31 6.6 Login Page Failed Login Focus Recovery 更新

- 已完成：扩展 `login-page.test.ts`，覆盖登录失败并清空密码后焦点必须回到密码输入框。
- 已完成：`LoginPage.vue` 为密码输入框增加 `ref`，失败路径在 `nextTick` 后执行焦点恢复。
- 已验证：红灯为 `document.activeElement` 仍是 `body`；修复后 `login-page.test.ts` `8/8 passed`。
- 已验证：相邻 `auth.store.test.ts` / `auth-token.test.ts` / `router-auth.test.ts` 合计 `11/11 passed`；`npm run test:unit:coverage` `45 files / 215 tests passed`，coverage total lines/statements `17.75%`、branches `70.19%`、functions `61.15%`，`LoginPage.vue` 行覆盖 `100%`。
- 已验证：前端全量 `npm run test:unit` `45 files / 215 tests passed`，`npm run lint` 通过。
- 下一步：继续转向其他 0 覆盖关键组件或补登录页更细粒度字段错误策略；发布级 hosted CI / staging / 灰度 / 安全签字 / 两周观察窗口仍待补证。
