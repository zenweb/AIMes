# 20260523-CC V1.5 AI 功能深化审计与子任务计划

> 起点：2026-05-19 brainstorm 文档（1656 行）+ 60+ 份 changelog（5/19-5/23）
> 目的：核对已完成、识别未完成、对齐版本观、产出可落地子任务清单

---

## Executive Summary

**版本观对齐**：V1（已交付 MES 功能面）→ **V1.5（当前主线，AI 功能深化）** → V2（产品化）→ V3（V1+V2 运维 1 年后远期）。`ai-mes-roadmap.md` 描述的"调度员 Agent 单点"路线，应理解为 V3 远期愿景的一种思路，不是当前执行口径。

**5/19-5/23 实际进展**：60+ 份 changelog，全前端 localStorage 同步层 + e2e 测试，跨 20+ 模块跑通"前端 demo 闭环"。这是 V1.5 AI 深化的正常推进，不是偏航。

**真问题**：

1. 所有"完成"都是前端 demo，后端 .NET 代码几乎没动过——V1.5 不能只是前端 demo，AI 能力要回到后端才算深化
2. OTD `+14%` 等关键数字全是 hardcode 字符串，没有真实量化框架——客户问"重跑还是这个数吗"无法回答
3. production.spec.ts e2e 超时悬而未决（brainstorm 行 593 自己记录的）
4. 60+ changelog 已成爆炸，缺索引和导航
5. brainstorm 文档自身已 1656 行，需要分册整理

**核心建议**：进入 V1.5 加深的下一阶段，把 5/19-5/23 这层"前端 demo 状态机"落地到后端，让 AI 决策、Agent 触发、量化对比真有 .NET 代码支撑。

---

## 2026-05-23 补充修订：后端化前先锁口径

本补充覆盖原 T-05/T-06/T-07/T-13/T-16/T-17 的执行口径，避免从零设计或重复造策略体系。

### 新增 T-00 Backend AI Surface Inventory

- 文件：`_docs/_design/20260524-v15-backend-ai-surface-inventory.md`
- 验收：T-05 设计文档不得绕开现有 `src/backend/MES.AI/Agents/SchedulingAgent.cs`、`src/backend/MES.AI/Scheduling/SchedulingRuleEngine.cs`、`src/backend/MES.Api/Endpoints/SchedulingEndpoints.cs`、`src/backend/MES.Application/Services/SchedulingAppService.cs`、`ScheduleAdoptionFeedback`、`AiDecisionTraceEntity`。
- 决策：现有 `SchedulingAgent` 是排产 Agent 的唯一执行核心；规则引擎是 baseline 和 Agent 初排的统一底座。

### T-05/T-06/T-07 模型修订

原 `ScheduleAgentDecision` / `ScheduleScenario` 调整为通用 Agent 聚合：

- `AgentTriggerEvent`：统一新工单、插单、设备故障、缺料、质量返工、外协到货、POC/知识治理等触发源。
- `AgentDecision`：统一推荐、执行包、复核包、多方案。
- `AgentDecisionScenario`：多方案候选，排产方案只是其中一种。
- `AgentEvidenceLink`：连接 OTD 证据、审计日志、业务对象。
- `AgentActionResult`：采纳、拒绝、闭环、回写结果。

设计文件：`_docs/_design/20260524-v15-backend-agent-models.md`。

### 新增 T-05A Frontend Demo State Migration Matrix

- 文件：`_docs/_design/20260524-v15-localstorage-to-backend-map.md`
- 验收：T-15 前端接 API 时必须按矩阵迁移；API 不可用时 demo fallback 仍可演示，API 可用时优先读后端真实数据。
- 第一批只迁移主线：排产建议、OTD 证据链、设备停机、缺料齐套、质量返工、客户承诺包。

### 新增 T-13A Agent Permission Policy

