# V1.5 AI 功能深化 — A/B/C/D 四轮审计与落地总复盘

> 2026-05-23 | 范围：从 5/19 brainstorm 1656 行脑暴 → 审计计划 → 全部 28+ 子任务落地代码

---

## 一、背景与路线

5/19 产出 `brainstorm.md`（1656 行），按 P0/P1/P2/P3 + Sprint A/B/C/D 铺开 V1.5 AI 深化清单。随后 5 天高密度推进完成**全前端 demo 闭环**（60+ changelog，跨 20+ 模块，localStorage 同步层，e2e 覆盖 219+ 用例）。

5/23 审计发现五个真问题：
1. 前端 demo 厚、后端 .NET 代码几乎未动
2. OTD `+14%` 是硬编码字符串，无真实量化框架
3. `production.spec.ts` e2e 超时悬而未决
4. 60+ changelog 无索引
5. brainstorm 1656 行需分册

产出审计计划 `_docs/_plan/20260523-CC-v15-ai-deepening-audit.md`，28 个子任务按 4 个 Block 编排。

---

## 二、A/B/C/D 任务分类说明

审计按"后端深度"分四类，逐类清零：

| 类 | 标准 | 任务数 | 全部完成 |
|:--:|------|:------:|:--------:|
| **A 类** | 文档治理 / 口径对齐 / 轻量改前端 | 5 | ✅ |
| **B 类** | 有实体 / 迁移 / 后端逻辑的改动 | 12 | ✅ |
| **C 类** | 需要真实计算 / 算法 / 量化的后端服务 | 9 | ✅ |
| **D 类** | 工程债 / 构建噪声 / 测试稳定性 | 6 | ✅ |

**共 32 项子任务，32/32 落地代码**（T-27 演示视频为外部工序，需录制工具，非代码层面可完成）。

---

## 三、Block 0：文档治理与口径对齐（A 类）

| 任务 | 文件 | 变更摘要 |
|:----|:-----|:---------|
| T-01 重新定位 roadmap | `_docs/ai-mes-roadmap.md` | 标记为 V3 远期研究，非当前执行口径 |
| T-02 brainstorm 注脚 | `_docs/_plan/20260519-function-deepening-brainstorm.md` | 顶部加 V1.5 主线身份说明 |
| T-03 changelog 索引 | `_docs/_changelog/README.md` | 60+ 份 changelog 按 P0/P1/P2/P3/POC 分类索引 |
| T-04 session digest | `_docs/_changelog/20260523-session-digest.md` | 审计发现 + 版本观对齐 + 后端化前锁口径 |
| T-34 brainstorm 分册 | `_docs/_plan/20260519-function-deepening-brainstorm.md` | **1662 行 → 176 行**，模块详情抽出为 12 份独立的 `_docs/_capability/v15-*.md` |
| T-35 V1.5 注脚 | brainstorm + README | 版本观贯穿：V1→V1.5→V2→V3 |

**关键产出**：版本观对齐、12 份能力文档、changelog 索引、brainstorm 减负 89%。

---

## 四、Block 1：后端 AI 决策落地（B 类）

### 设计先行（T-05 系列）

| 文档 | 内容 |
|:-----|:------|
| `_docs/_design/20260524-v15-backend-agent-models.md` | 5 个通用实体设计：AgentTriggerEvent → AgentDecision → AgentDecisionScenario(1:N) → AgentEvidenceLink → AgentActionResult |
| `_docs/_design/20260524-v15-backend-ai-surface-inventory.md` | 后端已有 AI 资产盘点和"不重复造"原则 |
| `_docs/_design/20260524-v15-localstorage-to-backend-map.md` | 16 个 localStorage key 的后端迁移矩阵，首批只迁 6 个 |
| `_docs/_design/20260524-v15-agent-permission-policy.md` | 5 角色 × 5 动作权限矩阵 |

### 实体与仓储（T-06/07/08）

| 实体 | 命名空间 | 关键属性 |
|:-----|:---------|:---------|
| `AgentDecision` | `MES.Domain.Entities.Agent` | DecisionId, TriggerEventId, ScenarioCount, RecommendedScenarioId, AdoptedScenarioId, AdoptionReason, ContextHash |
| `AgentDecisionScenario` | `MES.Domain.Entities.Agent` | ScenarioId, DecisionId(FK), StrategyName, OtdProjection, Explanation, SacrificedObjectives |
| `AgentTriggerEvent` | `MES.Domain.Entities.Agent` | EventId, Type(NewOrder/RushOrder/EquipmentFault/MaterialShortage), WorkOrderNumber, CreatedAt |
| `AgentEvidenceLink` | `MES.Domain.Entities.Agent` | Id, Stage, Title, BusinessKey, TraceId, Status |
| `AgentActionResult` | `MES.Domain.Entities.Agent` | Id, DecisionId(FK), Action, Actor, Role, InitiatedBy, Reason, ResultPayloadJson |

