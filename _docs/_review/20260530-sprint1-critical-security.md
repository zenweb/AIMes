# 2026-05-30 Sprint 1 Critical 安全审计

## 范围

来源计划：`C:\AIWorks\AIMes\_docs\_plan\20260514-cc-remediation-plan.md` 的 Sprint 1 / 1.1-1.11。

执行仓库：`C:\AIWorks\AIMes\v1`。

## 结论

- 1.1 / C1：已审计通过，无需代码修复。
- 1.2 / C2：已审计通过，当前 Markdown 渲染先转义再替换有限标签。
- 1.3 / C3：已实现。管理员创建用户必须给初始密码，账号默认 `MustChangePassword=true`，普通 API 被服务端拦截直到完成改密。
- 1.4 / C3：已实现。生产模型种子不再携带固定系统用户哈希；Development/Test 仍保留演示账号，但标记首次改密。
- 1.5 / C4：已审计并补测试。Refresh Token 只以 SHA-256 哈希落库和查询。
- 1.6 / C5：已实现。SignalR 实体频道订阅同时校验格式、白名单前缀和角色映射。
- 1.8 / C7：已审计通过。`MetricsBackgroundService` 已使用 `ILogger`，无 `Console.Error.WriteLine`。
- 1.9 / C8：已实现。Production 数据库启动失败会设置进程退出码 1 并重新抛出。
- 1.10 / C9：已实现。Signing key 轮转采用先写 key 后发布 kid 的并发安全顺序。
- 1.11 / C10：已实现。认证限流分区键包含 IP + username。
- 1.7 / C6：已实现并复审通过。6 个 Agent 各 ≥ 6 条单测，覆盖成功、降级、LLM 异常、检索异常、prompt 边界、token 预算；外部限定 diff 审查最终 `APPROVE`，无阻断 Sprint 2 的 HIGH/CRITICAL。

## 审计要点

| 项 | 证据 | 状态 |
|---|---|---|
| Anomaly URL | `http.ts` baseURL 为 `/api/v1`，`anomaly.ts` BASE 为 `/anomaly` | 通过 |
| Chat HTML 注入 | `renderMarkdown()` 使用 `escapeHtml(text)` 作为第一步 | 通过 |
| 新建用户首次改密 | `AdminControllerTests.CreateUser_ShouldReturnCreated` 断言 `MustChangePassword=true` | 通过 |
| 必须改密拦截 | `PasswordChangeRequiredMiddleware` + 集成测试返回 403 | 通过 |
| 改密清标志 | `/auth/change-password` + 集成测试重新登录后 `MustChangePassword=false` | 通过 |
| 生产默认账号 | `DataSeeder` 删除 `SystemUser.HasData`，迁移删除旧种子 | 通过 |
| Refresh Token 哈希 | `Login_ShouldPersistOnlyHashedRefreshToken` 断言落库值为 SHA-256 且不含明文 | 通过 |
| SignalR 频道权限 | `NotificationHubChannelPolicyTests` 覆盖角色不匹配拒绝、匹配放行 | 通过 |
| Metrics 日志 | `MetricsBackgroundService` 构造注入 `ILogger<MetricsBackgroundService>`，异常 `LogError` | 通过 |
| Production DB 失败退出 | `DatabaseStartupFailureHandlerTests` 断言 Production 设置 `Environment.ExitCode=1` | 通过 |
| SigningKeyStore 并发发布 | `SigningKeyStoreTests` 源码门禁断言先 `_keys[kid]` 后 `Volatile.Write` | 通过 |
| 登录限流分区 | `AuthRateLimitPartitionKeyTests` 断言 IP + username 组合和 username 规范化 | 通过 |
| Agent 测试深度 | 6 个 `*AgentTests` 文件分别为 9/9/8/8/8/6 条；C6 聚焦成功、降级、异常、prompt 预算 | 通过 |
| Prompt 预算 | `AiPromptBudget` 将 LLM prompt 限制在 4000 token 估算上限内 | 通过 |
| Agent 异常降级 | LLM 生成异常与 embedding/vector 检索异常均有回归测试，取消异常仍冒泡 | 通过 |
| CancellationToken 传播 | Agent 到 vector store 的 search/upsert 调用均显式传递调用方 token；`VectorStoreService.StoreAsync` 取消时不写入 | 通过 |
| 外部代码审查 | OMX 限定 C6 diff 三轮审查，修复 mock 签名、Anomaly retrieval fallback 覆盖、Scheduling token trace 后最终 `APPROVE` | 通过 |

