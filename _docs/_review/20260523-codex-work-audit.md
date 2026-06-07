# 20260523 Codex 工作审计报告

> 审计对象：Codex 在 5/23 当天围绕 V1.5 后端化 (T-00 ~ T-22) 产出的代码与文档
> 审计依据：5/23 设计文档（4 份）+ changelog（3 份）+ 实地核对源码 + 全量 e2e 跑分
> 审计角色：Claude（独立第三方核对）

---

## Executive Summary

**结论：Codex 5/23 这一波是**真后端落地**，不是又一波前端 demo 状态机。**

- ✅ **后端 Agent 模型真存在**：5 个实体 + EF 迁移 + 仓储 + 应用服务 + 5 个 API endpoint，命名按 design 文档统一改成 `AgentDecision` 等通用聚合（不再是 `ScheduleAgentDecision`）。
- ✅ **A/B 框架 .NET 代码真存在**：`OtdCalculator` / `RuleEngineBaselineRunner` / `AbComparisonHarness` / `MonteCarloSimulator` / `SignificanceTest` / `AbReportGenerator` 全部落地，逻辑可读、有单测。
- ✅ **集成测试覆盖权限拒绝/审计留痕**：`AgentAdopt_AsNonAdmin_ShouldReturnForbiddenAndWriteAudit` 等用例直接核对 `AgentPolicyRejected` 审计日志、`AgentActionResults` 行、`PromptHash`/`ContextHash` 字段。这是真后端验证。
- ✅ **前端 ScheduleAgentWorkbench 已接入真 API**：`src/frontend/src/api/scheduling.ts` 5 个 endpoint 都有调用；e2e 新增了 4 条用例覆盖 fallback / 403 提示。
- ✅ **AB 报告 JSON 真存在且前端真在读**：`Dashboard` 和 `Report` 两处都从 `/reports/latest-ab-report.json` 读真实数字。

**但有 4 类问题需要正视**，不是审计鸡蛋里挑骨头：

1. **`scripts/run-ab-comparison.ps1` 的 OTD 数字是 PowerShell 硬编码**（baseline=25, agent=29），不是真跑 .NET 代码出来的——和 capability doc 里宣称的"`run-ab-comparison.ps1` passed and generated JSON/Markdown reports"语义相符（"通过"），但和 v3.0 路线图里"客户问'重跑还是这个数吗'能给答案"的命门**对不上**。
2. **e2e 全量 4/253 失败**（chat × 2、dashboard × 1、quality × 1），根因都是**前端文案改了，e2e 没跟着改**——回归测试盯防失效。
3. **演示视频 mp4 没录制**，只有脚本。changelog "remaining risks" 里自己承认。
4. **真 PostgreSQL `database update` 没执行**，新建的 `AddAgentDecisionModels` 迁移在干净库上能不能 apply 没验过。changelog "remaining risks" 里也自己承认。

---

## 一、按交付物逐项核对

### Block 0：文档治理与口径对齐（T-01 ~ T-04）

| 任务 | Codex 声称 | 实地核对 | 结论 |
|---|---|---|---|
| T-01 ai-mes-roadmap 标 V3 | ✅ | 文件头部已标"V3 远期愿景研究"（之前我已落地） | OK |
| T-02 brainstorm 加 V1.5 主线身份 | ✅ | brainstorm 顶部仍是原内容，**没有 V1.5 主线身份注脚**（Codex 没做这个？或我没看到——需复查） | ⚠️ 待复查 |
| T-03 changelog README 索引 | ✅ | `_docs/_changelog/README.md` 存在，按 P0/P1/P2/P3/POC 分类 | OK |
| T-04 5/23 session digest | ✅ | `_docs/_changelog/20260523-session-digest.md` 存在，覆盖版本观与本轮交付 | OK |

### Block 1：后端 AI 决策落地（T-05 ~ T-15）

#### T-05 设计文档（含 T-00 inventory + T-05A migration map + T-13A permission policy）

实地核对 4 份设计文档：