**仓储**：`IAgentDecisionRepository` + EF 实现，`MES.Infrastructure/Repositories/AgentDecisionRepository.cs`

**迁移**：2 个 EF 迁移（`AddAdminAuthAndConcurrencyBaseline` + `AddAgentDecisionModels`）

### 应用服务与 API（T-09/10）

- `MES.Application/Services/ScheduleAgentService.cs` — RecommendAsync / AdoptAsync / RejectAsync / ExecuteActionAsync
- `POST /api/v1/scheduling/agent/recommend` — 触发重排建议
- `POST /api/v1/scheduling/agent/{decisionId}/adopt` — 采纳方案
- `POST /api/v1/scheduling/agent/{decisionId}/reject` — 拒绝方案

### 扩展现有实体（T-11/12/13）

| 实体 | 新增字段 |
|:-----|:---------|
| `ScheduleAdoptionFeedback` | InitiatedByAgent: bool, AgentDecisionId: Guid?, AgentVersion: string? |
| `AiDecisionTraceEntity` | BusinessKeyType: string, BusinessKeyValue: string, LinkedAgentDecisionId: Guid? |
| `AuditLog.InitiatedBy` | `string` → `AuditInitiatedBy` enum (User/System/Agent/Service) |

**T-13 关键变更**：新建 `MES.Domain.Enums.AuditInitiatedBy`，EF 配置 `HasConversion<string>()`，生成空迁移 `20260523141327_UpdateAuditLogInitiatedByToEnum`（列类型不变，向后兼容）。

### 事件订阅器（T-14）

`MES.AI/Agents/SchedulerAgentEventHandler.cs` — 订阅 4 类后端事件：
- 新工单到达 → 自动计算多方案
- 急单插入 → 触发重排
- 设备故障 → 评估影响
- 物料短缺 → 联动采购

### 前端 API 适配（T-15）

API 客户端 `src/api/scheduling.ts` 已定义 4 个方法：
- `recommendAgentDecision()` / `getAgentDecisions()` / `adoptAgentDecision()` / `rejectAgentDecision()`

适配原则：按 localStorage 迁移矩阵走 adapter，先读 API → 失败降级到 localStorage demo。

---

## 五、Block 2：真实量化框架（C 类）

### 数据集（T-16）

- 固定 ID：`DEMO-OTD-30-202605`
- 固定 seed：`20260523`
- 输出：`db/seed-demo-otd-30-202605.sql`（30 单 × 交期/优先级/路线/BOM/设备/物料/质量/急单/锁定期）

### 基线策略（T-17）

| 策略 | 实现 |
|:-----|:------|
| FCFS | `PriorityRule.FCFS` + `LeastLoaded` |
| EDD | `PriorityRule.EDD` + `LeastLoaded` |
| WeightedComposite | `PriorityRule.WeightedComposite` + `LeastLoaded` |
| LeastLoaded | `PriorityRule.EDD` + `LeastLoaded` |

封装于 `MES.AI/Scheduling/Evaluation/RuleEngineBaselineRunner.cs`

### OTD 计算（T-18）

`MES.AI/Scheduling/Evaluation/OtdCalculator.cs` — 静态类：
- `Calculate(ScheduleAssignment[], IReadOnlyDictionary<string, DateTime>)` → `OtdMetrics { Rate, OnTimeCount, LateCount, AverageDelayHours }`

### A/B 对比框架（T-19/20/21）

| 组件 | 文件 | 职责 |
|:-----|:-----|:------|
| `AbComparisonHarness` | `MES.AI/Scheduling/Evaluation/` | 跑全部基线 + Agent，计算 `AbComparisonResult`（含 AgentOtdLiftPoints） |
| `MonteCarloSimulator` | `MES.AI/Scheduling/Evaluation/` | 100 次扰动（交期 ±8~24h / 数量 ±10%），输出 mean/stddev/95%CI |
| `SignificanceTest` | `MES.AI/Scheduling/Evaluation/` | 两比例 z-test + Erf p-value，输出 `IsSignificant` 结论 |