- 文件：`_docs/_design/20260524-v15-agent-permission-policy.md`
- 原则：AI 能建议，但不能越权执行。
- 验收：非 Admin 用户调用 adopt/execute 类 API 时能被拒绝并留审计；所有 Agent 写操作记录 actor、initiatedBy、businessKey、traceId、prompt/context hash。

### T-16 数据集修订

- 数据集 ID 固定：`DEMO-OTD-30-202605`
- 随机种子固定：`20260523`
- 输出：`db/seed-demo-otd-30-202605.sql` + `_docs/_design/20260524-demo-otd-30-data-dictionary.md`
- 验收：30 单每单包含交期、优先级、路线、BOM、设备能力、物料状态、质量风险、是否急单、是否锁定期；同一代码同一 seed 重跑 OTD 结果一致。

### T-17 策略修订

不新增平行 `BaselineSchedulingStrategy` 计算核心。T-17 改为封装现有规则引擎为 baseline runners：

- FCFS：`PriorityRule.FCFS`
- EDD：`PriorityRule.EDD`
- WeightedComposite：`PriorityRule.WeightedComposite`
- LeastLoaded：`CapacitySelectionStrategy.LeastLoaded`

Agent 方案继续走现有 `SchedulingAgent`：规则初排 + LLM 精调 + 约束验证。A/B 对比里的 baseline 和 agent 必须来自同一 `ScheduleRequest`。

---

## 一、审计：已完成的工作

### 实现方式特征

阅读 60+ 份 changelog 的实现细节后归纳：

```
新建 aimes_xxx_xxx localStorage 同步层
   ↓
A 页面写入证据/状态 → B/C/D 页面读取同一 key 跨页面联动展示
   ↓
统一 OTD 证据链（aimes_otd_evidence_chain）归档
   ↓
报表/审计/Agent 治理三处复用证据
   ↓
e2e 用例覆盖前端跨页交互
```

这是高质量的前端 demo 状态机，但不是后端 AI 能力。git log 5/19 之后没有任何后端 sprint 提交。

### 已覆盖模块（按 brainstorm P0/P1/P2/P3 清点）

#### P0 主线

| 模块 | 完成度 | 备注 |
|------|--------|------|
| 报表中心 经营复盘 | ✅ 完整 | OTD/钻取/客户承诺/外协/POC 评分签署/Hypercare |
| 实时监控 现场态势 | ✅ 完整 | 三类事件 + 处置包 + 闭环反写 + 助手解释 |
| 生产概览 指挥中心 | ✅ 完整 | 5 分钟 demo runbook + 彩排确认 |
| 调度员 Agent 工作台 | ✅ 完整 | 工作台聚合 + 任务级解释 + 多方案决策包 |

#### P1 主线触发器与执行

| 模块 | 完成度 | 备注 |
|------|--------|------|
| 风险预警 行动队列 | ✅ 完整 | 处置卡 + SLA 晨会复核 + 闭环反写 |
| 缺料齐套闭环 | ✅ 完整 | 工单齐套 + 时间窗预测 + 治理 + 助手 |
| 设备故障与瓶颈 | ✅ 完整 | 影响分析 + 排产事件回写 |
| 生产执行闭环 | ✅ 完整 | 工序约束 + 开工校验 + 完工回写 |

#### P2 业务深化

| 模块 | 完成度 | 备注 |
|------|--------|------|
| 质量事件闭环 | ✅ 完整 | 返工排产 + CAPA + MRB 处置 |
| 异常 现场事件中心 | ✅ 完整 | 三类异常分流 |
| 工程数据 约束源 | ✅ 完整 | BOM/工艺路线/ECN/替代料/能力校验 |
| AI 生产助手 可执行 | ✅ 完整 | 业务问答 + 跨模块执行包 |

#### P3 系统运营治理