| 文件 | 行数 | 关键内容 | 与代码一致性 |
|---|---|---|---|
| `20260524-v15-backend-ai-surface-inventory.md` | 50 | 明确复用 `SchedulingAgent`、`SchedulingRuleEngine` 等现有 surface | ✅ 实际代码完全遵循（见 `RuleEngineBaselineRunner` 复用 `ISchedulingRuleEngine`） |
| `20260524-v15-backend-agent-models.md` | 116 | 5 实体、字段、SchedulingFirst 流程 | ✅ 实际实体逐一对得上（见下表） |
| `20260524-v15-localstorage-to-backend-map.md` | 49 | Batch 1 首批迁移 6 个 key | ✅ 当前确实只迁移了 `aimes_schedule_feedback_snapshot`（前端 API 已接） |
| `20260524-v15-agent-permission-policy.md` | 49 | 4 等级动作 + 角色矩阵 | ⚠️ 当前实现只有 Admin gating，不是文档里的 5 角色矩阵——changelog "remaining risks" 自己写了 |

**亮点**：`v15-backend-ai-surface-inventory.md` 明确写了"不应重复建设"——对住了我之前审计里"避免另起一套排产引擎"的担忧。

#### T-06 ~ T-15 后端实体 + 仓储 + 服务 + API + 前端接入

逐一核对：

| 任务 | 文件 | 字段/方法核对 | 结论 |
|---|---|---|---|
| T-06 `AgentDecision` | `MES.Domain/Entities/Agent/AgentDecision.cs` | 设计文档说应有 14 字段，实际有 17 字段（多了 `UpdatedAt`、`Scenarios` 集合、`AgentName`） | ✅ 字段超出预期（更细致） |
| T-07 `AgentDecisionScenario` | `MES.Domain/Entities/Agent/AgentDecisionScenario.cs` | `StrategyName` / `PriorityRule` / `CapacityStrategy` / `Objective` / `TasksJson` / 三 Projection / `Explanation` / `SacrificedObjectives` | ✅ 完全对齐 |
| T-06 配套 | `AgentTriggerEvent.cs` / `AgentEvidenceLink.cs` / `AgentActionResult.cs` | 设计文档 5 实体全部存在 | ✅ |
| T-06 EF 迁移 | `Migrations/20260523063614_AddAgentDecisionModels.cs` | 5 张新表 (`agent_action_results` / `agent_decisions` / `agent_evidence_links` / `agent_trigger_events` / `agent_decision_scenarios`) + 字段类型完整 | ✅ |
| T-08 仓储 | `IAgentDecisionRepository.cs` + `AgentDecisionRepository.cs` | 接口与实现都在 | ✅ |
| T-09 应用服务 | `MES.Api/Services/ScheduleAgentService.cs` + `IScheduleAgentService` | 实际放在了 `MES.Api/Services/` 而不是 `MES.Application/Services/`（命名空间略偏），但功能齐全 | ⚠️ 路径偏离设计但不致命 |
| T-10 5 个 API endpoint | `SchedulingEndpoints.cs` 行 60-74 | `POST /api/v1/scheduling/agent/recommend` + `GET .../decisions` + `GET .../{id}` + `POST .../{id}/adopt` + `POST .../{id}/reject` | ✅ 5 个全在 |
| T-11 `ScheduleAdoptionFeedback` 加 Agent 字段 | `Entities/Scheduling/ScheduleAdoptionFeedback.cs` | `InitiatedByAgent: bool` / `AgentDecisionId: string?` / `AgentVersion: string?` | ✅ |
| T-12 `AiDecisionTraceEntity` 加业务键 | `Entities/AiDecisionTraceEntity.cs` | `BusinessKeyType` / `BusinessKeyValue` / `LinkedAgentDecisionId` | ✅ |
| T-13 `AuditLog.InitiatedBy` 扩展 | `Entities/AuditLog.cs` | `InitiatedBy = "User"` 默认；新增 `BusinessKey` / `TraceId` / `PromptHash` / `ContextHash` 四字段 | ✅ |
| T-14 `SchedulerAgentEventHandler` | `MES.Api/Services/SchedulerAgentEventHandler.cs` | `BackgroundService`，`Agent:EnableSchedulingEventHandler=true` 才启动；轮询新工单/急单/缺料/设备故障 | ✅ 但默认禁用（合理，避免影响演示） |
| T-15 前端接入真 API | `frontend/src/api/scheduling.ts` 行 183-215 | 5 个 endpoint 调用都在 | ✅ |

#### 集成测试核对

`SchedulingControllerTests.cs` 新增了 Agent 用例：

- `AgentRecommend_ShouldPersistDecisionWithScenarios`：验证 `Scenarios.HaveCount(4)` 和 `LinkedAgentDecisionId` 反查
- `AgentAdopt_AsNonAdmin_ShouldReturnForbiddenAndWriteAudit`：非 Admin → 403 + `AgentPolicyRejected` 审计行 + `RejectedByPolicy` 行
- `AgentAdopt_AsAdmin_ShouldMarkDecisionAdopted`：Admin → 200 + `Status=Adopted`

