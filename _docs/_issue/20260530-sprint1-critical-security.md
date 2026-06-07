# 2026-05-30 Sprint 1 Critical 安全问题记录

## S1-C1：Anomaly API URL 双前缀风险

- 计划项：1.1 / C1。
- 当前结果：审计通过。
- 证据：`src/frontend/src/api/http.ts` 的 `baseURL` 为 `/api/v1`；`src/frontend/src/api/anomaly.ts` 使用 `/anomaly` 作为模块路径。
- 风险状态：未复现双前缀。

## S1-C2：ChatPanel Markdown HTML 注入风险

- 计划项：1.2 / C2。
- 当前结果：审计通过。
- 证据：`ChatPanel.renderMarkdown()` 第一阶段调用 `escapeHtml(text)`，后续只替换有限 Markdown 标签。
- 风险状态：当前未发现原始 HTML 直通；若后续引入完整 Markdown，应引入 sanitizer 后重新审计。

## S1-C3：新建用户未强制首次改密

- 计划项：1.3 / C3。
- 初始状态：`SystemUser` 无首次改密字段；登录响应也不携带该状态。
- 修复：
  - 新增 `SystemUser.MustChangePassword`。
  - 新建用户默认 `MustChangePassword=true`。
  - 新增 `/api/v1/auth/change-password`，成功改密后清除标志。
  - JWT 增加 `must_change_password` claim，普通 API 在改密前返回 403。
- 验证：`GetUsers_WhenPasswordChangeRequired_ShouldReturnForbidden` 与 `ChangePassword_ShouldClearPasswordChangeRequirement` 先红后绿。

## S1-C4：模型种子携带固定系统用户哈希

- 计划项：1.4 / C3。
- 初始状态：`DataSeeder` 使用 `HasData` 注入 `admin/operator1`，两者共享固定 PBKDF2 哈希。
- 修复：
  - 删除 `DataSeeder` 中 `SystemUser.HasData`。
  - 新增 EF migration 删除旧种子并添加 `must_change_password` 列。
  - Development/Test 运行期 demo seed 保留演示账号，但强制首次改密。
- 验证：Auth/Admin 集成测试 10 passed；Unit 314 passed。

## S1-C5：Refresh Token 明文落库风险

- 计划项：1.5 / C4。
- 当前结果：已审计通过并补测试。
- 证据：登录签发 refresh token 时存储 `HashToken(tokenStr)`；刷新和登出均先对请求 token 做 SHA-256 后再查询。
- 新增验证：`Login_ShouldPersistOnlyHashedRefreshToken` 断言数据库中存在 SHA-256 Base64 哈希，且不存在响应返回的明文 refresh token。
- 风险状态：当前闭环。

## S1-C6：SignalR Subscribe 缺角色映射

- 计划项：1.6 / C5。
- 初始状态：`NotificationHub` 已有频道格式和前缀白名单，但没有按角色限制频道类型。
- 修复：
  - 新增频道前缀到角色的映射。
  - `Subscribe` / `Unsubscribe` 使用当前用户角色校验频道。
  - 保留系统频道和非法前缀拒绝逻辑。
- 验证：`NotificationHubChannelPolicyTests` 覆盖不匹配角色拒绝、匹配角色放行，共 9 passed。

## S1-C7：MetricsBackgroundService 使用 Console.Error 风险

- 计划项：1.8 / C7。
- 当前结果：审计通过，无需代码修复。
- 证据：`MetricsBackgroundService` 构造函数注入 `ILogger<MetricsBackgroundService>`，异常路径调用 `_logger.LogError(ex, "Metrics push failed")`。
- 风险状态：当前未发现 `Console.Error.WriteLine`。

## S1-C8：Production 数据库不可达未显式非 0 退出

- 计划项：1.9 / C8。
- 初始状态：Production 启动异常会 `throw`，但没有集中设置 `Environment.ExitCode` 的测试证据。
- 修复：
  - 新增 `DatabaseStartupFailureHandler`。
  - Production 分支记录 critical log、设置 `Environment.ExitCode=1` 并要求 rethrow。
  - Development 分支保持 warning + 继续无持久化模式。