| 模块 | 完成度 | 备注 |
|------|--------|------|
| 人员能力 | ✅ 完整 | 替班候选评分 + 停工复核状态机 |
| 条码现场入口 | ✅ 完整 | 工单/设备/物料扫码 + 流转卡 |
| 质量知识 R3-R7 链 | ✅ 极深 | 28+ 份 changelog 走通"再训练 灰度 监控 回滚" |
| RAG 知识治理 | ✅ 完整 | 复核闭环 + 引用链 |
| 审计决策回放 | ✅ 完整 | AI 决策 + 配置审批 + 各模块专属回放 |
| 系统管理 Agent 治理 | ✅ 完整 | 策略治理 + 配置审批闭环 |

#### Sprint A/B/C/D

- Sprint A（排产可讲数字）：4/4 ✅
- Sprint B（三类事件触发 Agent）：4/4 ✅
- Sprint C（执行闭环）：4/4 ✅
- Sprint D（可销售演示）：4/4 ✅

---

## 二、审计：未完成的工作（V1.5 标准）

V1.5 是"在 V1 基础上做 AI 功能深化"。深化的判定标准是：AI 能力必须真正进入后端，而不是只在前端模拟。按这个标准，下面 5 类工作未完成。

### 未完成 1：后端 AI 决策落地

5/19 之前 V1 后端已有的 AI 相关模块：

- `MES.AI` 项目（排程引擎、ONNX、Semantic Kernel、Qdrant）
- `AdoptionFeedbackService`（排程采纳反馈）
- `AiDecisionTrace`（AI 决策追溯）
- `AuditLog`（审计日志）

5/19-5/23 前端在 localStorage 模拟了大量"Agent 触发 / 跨模块执行包 / 多方案决策包 / 灰度发布 / 再训练"等动作。但这些都没有进入后端实体、API 和持久化层。

后果：演示能跑，重启浏览器后 localStorage 清掉就没了；数据库里没有真实记录；客户接入真实工单数据，前端 demo 状态机会全部失效。

### 未完成 2：真实量化框架

`+14%` 是前端硬编码字符串。需要真实代码：演示数据集种子、基线策略实现、A/B 对比框架、蒙特卡洛模拟、95% 置信区间显著性检验、报告生成器。前端展示已就位，缺的是后端计算。

### 未完成 3：测试稳定性悬而未决

brainstorm 行 593：production.spec.ts e2e 超时未解决。Windows `.nuxt` 构建目录清理 EPERM 偶发也未解决。

### 未完成 4：文档治理

- brainstorm 1656 行已成"巨型活文档"，需要分册：把已完成模块抽出 → 单独 capability doc，主文档保留路线
- 60+ 份 changelog 缺索引文件，回查"什么时候做了什么"困难
- `ai-mes-roadmap.md` 当前定位是"执行口径"，应改标"V3 远期愿景研究"

### 未完成 5：演示资产沉淀

- 5 分钟 demo 视频（脚本已就位，未真实录制）
- README + 主页 hero 文案没有按 V1.5 完成度更新

---

## 三、子任务清单（V1.5 加深主线）

### Block 0：文档治理与口径对齐（半天，先做）

**T-01 重新定位 ai-mes-roadmap.md 为"V3 远期研究"**

- 验收：文档头部加版本观说明：V1（已交付）→ V1.5（当前主线 = brainstorm）→ V2（产品化）→ V3（远期，本文档）。明确"本文档不是当前执行口径"
- 文件：`_docs/ai-mes-roadmap.md`
- 工作量：30 分钟 | 优先级：P0 | 依赖：无

**T-02 brainstorm 文档头部加 V1.5 主线身份说明**

- 验收：brainstorm 顶部加一段"本文档是 V1.5 AI 功能深化的实施清单。当前主线，活跃维护"
- 文件：`_docs/_plan/20260519-function-deepening-brainstorm.md`
- 工作量：30 分钟 | 优先级：P0 | 依赖：T-01

**T-03 创建 changelog 索引文件**

- 验收：`_docs/_changelog/README.md` 列出 60+ 份 changelog 按 P0/P1/P2/P3 + 模块的主题分类，每份一句话简介
- 文件：`_docs/_changelog/README.md`
- 工作量：2-3 小时 | 优先级：P0 | 依赖：无