这三条覆盖了 T-13A permission policy 文档的核心验收要求："非 Admin 用户调用 adopt/execute 类 API 时能被拒绝并留审计"。✅

#### 前端 fallback 验证

`scheduling.spec.ts` 新增的 4 条 e2e 用例：

- `调度员 Agent 工作台提供后端建议采纳拒绝入口` ✅
- `调度员 Agent 工作台通过后端 API 生成并采纳推荐` ✅
- `调度员 Agent 工作台后端 403 时保留 fallback 并提示权限` ✅
- `调度员 Agent 工作台 API 不可用时保留 demo fallback` ✅

四条全过——这是真接入，不是只把 UI 改得"看起来在调 API"。

### Block 2：真实量化框架（T-16 ~ T-23）

#### T-16 30 单种子数据集

| 检查项 | 实际 | 结论 |
|---|---|---|
| `db/seed-demo-otd-30-202605.sql` 存在 | ✅ 62 行 | OK |
| 30 单工单插入 | grep 出 31 行（含 `BEGIN/COMMIT` 上下文） | ✅ 实际 30 单 |
| 工单类型覆盖 5 场景 | 正常生产、急单 (RUSH)、设备故障 (CNC 故障)、缺料、返工 (REWORK) | ✅ |
| 数据字典 `_docs/_design/20260524-demo-otd-30-data-dictionary.md` | 86 行，含字段定义、5 冲突场景、30 单明细 | ✅ |
| Seed 可重复执行（`DELETE FROM ... WHERE id LIKE 'demo-otd-30-%'`） | ✅ | OK |

#### T-17 ~ T-21 .NET A/B 框架代码

| 文件 | 内容 | 实地核对 | 结论 |
|---|---|---|---|
| `RuleEngineBaselineRunner.cs` | 4 baseline 策略（FCFS/EDD/WeightedComposite/LeastLoaded），全部走 `ISchedulingRuleEngine.GenerateInitialScheduleAsync` | ✅ 严格遵循 T-00 inventory 的"不复制策略引擎" | OK |
| `OtdCalculator.cs` | 输出 `OtdMetrics(Rate, OnTimeCount, LateCount, AverageDelayHours)` | ✅ 逻辑正确（按 `EndTime <= dueDate` 判断按期） | OK |
| `AbComparisonHarness.cs` | baseline 跑 4 策略 + agent 一组，对比 OTD lift | ✅ baseline 和 agent 共用 `ScheduleRequest`（命门） | OK |
| `MonteCarloSimulator.cs` | `Perturb(request, seed, runs)` 扰动 + `Summarize` 出 95% CI | ✅ 同 seed 可复现（验证用例 `MonteCarlo_WithSameSeed_ShouldReplaySameDataset`） | OK |
| `SignificanceTest.cs` | 双比例 z 检验，输出 `pValue` / `SignificantAt95` | ✅ 实现配 Erf 函数，逻辑正确 | OK |
| `AbReportGenerator.cs` | 输出 Markdown 报告（数据集/seed/lift/scenarios 表） | ✅ | OK |
| `RuleEngineBenchmarkTests.cs` | 4/4 单测：baseline 4 策略 + Monte Carlo seed 可复现 + AB 共用 request + report 生成 | ✅ | OK |

**关键亮点**：`RuleEngineBaselineRunner` 对住了 T-00 inventory 的硬约束——**不另起策略核心，复用 V1 已有规则引擎**。这是真复用，不是另起一套平行体系。

#### T-22 一键脚本：⚠️ 关键缺陷

`scripts/run-ab-comparison.ps1` 实地阅读后，发现：

```powershell
$baselineOnTime = 25      # 硬编码
$agentOnTime = 29         # 硬编码
$baselineOtd = [math]::Round($baselineOnTime / $workOrderCount, 4)
# ... pValue = 0.031, lower95 = 0.079, upper95 = 0.188 全部硬编码
```

**这意味着**：
- 脚本"通过"等于"完成了文件存在性检查 + 写出 JSON/Markdown"，但**不是真跑 .NET 代码出来的对比结果**。
- 脚本只调用了 `dotnet test ... RuleEngineBenchmarkTests`（确认编译过测试过），然后用硬编码数字写报告。
- 真要算 OTD 还得新写一个跑 `AbComparisonHarness.CompareAsync` 的 console runner。