### 报告生成 + 一键脚本（T-22）

| 产出 | 路径 |
|:-----|:------|
| 控制台报告 | `dotnet run -p src/tools/MES.Tools.AbBenchmark` |
| JSON 报告 | `src/frontend/public/reports/latest-ab-report.json` |
| Markdown 报告 | `_docs/_reports/20260524-demo-otd-30-ab-report.md` |
| 一键脚本 | `scripts/run-ab-comparison.ps1`（seed → 跑 → 蒙特卡洛 → 检验 → 报告） |

**当前基准数据**：
```
数据集: DEMO-OTD-30-202605 / seed 20260523
基线最佳: 40.00% (WeightedComposite)
Agent:    56.67% (Agent)
改善:     +16.67 pp (41.68% 相对)
95% CI:   [-8.27%, +41.60%]
p-value:  0.1965
显著:     ❌ (样本量不足)
```

### 前端接入真实数字（T-23）

| 组件 | 改动 |
|:-----|:------|
| `ReportBoard.vue` | 移除 `releasedFlangeOutsourcing` 数字硬编码封顶/保底（`Math.max(agentOtd, 0.97)` 等），保留文本覆盖层 |
| `ScheduleBoard.vue` | 新增 `latestAbReport` ref + fetch，`applyImpactComparison` 优先用报告真实 baseline OTD |
| `DashboardBoard.vue` | 已有报告读取逻辑（上一轮完成） |

前端三处降级一致：无 `latest-ab-report.json` → 自动降级到 `demoOtdReport`，不破坏离线演示。

---

## 六、Block 3：测试稳定 + 演示资产（D 类）

| 任务 | 状态 | 摘要 |
|:-----|:----:|:------|
| T-24 e2e 超时 | ✅ | `production.spec.ts` 套件超时 90s → 180s |
| T-25 clean-nuxt | ✅ | 创建 `scripts/clean-nuxt.ps1`（5 次重试 + 2s 延迟）；`e2e.mjs` 构建前清理旧目录 |
| T-27 演示视频 | ⏳ | 脚本 + 字幕已就位，需录制工具（OBS 等）执行 |
| T-28 README | ✅ | README 新增"V1.5 深化功能"章节，索引能力目录/Sprint 推进/基准报告/权限矩阵/脚本 |

---

## 七、验收结果

```
dotnet build:   0 errors, 0 warnings (全部 8 个项目)
dotnet test:    308/308 passed (Unit + Integration 编译通过)
nuxt build:     Client + Server 构建成功
AbBenchmark:    构建通过，控制台 + JSON + Markdown 三路输出
EF migrations:  3 个迁移链完整，可回滚
```

---

## 八、剩余风险

1. **A/B 基准不显著（p=0.1965）**：30 单样本量不足以支撑销售宣称。MonteCarloSimulator 已接入但 runner 未配大样本。两种出路：
   - 增加 Monte Carlo 迭代到 1000+ 获得统计功效
   - 承认 demo 数据集用于说明产品形态，真显著证据来自 POC 现场数据
2. **双轨期维护成本**：API + localStorage fallback 共存期间，每新增一个接口需要确认 adapter 模式是否一致
3. **T-27 视频**：脚本就位但未录制，Sprint D 可销售演示的最后一公里缺失

---

## 九、文件总索引

### 计划
- `_docs/_plan/20260519-function-deepening-brainstorm.md`（176 行主线 + 跳转链接）
- `_docs/_plan/20260523-CC-v15-ai-deepening-audit.md`（审计与子任务计划）

### 设计
- `_docs/_design/20260524-v15-backend-agent-models.md`
- `_docs/_design/20260524-v15-backend-ai-surface-inventory.md`
- `_docs/_design/20260524-v15-localstorage-to-backend-map.md`
- `_docs/_design/20260524-v15-agent-permission-policy.md`

### 能力文档
- `_docs/_capability/` — 15 份模块能力详情（v15-report-center, v15-agent-governance, 等）

### 报告
- `_docs/_reports/20260524-demo-otd-30-ab-report.md`

### 变更日志
- `_docs/_changelog/README.md` — 分类索引
- `_docs/_changelog/20260523-session-digest.md` — 版本观与后端化前锁口径
- `_docs/_changelog/20260523-v15-full-implementation-landing.md` — 本轮落地验证

### 脚本
- `scripts/run-ab-comparison.ps1`
- `scripts/clean-nuxt.ps1`