**T-04 写 5/23 当日 session digest**

- 验收：`_docs/_changelog/20260523-session-digest.md` 总结审计发现、版本观对齐、下阶段重点
- 文件：`_docs/_changelog/20260523-session-digest.md`
- 工作量：1 小时 | 优先级：P0 | 依赖：T-01, T-02, T-03

---

### Block 1：后端 AI 决策落地（V1.5 加深的命门，3-4 周）

> 目标：把 5/19-5/23 在前端 localStorage 模拟的"Agent 决策 / 跨模块执行包 / 多方案推荐"等机制，落地到 .NET 后端实体、API 和持久化层。

**T-05 后端 Agent 决策模型设计文档**

- 验收：定义 V1.5 阶段后端要承接哪些 Agent 决策结构。覆盖：调度员 Agent 多方案决策、执行包、跨模块分流、采纳/拒绝原因、效果回写
- 文件：`_docs/_design/20260524-v15-backend-agent-models.md`
- 工作量：1 天 | 优先级：P0 | 依赖：T-04

**T-06 AgentDecision 实体 + EF 迁移（修订）**

- 验收：通用领域实体（聚合根），属性含 `DecisionId`、`TriggerEventId`、`BoundedContext`、`DecisionType`、`ScenarioCount`、`RecommendedScenarioId`、`AdoptedScenarioId`、`AdoptionReason`、`RejectionReason`、`CreatedAt`、`AgentVersion`、`PromptHash`、`ContextHash`、`InputSummary`、`OutputSummary`、`BusinessKey`。EF 迁移生成
- 文件：`src/backend/MES.Domain/Entities/Agent/AgentDecision.cs` + `src/backend/MES.Infrastructure/Data/Migrations/`
- 工作量：1 天 | 优先级：P0 | 依赖：T-05

**T-07 AgentDecisionScenario 子实体 + EF 迁移（修订）**

- 验收：存储多方案候选，含 `ScenarioId`、`StrategyName`（FCFS/EDD/WeightedComposite/LeastLoaded/AgentHybrid）、`Tasks`（JSON）、`OtdProjection`、`UtilizationProjection`、`ChangeoverProjection`、`Explanation`、`SacrificedObjectives`。与 `AgentDecision` 1:N
- 文件：`src/backend/MES.Domain/Entities/Agent/AgentDecisionScenario.cs` + 迁移
- 工作量：1 天 | 优先级：P0 | 依赖：T-06

**T-08 IScheduleAgentRepository + EF 实现**

- 验收：仓储接口与实现，提供 `AddDecisionAsync` / `RecordAdoptionAsync(decisionId, scenarioId, reason)` / `RecordRejectionAsync(decisionId, reason)` / `GetByIdAsync` / `QueryRecentAsync`
- 文件：`MES.Domain/Interfaces/IScheduleAgentRepository.cs` + `MES.Infrastructure/Repositories/ScheduleAgentRepository.cs`
- 工作量：2 天 | 优先级：P0 | 依赖：T-07
- 验证：xUnit + WebApplicationFactory 集成测试

**T-09 ScheduleAgentService 应用服务**

- 验收：`MES.Application` 层服务，方法 `RecommendAsync(triggerEvent)` → 调用现有 `MES.AI` 排程引擎多策略生成 → 写入 `AgentDecision` + N 条 `AgentDecisionScenario` → 返回 DTO
- 文件：`src/backend/MES.Application/Scheduling/ScheduleAgentService.cs`
- 工作量：2 天 | 优先级：P0 | 依赖：T-08

**T-10 ScheduleAgent API 端点（极简 API + TypedResults）**

- 验收：3 个端点：`POST /api/v1/scheduling/agent/recommend`、`POST /api/v1/scheduling/agent/{decisionId}/adopt`、`POST /api/v1/scheduling/agent/{decisionId}/reject`。返回 `TypedResults<>`，使用 `MapGroup` 共享认证过滤器
- 文件：`src/backend/MES.Api/Endpoints/Scheduling/ScheduleAgentEndpoints.cs`
- 工作量：1 天 | 优先级：P0 | 依赖：T-09
- 验证：Swagger 可见 + e2e HTTP 测试 3 端点