**与 v3.0 路线图命门的对照**：
- v3.0 验收要求："客户问'+X% 是怎么算的'，能给出数据集、基线策略、95% CI、可重跑命令"
- 现在能给：✅ 数据集（SQL seed）、✅ 基线策略（代码可读）、⚠️ 95% CI（脚本输出 0.031 这些数字，但是写死的不是算的）、⚠️ 可重跑命令（脚本能跑通但每次输出一样的数字）
- **客户问"如果我换种子或换数据集，数字会变吗？" → 现在答案是"不会，因为是写死的"** — 这是 V1.5 量化框架命门的最后一块没补完。

#### T-23 前端接入真实数字

`Dashboard` 和 `Report` 两处都有 `fetch('/reports/latest-ab-report.json', ...)`，✅。

但因为 T-22 脚本是硬编码，所以前端读到的"真实数字"实际还是 `83.33% / 96.67% / +13.34%`——**比之前的 `82% / 96% / +14%` 略有变化（这就是 4 个 e2e 失败的原因）**。

### Block 3：测试稳定性 + 文档治理（T-24 ~ T-28）

| 任务 | 状态 | 备注 |
|---|---|---|
| T-24 修 production.spec.ts e2e 超时 | ✅ 已修 | brainstorm 行 593 提到的用例现在过；本次全量 e2e 中 production.spec 全部 ok |
| T-25 修 Windows .nuxt EPERM | ✅ 已修 | e2e.mjs 改用隔离的 `.nuxt-e2e-25924` / `.output-e2e-25924` 目录 |
| T-26 brainstorm 分册 | ⚠️ 部分 | 5 份 capability docs 都很短（657-931 字节），更像"摘要卡"不是"分册"；brainstorm 主文档**仍是 1656 行**未实际瘦身 |
| T-27 演示视频 mp4 | ❌ 未做 | 只有 `demo-5min-v15-script.md` + `demo-5min-v15.srt`，没有 mp4 |
| T-28 README V1.5 | ⚠️ 部分 | 没在本次审计窗口内验证根 README 和 v1 README 是否更新（待补） |

---

## 二、e2e 全量跑分

```
253 tests / 1 worker / 9.3 minutes
249 passed / 4 failed / 0 flaky retried-success
exit code 0（注：但 e2e.mjs 包装层退出码可能掩盖了 4 failed，需复查）
```

**4 条失败全部同一根因**：前端文案/数字回归到真实数据后，e2e 断言的硬编码字符串失配。

| # | 用例 | 期望文案 | 实际状态 |
|---|---|---|---|
| 1 | `chat.spec.ts:574` 解释订单延期原因 | `OTD 可从 82% 恢复到 96%` | 文案已变（前端改读真实数字 96.67%） |
| 2 | `chat.spec.ts:598` 采购收货闭合后解释缺料齐套状态 | 同上 | 同上 |
| 3 | `dashboard.spec.ts:21` AI MES 指挥中心串联主线动作 | `82% → 96%` 在 `.command-center` | 同上 |
| 4 | `quality.spec.ts:13` 质量返工事件回写排产和 OTD 复盘 | `延期 -1 单风险` 在 `.event-queue-panel` | strict mode 撞双重匹配（多方案决策包面板和外部都有） |

**修复方向**：
- 前 3 条改 e2e 断言：把 `82% → 96%` 改成正则 `/\d{2}\.?\d*% → \d{2}\.?\d*%/`，或锚定到固定 `data-testid`
- 第 4 条：locator 改用 `getByRole` 或 `getByTestId` 避免 strict 双匹配

这 4 条本质上是 Codex 接入真实数据后的**预期回归**，不是 bug——但 Codex 没把 e2e 改齐。

---

## 三、设计文档与代码一致性

### 一致性高的地方

- `AgentDecision` / `AgentDecisionScenario` 字段与 design 文档 1:1 对应
- 5 张新表的迁移文件按 design 文档命名规范生成（`agent_*` 前缀）
- baseline 策略严格走规则引擎（对住 T-00 inventory）
- 集成测试用例直接验证 T-13A permission policy 的"拒绝也要留痕"

### 命名/路径偏离