## 边界

- 当前改密接口使用用户名 + 当前密码，适合首次改密闭环；后续若要更强会话绑定，可在登录后用 JWT 调用改密并校验 `ClaimTypes.Name`。
- Refresh token 实体仍只存 token 哈希、用户名、角色、显示名；刷新时实时查询用户的 `MustChangePassword` 状态再写入新 access token claim。
- Development 演示账号仍存在 `admin/admin123`，但只在 Development seed 中创建且会被强制改密；Production 不由 EF model seed 注入该账号。
- Agent prompt 预算当前使用字符数 / 4 的保守估算，与现有 `AiTraceFactory.EstimateTokens` 保持一致；后续如接入 provider 原生 tokenizer，应替换为模型真实 token 计数。
- `QualityAgent` 在 LLM/retrieval 失败时仍返回 `IsPassed=true` 的人工复核前占位结果；该语义延续当前占位能力，后续进入生产质检闭环前需明确 fail-open / fail-closed 策略。

## 验证

- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~AuthControllerTests|FullyQualifiedName~AdminControllerTests|FullyQualifiedName~DatabaseStartupValidatorTests"`：10 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj`：314 passed。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~Login_ShouldPersistOnlyHashedRefreshToken"`：1 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~NotificationHubChannelPolicyTests"`：9 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj`：323 passed。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~AuthControllerTests|FullyQualifiedName~AdminControllerTests|FullyQualifiedName~DatabaseStartupValidatorTests"`：11 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~DatabaseStartupFailureHandlerTests"`：2 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj`：325 passed。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~AuthControllerTests|FullyQualifiedName~AdminControllerTests|FullyQualifiedName~DatabaseStartupValidatorTests|FullyQualifiedName~JwtStartupValidationTests"`：13 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SigningKeyStoreTests"`：8 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~AuthRateLimitPartitionKeyTests"`：3 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj`：329 passed。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~AuthControllerTests|FullyQualifiedName~AdminControllerTests|FullyQualifiedName~DatabaseStartupValidatorTests|FullyQualifiedName~JwtStartupValidationTests"`：13 passed。
- `npm run lint`：通过，0 warnings。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~AnomalyAgentTests|FullyQualifiedName~KnowledgeAgentTests|FullyQualifiedName~MaintenanceAgentTests|FullyQualifiedName~ProcessParameterAgentTests|FullyQualifiedName~QualityAgentTests|FullyQualifiedName~SchedulingAgentTests" --no-restore`：40 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：351 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~AnomalyAgentTests|FullyQualifiedName~KnowledgeAgentTests|FullyQualifiedName~MaintenanceAgentTests|FullyQualifiedName~ProcessParameterAgentTests|FullyQualifiedName~QualityAgentTests|FullyQualifiedName~SchedulingAgentTests|FullyQualifiedName~VectorStoreServiceTests" --no-restore`：49 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：360 passed。
- `git diff --check -- src/backend/MES.AI/Agents src/backend/MES.AI/Services src/tests/MES.Tests.Unit/AI`：仅 LF/CRLF 提示，无 whitespace error。
- `omx exec` 限定 C6 diff 外部审查：最终 `APPROVE`，无阻断 Sprint 2 的 HIGH/CRITICAL。