- 验证：`DatabaseStartupFailureHandlerTests` 2 passed；Auth/Admin/JWT 相关集成 13 passed。

## S1-C9：SigningKeyStore 轮转发布顺序并发风险

- 计划项：1.10 / C9。
- 初始状态：`Rotate()` 先写 `_currentKid`，再把新 key 放入字典；并发读 `CurrentKey` 理论上可看到新 kid 但字典尚无该 key。
- 修复：
  - 构造和轮转时先写 `_keys[kid]`。
  - 使用 `Volatile.Write(ref _currentKid, kid)` 发布当前 kid。
  - `CurrentKey` / `CleanupExpired` 使用 `Volatile.Read`。
  - `GetAllValidKeys()` 返回快照数组。
- 验证：`SigningKeyStoreTests` 8 passed。

## S1-C10：登录限流只按 IP 分区

- 计划项：1.11 / C10。
- 初始状态：Auth rate limiter 只使用 `RemoteIpAddress` 作为 partition key，同 IP 下不同账号共享配额。
- 修复：
  - 新增 `AuthRateLimitUsernameMiddleware`，在 RateLimiter 前预读 login/change-password 请求体中的 username，并重置 body。
  - 新增 `AuthRateLimitPartitionKey`，生成 `ip|normalizedUsername`。
  - `Program.cs` 的 Auth rate limit policy 使用 IP + username 分区。
- 验证：`AuthRateLimitPartitionKeyTests` 3 passed；Auth/Admin/JWT 相关集成 13 passed。

## S1-C11：Agent 单测深度不足与 prompt 无界增长

- 计划项：1.7 / C6。
- 初始状态：6 个 Agent 测试各约 3 条，未覆盖 LLM 异常降级与 prompt/token 预算边界。
- 先红：
  - 新增 C6 测试后 11 个失败，集中在 LLM 非取消异常直接冒泡、超长 prompt 原样发送。
  - retrieval 审计新增测试后 4 个失败，集中在 embedding/vector 检索异常直接冒泡。
- 修复：
  - 新增 `AiPromptBudget`，按现有 `AiTraceFactory.EstimateTokens` 口径限制 prompt 估算输入 token 不超过 4000。
  - `AnomalyAgent`、`KnowledgeAgent`、`MaintenanceAgent`、`ProcessParameterAgent`、`QualityAgent` 对 LLM 非取消异常返回可审计降级结果。
  - `KnowledgeAgent`、`MaintenanceAgent`、`ProcessParameterAgent`、`QualityAgent` 对 embedding/vector 检索非取消异常返回可审计降级结果。
  - `SchedulingAgent` 继续使用规则引擎 fallback，并对 LLM prompt 做预算裁剪。
  - Agent/vector I/O 调用显式传递调用方 `CancellationToken`；`VectorStoreService.StoreAsync` 增加可选 `CancellationToken` 并在取消时不写入。
  - `AnomalyAgent` 补齐 vector 检索非取消异常 fallback 与取消异常冒泡测试。
  - `SchedulingAgent` 的 `AiDecisionTrace` 增加 prompt/output token 估算记录，补齐 token 预算验收矩阵。
  - 6 个 Agent 测试文件分别补到 9/9/8/8/8/6 条。
- 验证：
  - Agent C6 过滤测试 40 passed。
  - 完整 Unit 项目 351 passed。
  - C6 + VectorStore 定向测试 49 passed。
  - 完整 Unit 项目 360 passed。
  - `git diff --check` 仅 LF/CRLF 提示，无 whitespace error。
  - OMX 限定 C6 diff 外部审查最终 `APPROVE`，无阻断 Sprint 2 的 HIGH/CRITICAL。

## 剩余风险

- 前端暂未提供专门的首登改密页面；服务端已经强制拦截，用户体验需后续补齐。
- Development 演示账号仍有公开凭据，虽然不进入 Production 模型种子，仍建议后续改为一次性随机密码。
- Prompt token 预算当前为字符数估算，不是 provider 原生 tokenizer；后续若模型计费/限流更严格，应替换为真实 tokenizer。
- `QualityAgent` fallback 当前返回 `IsPassed=true` 的占位/人工复核前结果；生产质检闭环前需明确 fail-open / fail-closed 策略。