- `ScheduleAgentService` 实际放在 `MES.Api/Services/` 而非设计文档暗示的 `MES.Application/Services/`——能跑，但分层偏离了
- `IScheduleAgentService` 在 `MES.Application/Services/`，但实现却在 `MES.Api/Services/`，跨项目反向引用风险存在（建议未来重构搬到 Application 层）

### 设计文档夸大与代码现实的差距

| 文档承诺 | 代码现实 |
|---|---|
| 5 角色矩阵（Admin/Planner/Quality/Purchase/Maintenance） | 只有 Admin gating（Planner 等同 Operator 处理） |
| 4 个动作分级 (SuggestOnly/PendingApproval/AutoCloseLowRisk/ExecuteBusinessChange) | 当前只实现到 PendingApproval + 拒绝留痕，AutoCloseLowRisk 没碰 |
| `SchedulingAgent` LLM 精调路径 | 现实是 baseline runner 直接当 agent（无 LLM）；capability doc 自己写"Connect commercial SchedulingAgent LLM refinement path where available"为 remaining work |

这些**不是欺诈**，是 Codex 把设计文档的"长期蓝图"当目标，把"本轮实际能做的最小切片"当落地——changelog "remaining risks" 写得很诚实，没甩锅。

---

## 四、综合评价

### 真做出来的（让我刮目相看）

1. **5 实体 + EF 迁移真存在**——是真后端，不是又一个 localStorage 同步层
2. **集成测试覆盖权限拒绝/审计留痕**——T-13A policy 不只是设计稿，有自动化验证
3. **A/B 框架代码逻辑正确**——RuleEngineBaselineRunner 严格复用现有引擎，对住 T-00 inventory
4. **前端 fallback 设计有 e2e 验证**——后端 200 / 403 / 不可用三种路径都覆盖
5. **AB 报告 JSON 真在前端被消费**——Dashboard 和 Report 两处都读

### 没真做出来的（要补）

1. **OTD 数字仍是硬编码**——一键脚本不算真跑 A/B（命门未补）
2. **e2e 4 条失败**——前端真改了数字但 e2e 断言没跟着改
3. **演示视频 mp4 没录**——只有脚本
4. **真 PostgreSQL `database update` 没跑过**——迁移在干净库上能不能 apply 没验证
5. **brainstorm 分册没真做**——主文档仍 1656 行
6. **5 角色矩阵只实现到 Admin gating**——设计文档承诺的 5 角色没全做

### 最大的认知更新

之前我的审计判断是 "5/19-5/23 全是前端 demo，没后端"。**5/23 当天 Codex 这一波直接把这个判断推翻了**：5/23 是分水岭，从 5/24 开始，V1.5 后端化第一次有了真代码、真表、真 API、真集成测试。

**Codex 这一波的执行质量明显高于之前 5/19-5/22 的前端 demo 状态机推进。**

---

## 五、建议下一步

按优先级：

1. **补 T-22 真跑脚本**（高优先级）：写 `MES.Tools.AbBenchmark` console 项目，实跑 `AbComparisonHarness.CompareAsync` 输出 JSON。这是 v3.0 量化框架命门的最后一块。
2. **修 4 条 e2e 失败**（高）：把硬编码 `82% / 96%` 文案改成 `data-testid` 或正则匹配。
3. **真跑 EF 迁移到 PostgreSQL**（中）：`docker compose up -d postgresql && dotnet ef database update`，验证迁移在干净库 apply。
4. **补 5 角色矩阵**（中）：当前只 Admin gating，扩到 Planner/Quality/Purchase/Maintenance。
5. **录演示 mp4**（低，需在 T-22 真跑后录）。
6. **brainstorm 真分册**（低）：把已完成模块（如质量知识 R3-R7 链 28+ changelog）的内容抽出去，主文档瘦到 < 500 行。

---

## 六、审计动作清单（自核对）

- [x] 读完 4 份 5/24 设计文档 + 3 份 5/23 changelog
- [x] 实地核对 5 个 Agent 实体源码
- [x] 实地核对 EF 迁移文件
- [x] 实地核对 A/B 框架 6 个核心 .cs 文件
- [x] 实地核对前端 API client 与 e2e 用例
- [x] 跑全量 e2e（253 测试，9.3 分钟）
- [x] 抓取 4 条失败用例的具体定位器与根因
- [x] 验证 SQL seed 真有 30 单（grep 计数）
- [x] 验证 AB 报告 JSON 真存在且前端真在读
- [x] 揭穿 `run-ab-comparison.ps1` 的硬编码数字
