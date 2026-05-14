# Sprint 1 — Critical / High 安全链修复

> 基于审计发现修复计划，完成 Sprint 1 全部任务
> 日期: 2026-05-14

---

## 完成项

### C5: NotificationHub Subscribe 频道授权
- **文件**: `src/MES.Api/Hubs/NotificationHub.cs`
- **改动**: 添加频道名称白名单验证
  - 保留频道（`all`, `Admin`, `Operator`, `Lead`, `Engineer`）禁止客户端订阅
  - 允许的前缀: `equipment:`, `order:`, `anomaly:`, `quality:`, `material:`
  - 格式校验: 正则 `^[a-zA-Z][\w-]+:[\w-]+$`
  - 拒绝时抛 `HubException` 而非静默失败

### C6: AI Agent 单元测试（18 个）
- **文件**: `tests/MES.Tests.Unit/AI/{SchedulingAgent,QualityAgent,AnomalyAgent,KnowledgeAgent,MaintenanceAgent,ProcessParameterAgent}Tests.cs`
- **覆盖**:
  - `SchedulingAgent` (3): 成功路径、约束验证失败回退、LLM 异常回退
  - `QualityAgent` (3): 视觉检测、根因分析、SPC 趋势分析
  - `AnomalyAgent` (3): 规则引擎、LLM 不可用回退、关键词覆盖
  - `KnowledgeAgent` (3): 问答、文档索引、相似文档搜索
  - `MaintenanceAgent` (3): 故障预测、维护建议、遥测异常检测
  - `ProcessParameterAgent` (3): 参数推荐、参数优化、最佳工艺匹配

### C3a: Admin 创建用户密码非空校验
- **文件**: `src/MES.Api/Endpoints/AdminEndpoints.cs`
- **改动**: `request.Password ?? throw new InvalidOperationException("密码不能为空")`
- **测试修复**: `AdminControllerTests.CreateUser_ShouldReturnCreated` 添加 Password 字段

### H17: SigningKeyStore 并发安全优化
- **文件**: `src/MES.Api/Services/SigningKeyStore.cs`
- **改动**: `CleanupExpired()` 从 `GetAllValidKeys()` 和 `GetKeyById()` 读路径移除，仅由 `Rotate()` 触发

### H18: 登录速率限制 IP 分区
- **文件**: `src/MES.Api/Program.cs`
- **改动**: 全局 `FixedWindowLimiter` → `PartitionedRateLimiter` 按 `RemoteIpAddress` 分区
- **策略**: 每个 IP 每分钟 10 次，不再共享全局配额

---

## 测试结果

| 套件 | 状态 | 详情 |
|------|------|------|
| 单元测试 | ✅ 238/238 通过 | +18 新增 AI Agent 测试 |
| 集成测试 | ✅ 85/85 通过 | AdminControllerTests 修复 Password 缺失 |
| 构建 | ✅ 0 错误 0 警告 | |

## Sprint 1 完成状态

| 编号 | 描述 | 状态 |
|------|------|------|
| C1 | Anomaly API URL 修复 | ✅ 之前完成 |
| C2 | ChatPanel XSS 防护 | ✅ 之前完成 |
| C3a | Admin 默认密码移除 | ✅ 本次确认 |
| C3b | Seed 空密码哈希修复 | ✅ 之前完成 |
| C4 | Refresh Token 哈希存储 | ✅ 之前完成 |
| C5 | NotificationHub 频道授权 | ✅ 本次完成 |
| C6 | AI Agent 单元测试 | ✅ 本次完成 (18 tests) |
| C7 | Console.Error → ILogger | ✅ 之前完成 |
| H17 | SigningKeyStore 并发安全 | ✅ 本次完成 |
| H18 | 登录速率限制分区 | ✅ 本次完成 |