**T-11 扩展 AdoptionFeedbackService 加 Agent 标记字段**

- 验收：`ScheduleAdoptionFeedback` 加 `InitiatedByAgent: bool`、`AgentDecisionId: Guid?`、`AgentVersion: string?` 字段；EF 迁移；现有 API 兼容
- 文件：`MES.Domain/Entities/ScheduleAdoptionFeedback.cs` + 迁移 + 服务
- 工作量：2 天 | 优先级：P0 | 依赖：T-08

**T-12 扩展 AiDecisionTrace 加业务键**

- 验收：加 `BusinessKeyType: string`（如 `WorkOrder` / `Equipment` / `Material`）、`BusinessKeyValue: string`、`LinkedAgentDecisionId: Guid?` 字段。能反查"哪个工单的哪次推荐 → 实际采纳了哪个方案"
- 文件：`MES.Domain/Entities/AiDecisionTrace.cs` + 迁移
- 工作量：2 天 | 优先级：P0 | 依赖：T-08

**T-13 扩展 AuditLog.InitiatedBy 枚举**

- 验收：`InitiatedBy` 从二选一（User/System）扩展为 `User/System/Agent/Service`；前端审计页面新增"触发主体"列；旧记录保持 `User/System`
- 文件：`MES.Domain/Entities/AuditLog.cs` + 迁移 + 前端列定义
- 工作量：2 天 | 优先级：P0 | 依赖：无

**T-14 后端 Agent 触发事件订阅器**

- 验收：`SchedulerAgentEventHandler.cs` 订阅后端事件（暂不引入新中间件，复用 V1 现有 SignalR 后端事件 / 定时器轮询）。覆盖 4 类触发：新工单、插单、设备故障、物料短缺
- 文件：`src/backend/MES.AI/Agents/SchedulerAgentEventHandler.cs`
- 工作量：3 天 | 优先级：P1 | 依赖：T-09

**T-15 前端 ScheduleAgent 接入真实 API**

- 验收：调度员 Agent 工作台前端从 localStorage 切换到调用 T-10 的 3 个 API。保留 demo fallback（API 不可用时仍能演示）
- 文件：`src/frontend/src/components/scheduling/SchedulingBoard.vue`（或当前调度员 Agent 工作台对应路径）+ API client
- 工作量：3 天 | 优先级：P1 | 依赖：T-10

---

### Block 2：真实量化框架（V1.5 加深的销售证据，2-3 周）

**T-16 演示数据集 schema + 种子脚本**

- 验收：30 单工单数据集，包含工单号、产品、BOM 引用、工艺路线引用、交期、优先级、物料齐套状态、设备约束。覆盖 3+ 冲突场景：正常生产、急单插入、设备故障、缺料、质量返工。可作为 EF 种子数据导入
- 文件：`db/seed-demo-30orders.sql` + `MES.Infrastructure/Data/DemoDataSeeder.cs`
- 工作量：3 天 | 优先级：P1 | 依赖：无

**T-17 RuleEngine baseline runners 基线策略（修订）**

- 验收：封装现有 `SchedulingRuleEngine` 为 baseline runners：FCFS、EDD、WeightedComposite、LeastLoaded。每种 runner 复用同一 `ScheduleRequest`，输出规则引擎结果序列
- 文件：`src/backend/MES.AI/Scheduling/BaselineRunners/RuleEngineBaselineRunner.cs`
- 工作量：3 天 | 优先级：P1 | 依赖：T-16

**T-18 OtdCalculator**

- 验收：接受 `ScheduleResult` 序列和工单交期，输出 `OtdMetrics { OnTimeRate, LatePeriodHours, AverageLateness }`
- 文件：`src/backend/MES.AI/Metrics/OtdCalculator.cs`
- 工作量：2 天 | 优先级：P1 | 依赖：T-17

