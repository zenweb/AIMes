# 2026-05-30 Sprint 1 后续待办

## 已完成

- [x] 1.1 / C1：审计确认 `api/anomaly.ts` 无 URL 双前缀。
- [x] 1.2 / C2：审计确认 `ChatPanel.renderMarkdown()` 已先 HTML escape。
- [x] 1.3 / C3：新建用户强制首次改密，普通 API 在改密前返回 403。
- [x] 1.4 / C3：移除 EF 模型种子中的固定系统用户哈希，改为 Development/Test 运行期 demo seed。
- [x] 1.5 / C4：Refresh Token 哈希存储补审计测试，证明明文 token 不落库。
- [x] 1.6 / C5：`NotificationHub.Subscribe` 增加频道白名单 + 角色映射。
- [x] 1.8 / C7：审计确认 `MetricsBackgroundService` 已注入 `ILogger` 且无 `Console.Error.WriteLine`。
- [x] 1.9 / C8：Production 数据库启动失败设置 `Environment.ExitCode=1` 并重新抛出。
- [x] 1.10 / C9：`SigningKeyStore` 修复 key 轮转发布顺序并补并发安全门禁。
- [x] 1.11 / C10：登录/改密限流改为 IP + username 分区。
- [x] 1.7 / C6：6 个 Agent 每个 ≥ 6 个单测，覆盖成功路径、规则/空结果降级、LLM 异常降级、检索异常降级、prompt 长度边界、token 预算；复审补齐 CancellationToken 传播、Anomaly vector retrieval fallback、Scheduling trace token 记录，并经 OMX 限定 diff 审查 `APPROVE`。

## P0 下一步

- [ ] Sprint 2：按计划进入数据可靠性链路，优先处理静默降级和事务缺失项。
- [x] Sprint 2：`QualityAgent` LLM/retrieval 失败语义已收口为 fail-closed；`InspectWithAIAsync()` 在检索失败、LLM 空结果和 LLM 异常时统一返回 `IsPassed = false`，并已补单测验证。

## P1

- [ ] 为前端首登改密补正式页面/交互，而不是只依赖服务端 403 和 Admin 表状态。
- [ ] 评估 Development 演示账号是否需要改为一次性随机密码并打印到启动日志。

## 回归命令

- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~AuthControllerTests|FullyQualifiedName~AdminControllerTests|FullyQualifiedName~DatabaseStartupValidatorTests"`
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~Login_ShouldPersistOnlyHashedRefreshToken"`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~NotificationHubChannelPolicyTests"`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~DatabaseStartupFailureHandlerTests"`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~SigningKeyStoreTests"`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~AuthRateLimitPartitionKeyTests"`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~AnomalyAgentTests|FullyQualifiedName~KnowledgeAgentTests|FullyQualifiedName~MaintenanceAgentTests|FullyQualifiedName~ProcessParameterAgentTests|FullyQualifiedName~QualityAgentTests|FullyQualifiedName~SchedulingAgentTests" --no-restore`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj --filter "FullyQualifiedName~AnomalyAgentTests|FullyQualifiedName~KnowledgeAgentTests|FullyQualifiedName~MaintenanceAgentTests|FullyQualifiedName~ProcessParameterAgentTests|FullyQualifiedName~QualityAgentTests|FullyQualifiedName~SchedulingAgentTests|FullyQualifiedName~VectorStoreServiceTests" --no-restore`
- `dotnet test src/tests/MES.Tests.Unit/MES.Tests.Unit.csproj`
- `npm run lint`
