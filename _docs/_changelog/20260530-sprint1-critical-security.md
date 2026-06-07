# 2026-05-30 Sprint 1 Critical 安全链路

## 完成

- 审计确认 1.1 / C1：`src/frontend/src/api/anomaly.ts` 当前以 `/anomaly` 为模块基路径，配合 Axios `baseURL=/api/v1` 不会产生 `/api/v1/api/v1` 双前缀。
- 审计确认 1.2 / C2：`ChatPanel.renderMarkdown()` 先执行 `escapeHtml(text)`，再替换有限 Markdown 标签；当前未发现原始 HTML 直通。
- 完成 1.3 / C3：新增 `SystemUser.MustChangePassword`，管理员新建用户默认强制首次改密。
- 完成 1.4 / C3：移除 EF `HasData` 中的 `admin/operator1` 固定系统用户哈希，改为 Development/Test 运行期 demo seed；Production 不再由模型种子注入默认账号。
- 新增 `/api/v1/auth/change-password`，校验当前密码后更新哈希并清除 `MustChangePassword`。
- JWT 增加 `must_change_password` claim；新增 `PasswordChangeRequiredMiddleware`，对必须改密用户拦截普通 API 请求并返回 403，仅放行改密、登出和健康检查。
- 登录响应、Admin 用户 DTO、前端 auth store 与 Admin 用户表同步 `mustChangePassword` 字段。
- 前端移除 `123456` 演示密码提示和“默认 aimes123”新建用户占位，创建按钮要求填写初始密码。
- 完成 1.5 / C4：审计确认 Refresh Token 登录、刷新、登出均使用 SHA-256 哈希查找；补充集成测试证明明文 refresh token 不落库。
- 完成 1.6 / C5：`NotificationHub.Subscribe` 增加频道类型到角色的授权映射，阻止低权限角色订阅质量、设备、物料等不匹配频道。
- 审计确认 1.8 / C7：`MetricsBackgroundService` 已构造注入 `ILogger<MetricsBackgroundService>`，异常路径使用结构化 `LogError`，无 `Console.Error.WriteLine`。
- 完成 1.9 / C8：新增 `DatabaseStartupFailureHandler`，Production 数据库启动失败时记录 critical log、设置 `Environment.ExitCode=1` 并重新抛出；Development 仍允许无持久化模式。
- 完成 1.10 / C9：`SigningKeyStore` 轮转改为先写入新 key、再用 `Volatile.Write` 发布 `_currentKid`；读当前 kid 使用 `Volatile.Read`，有效 key 列表返回快照。
- 完成 1.11 / C10：登录/改密限流按 IP + username 分区；新增中间件预读认证请求 username 并重置 body，避免影响 Minimal API 绑定。
- 完成 1.7 / C6：6 个 Agent 单测均 ≥ 6 条，覆盖成功路径、规则/空结果降级、非取消异常降级、检索异常降级、prompt 长度边界和 token 预算记录。
- 新增 `AiPromptBudget`，对 Agent 发送给 LLM 的 prompt 做 4000 token 估算上限裁剪，避免历史案例或用户输入导致 prompt 无界增长。
- `AnomalyAgent`、`KnowledgeAgent`、`MaintenanceAgent`、`ProcessParameterAgent`、`QualityAgent` 补充非 `OperationCanceledException` 的 LLM 失败降级；`SchedulingAgent` 复用现有规则引擎降级并增加 prompt 预算裁剪。
- `KnowledgeAgent`、`MaintenanceAgent`、`ProcessParameterAgent`、`QualityAgent` 补充 embedding/vector 检索失败降级，避免检索服务异常打穿 Agent 调用链。
- C6 复审修复：Agent/vector I/O 调用显式传递 `CancellationToken`；`VectorStoreService.StoreAsync` 增加可选 `CancellationToken` 并在取消时不写入。
- C6 复审补强：`AnomalyAgent` 增加 vector 检索非取消异常 fallback 与取消异常冒泡测试；`SchedulingAgent` 的 `AiDecisionTrace` 增加 token 估算记录，补齐 6 个 Agent 的 token 预算验收矩阵。
- OMX 限定 diff 外部审查最终结论：`APPROVE`，无阻断 Sprint 2 的 HIGH/CRITICAL；非阻断观察为 `QualityAgent` fallback 仍是 fail-open 占位语义，后续需明确生产质检策略。

## 迁移

- 新增 `20260530090000_AddSystemUserMustChangePassword`：
  - 删除旧模型种子 `su-001` / `su-002`。
  - `system_users` 增加 `must_change_password boolean not null default true`。
- 同步 `MesDbContextModelSnapshot`，防止后续 EF 误判 pending model changes。

## 验证

- 先红：`GetUsers_WhenPasswordChangeRequired_ShouldReturnForbidden` 旧实现返回 200。
- 先红：`ChangePassword_ShouldClearPasswordChangeRequirement` 旧实现返回 404。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~ChangePassword_ShouldClearPasswordChangeRequirement|FullyQualifiedName~GetUsers_WhenPasswordChangeRequired_ShouldReturnForbidden"`：2 passed。
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
- 先红：Agent C6 新增测试暴露 11 个失败，集中在 LLM 非取消异常未降级、prompt 未做预算裁剪。
- 先红：Agent C6 retrieval 审计新增测试暴露 4 个失败，集中在 embedding/vector 检索异常直接冒泡。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~AnomalyAgentTests|FullyQualifiedName~KnowledgeAgentTests|FullyQualifiedName~MaintenanceAgentTests|FullyQualifiedName~ProcessParameterAgentTests|FullyQualifiedName~QualityAgentTests|FullyQualifiedName~SchedulingAgentTests" --no-restore`：40 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：351 passed。
- 先红：C6 复审新增 `PassesCancellationTokenToVector*` 测试 6 个失败，证明 vector search/upsert 未接收调用方 `CancellationToken`。
- 先红：`VectorStoreServiceTests.StoreAsync_WhenCancellationRequested_DoesNotStoreDocument` 编译失败，证明 public `StoreAsync` 缺少 `CancellationToken` 参数。
- 先红：`SchedulingAgentTests.OptimizeScheduleAsync_WhenPromptWouldOverflow_SendsBoundedPrompt` 断言 `TokensInput <= 4000` 时失败，证明 Scheduling trace 未记录 token 预算。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~AnomalyAgentTests|FullyQualifiedName~KnowledgeAgentTests|FullyQualifiedName~MaintenanceAgentTests|FullyQualifiedName~ProcessParameterAgentTests|FullyQualifiedName~QualityAgentTests|FullyQualifiedName~SchedulingAgentTests|FullyQualifiedName~VectorStoreServiceTests" --no-restore`：49 passed。
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --no-restore`：360 passed。
- `git diff --check -- src/backend/MES.AI/Agents src/backend/MES.AI/Services src/tests/MES.Tests.Unit/AI`：仅 LF/CRLF 提示，无 whitespace error。
- `omx exec` 限定 C6 diff 外部审查：最终 `APPROVE`，无阻断 Sprint 2 的 HIGH/CRITICAL。