**T-19 AbComparisonHarness A/B 对比框架**

- 验收：接受 `(IStrategy baseline, IStrategy agent, OrderSet orders)`，跑出 `AbResult { BaselineOtd, AgentOtd, Delta, ImprovementPercent }`
- 文件：`src/backend/MES.AI/AbComparison/AbComparisonHarness.cs`
- 工作量：3 天 | 优先级：P1 | 依赖：T-17, T-18

**T-20 MonteCarloSimulator**

- 验收：对工单到达时间、设备故障概率、加工时长抖动等做随机扰动。输出 `MonteCarloResult { Mean, StdDev, Confidence95Lower, Confidence95Upper }`
- 文件：`src/backend/MES.AI/AbComparison/MonteCarloSimulator.cs`
- 工作量：3 天 | 优先级：P1 | 依赖：T-19
- 验证：固定种子下结果可复现；100 次迭代下置信区间稳定

**T-21 SignificanceTest 显著性检验**

- 验收：实现配对 t 检验或 Wilcoxon 秩和检验，输出 `SignificanceResult { PValue, IsSignificant, Conclusion }`。当 ΔOTD 不显著时返回 `IsSignificant=false` 并说明
- 文件：`src/backend/MES.AI/AbComparison/SignificanceTest.cs`
- 工作量：2 天 | 优先级：P1 | 依赖：T-20

**T-22 AbReportGenerator + 一键脚本**

- 验收：报告生成器输出 Markdown 报告（数据集说明、基线策略、Agent 策略、ΔOTD ± 置信区间、显著性结论、场景拆解）。一键脚本 `scripts/run-ab-comparison.{ps1,sh}` 串起种子 → 跑两组 → 蒙特卡洛 → 检验 → 报告
- 文件：`src/backend/MES.AI/AbComparison/AbReportGenerator.cs` + `scripts/run-ab-comparison.{ps1,sh}`
- 工作量：3 天 | 优先级：P1 | 依赖：T-21
- 验证：clean checkout 后 30 分钟内能跑完

**T-23 报表中心前端接入真实数字**

- 验收：报表中心从 hardcode 字符串 `+14%` 改为读取最新 `AbReport.json`，展示真实 ΔOTD 和置信区间。允许"上次跑结果"展示和"立即重跑"按钮
- 文件：`src/frontend/src/components/report/ReportBoard.vue`（或对应 OTD 报告组件）
- 工作量：3 天 | 优先级：P1 | 依赖：T-22
- 验证：e2e 验证报表数字与最新报告一致；旧 hardcode 路径删除

---

### Block 3：测试稳定性 + 文档治理（1 周，可与 Block 2 并行）

**T-24 修 production.spec.ts e2e 超时**

- 验收：brainstorm 行 593 的 e2e 不再超时；连续 5 次本地运行全部通过
- 文件：`src/frontend/tests/e2e/production.spec.ts` + Playwright 配置
- 工作量：1-3 天 | 优先级：P1 | 依赖：无

**T-25 修 Windows .nuxt 清理 EPERM 偶发**

- 验收：在 build/test 脚本中加重试或锁文件清理逻辑
- 文件：`src/frontend/scripts/clean-nuxt.ps1` 或 `src/frontend/nuxt.config.ts`
- 工作量：1 天 | 优先级：P2 | 依赖：无

**T-26 brainstorm 分册：抽出已完成模块为 capability docs**

- 验收：从 brainstorm 1656 行中抽出"已完成"的模块详情（如质量知识 R3-R7 链 28 份 changelog 的内容总结），各自成独立 `_docs/_capability/v15-{module}.md`。brainstorm 主文档保留章节标题 + 跳转链接
- 文件：`_docs/_capability/v15-quality-knowledge-r3r7.md` 等若干 + brainstorm 改造
- 工作量：2 天 | 优先级：P2 | 依赖：T-03
- 验证：brainstorm 主文档行数 < 500；每个 capability doc 自洽可读

**T-27 演示视频录制**

- 验收：按 brainstorm 中已写好的 5 镜头脚本录制 1080p mp4 + 字幕
- 文件：`_docs/_marketing/demo-5min-v15.mp4` + 字幕 srt
- 工作量：2 天 | 优先级：P2 | 依赖：T-23（让数字真实）

**T-28 README + Hero 区 V1.5 完成度**

- 验收：根 README + v1 README + 主页 hero 文案更新为 V1.5 当前完成度。OTD 标语写法："在 30 单 demo 数据集上，OTD 改善 X% (±Y%)，p < 0.05"
- 文件：`README.md`, `src/frontend/src/components/dashboard/DashboardBoard.vue` 或当前首页/hero 组件
- 工作量：半天 | 优先级：P2 | 依赖：T-23

---

## 四、Sprint 编排（5 周）

### Sprint 1（5/26-6/01）：口径对齐 + 后端设计

1. 完成当前未收口的设备停机切片，保持工作区干净。
2. T-01：`ai-mes-roadmap.md` 标为 V3 远期研究。
3. T-02：brainstorm 顶部标为 V1.5 当前主线。
4. T-03：changelog 索引。
5. T-04：session digest。
6. T-00：后端 AI surface inventory。
7. T-05：后端 Agent 模型设计文档。
8. T-05A：localStorage 到后端迁移矩阵。
9. T-13A：Agent 权限策略。
10. T-16：30 单数据集 schema + 数据字典启动。

### Sprint 2（6/02-6/08）：后端实体与仓储

- T-06, T-07（AgentDecision + AgentDecisionScenario 实体）
- T-08（仓储）
- T-13（AuditLog 扩展，可独立做）
- T-24（修 e2e 超时，并行）

### Sprint 3（6/09-6/15）：后端服务 + API

- T-09（应用服务）
- T-10（API 端点）
- T-11, T-12（AdoptionFeedback + AiDecisionTrace 扩展）
- T-17, T-18（基线策略 + OTD 计算器）

### Sprint 4（6/16-6/22）：A/B 框架 + 前端接入

- T-14（事件订阅器）
- T-15（前端接入真实 API）
- T-19, T-20, T-21（A/B 对比 + 蒙特卡洛 + 显著性）
- T-25（修 Windows .nuxt EPERM）

### Sprint 5（6/23-6/29）：报告 + 演示资产

- T-22（报告生成器 + 一键脚本）
- T-23（前端接入真数字）
- T-26（brainstorm 分册）
- T-27（演示视频）
- T-28（README/Hero 更新）

---

## 五、验收标准（V1.5 完成度）

1. **后端落地测试**：调度员 Agent 通过真实 API 推荐方案，数据库里能查到 `AgentDecision` + N 条 `AgentDecisionScenario`。重启浏览器后数据仍在
2. **量化重跑测试**：clean checkout 后跑 `scripts/run-ab-comparison.ps1`，30 分钟内拿到带 95% CI 的真实 OTD 报告
3. **数字真实测试**：客户问"+X% 是怎么算的"，能给出数据集、基线策略、95% CI、可重跑命令
4. **测试稳定测试**：`npm run test:e2e` 完整跑通，无人工重试
5. **文档导航测试**：新员工 1 小时内能从根 README → V1.5 brainstorm → 任一 capability doc → 任一 changelog 完整摸到底

---

## 六、风险

- **后端历史债**：5/19 之后没人动后端，可能踩到 EF 迁移、Domain 解耦的历史问题。Block 1 第一周可能耗时超预期
- **前端 demo 与后端真实数据双轨期**：T-15 前端接入真 API 时，要保证 demo fallback 仍能离线演示，否则破坏售前能力
- **量化框架被前端 demo "遮蔽"**：报表中心已展示 `+14%` 五天，习惯了。前端切换到读真实数字时，必须确认 hardcode 路径完全删除，不能两套数字共存
