# AIMes V1 设计文档审计与完善方案

> **审计日期**：2026-05-12
> **审计对象**：`v1/_docs/_design/aimes-design-doc.md`
> **附加参考**：`v1/task.md`（v4.0 愿景）、`v1/_docs/_changelog/*`、`v1/src/**`、`v1/frontend/src/**`
> **审计原则**：依据项目根 `CLAUDE.md` 12 条规则（思考先于编码、单一来源、冲突显性化、失败要响亮）。

---

## 0. 审计结论速读（TL;DR）

1. **设计文档落后于实现**：`aimes-design-doc.md` 仍停留在"方向辩论 + 推荐方向"阶段，没有反映 P0–P3 已完成的事实（5 个项目、20+ 控制器、25 个 Vue 看板、197 个测试通过、SignalR、JWT、Docker Compose、CI、EF 迁移 3 次）。
2. **存在 3 处硬性版本/技术栈冲突**（Rule 7：冲突需显性化，不可平均）：
   - `aimes-design-doc.md` L24 写 `.NET 10` ↔ `task.md` 写 `.NET 9` ↔ 项目根 `CLAUDE.md` 写 `C# 13 / .NET 9` ↔ 实际代码 `obj/Debug/net10.0/`（**实际为 net10.0**）。
   - `task.md` 的"Phase 1–4 = Q1–Q4 2025"路线图已经过期（现在是 2026-05），实际进度已远超 Phase 3 的内容。
   - `aimes-design-doc.md` "推荐方案 B+C：先单体，插件架构推迟" ↔ `task.md` 仍然描述"Plugins / Connectors / Agent Factory"插件式 Agent 框架，且实际代码已经按多 Agent 单体方式落地（不是真正的插件化）。需在 V1 文档中统一表述。
3. **V0.1 边界仍未冻结**：设计文档 Open Questions 第 1 条"开源 80% / 商业 AI 20%"的功能边界没有给出答案，但代码已经把 `SchedulingAgent`、`KnowledgeAgent`、`QualityAgent`、`MaintenanceAgent`、`AnomalyAgent`、`ProcessParameterAgent` 与规则引擎（`SchedulingRuleEngine`、`PriorityRuleEngine`、`Rescheduler`、`LockPeriodManager`）一起塞进了同一个 `MES.AI` 项目——**开源/商业的物理分界线没有建立**。
4. **关键风险未被消除**（来自原文 Cross-Model Perspective 但未落实到方案）：
   - reward function / 排程优化目标的形式化定义缺失；
   - 采集机宕机的边缘冗余策略缺失；
   - "AI 自我学习闭环"在代码中只有 `AiDecisionTrace`（写入痕迹），没有反馈/再训练通路。
5. **建议本周完成的 3 件最小行动**：①把设计文档从"方向辩论"重写为"V1 现状 + V1 收口"；②建立 `MES.AI.OSS` / `MES.AI.Pro` 的物理分包以锁定开源边界；③把"实时预测甘特图"从原型升级为"产线管理员每日 KPI 早预警"页（兑现 narrowest wedge 承诺）。

---

## 1. 现状盘点（事实层）

### 1.1 代码结构（实际）

| 项目 | 角色 | 关键内容 |
|------|------|----------|
| `MES.Domain` | 领域层 | 7 个聚合根（WorkOrder / Material / Equipment / SchedulePlan / QualityInspection / PurchaseOrder / Operation 等），9 个值对象，AiDecisionTrace，AuditLog |
| `MES.Application` | 应用层 | 13 个 AppService（Equipment / Quality / Scheduling / Knowledge / Operation / Bom / Routing / Anomaly / Inventory / Purchase / Employee / Admin / AuditLog） |
| `MES.Infrastructure` | 基础设施 | EF Core + Postgres，3 个迁移（Initial / AuditLog / AiDecisionTrace 之外另有 InventoryPurchaseEmployeeAdmin），仓储实现，DomainEventDispatcher |
| `MES.AI` | AI/调度引擎 | 6 个 Agent + Skills（Scheduling/Quality/Equipment）+ Scheduling 子模块（规则引擎 / 优先级规则 / 容量选择器 / 约束验证器 / 重排器 / 锁定周期管理） + LlmGateway + Onnx + Qdrant Vector Store |
| `MES.Api` | 接入层 | 20+ Controller、JWT、Serilog、Swagger、SignalR NotificationHub、健康检查、SPA Fallback `/scheduling` |
| `frontend/` | Vue3 + TS + Vite | 24 个 Board 组件 + dhtmlx-gantt 甘特图 + SignalR 客户端 + Playwright E2E |
| `database/` | DDL/种子 | `init.sql` + `seed.sql`（8 设备 / 12 物料 / 3 BOM / 3 工艺 / 10 工单等） |

### 1.2 测试现状

- 单元测试：**152**（Domain / Application / AI 各层），全绿。
- 集成测试：**45**（WebApplicationFactory + Controller 路径），全绿。
- E2E：Playwright 3 个套件（dashboard / scheduling / chat / modules），覆盖登录态前置。

### 1.3 已建成但设计文档未提及的能力

设计文档 L24 只列了 ".NET 10 + Vue 3 + TypeScript + PostgreSQL（已完成 P0-P3 基础）"，但下列已落地能力**完全没有在设计文档中体现**：

- 排程：规则引擎（EDD / SPT / WSPT 优先级 + 最小负载 / 最早可用容量策略）+ 约束验证 + 重排器（插单 / 故障恢复 / 锁定保护）+ LLM 精调（混合架构 v2.1.0-hybrid）。
- AI 决策可追溯：`AiDecisionTrace` 值对象 + Validator + Middleware（提示词哈希 / 上下文哈希 / 输入摘要 / 输出摘要 / 模型版本 / 业务键），这是商业版可审计性的核心资产，必须写入设计文档。
- 实时通知：SignalR + 6 类通知（设备状态 / 质量预警 / 生产进度 / 异常告警 / 库存变更 / 采购状态）+ 前端 Toast。
- 业务全栈：BOM、工艺路线、异常、库存、采购、人员、系统管理、报表、审计日志、条码打印——已是一套"完整开源 MES"的功能面，不只是排程 + 看板。
- 部署：Docker Compose（postgres / redis / rabbitmq / qdrant / api 五服务）+ GitHub Actions CI（后端 + 前端 + E2E）。
- 演示降级：所有看板内置"后端不可用 → 演示数据"分支，开源用户上手即看得到效果（这是非常重要的市场叙事，应该写入开源价值主张）。

---

## 2. 设计文档与现状的冲突清单（Rule 7：必须显性化）

| # | 设计文档原文 | 现状 | 处置建议 |
|---|--------------|------|----------|
| C-1 | L24 ".NET 10" | 实际 `obj/Debug/net10.0/`（确为 net10.0）但项目根 `CLAUDE.md` 写 ".NET 9 / C# 13"，`task.md` 也写 ".NET 9" | **以代码为准 = .NET 10**；同步修订项目根 CLAUDE.md 与 task.md 的版本声明 |
| C-2 | "插件架构推迟到商业版阶段考虑"（Recommended Approach） | 实际 `MES.AI` 单体项目，无插件加载器；`task.md` 仍按"Plugins / Connectors / Agent Factory"叙述 | **统一口径：V1 不做插件，只做模块边界**；`task.md` 标记为 v4.0 长期愿景，与 V1 设计文档解耦 |
| C-3 | "下一步：确定开源版 v0.1 的功能边界" | 已经实现 ≈ 一个完整 MES 的功能面 | **设计文档需补一节"V1 范围冻结"**，明确开源版包含 P0–P3 全部 + 规则排程 + RAG 演示桩；商业 AI（LLM 排程精调 / 视觉质检 / 预测性维护 / RAG 全功能）单独 SKU |
| C-4 | "排产引擎（待建）" | 已建：`SchedulingRuleEngine` + `Rescheduler` + LLM 混合 | 更新为"v2.1.0-hybrid 已交付，待补：reward function 形式化、多目标 Pareto 前沿、ML 学习闭环" |
| C-5 | "AI/ML 基础设施（商业版）" | `MES.AI` 已含 SemanticKernel + ONNX + Qdrant + LlmGateway 全套基础设施 | 改为"基础设施已构建在 `MES.AI`，但默认未启用商业版模型；开源构建产出可关闭 LLM/向量库后正常运行" |
| C-6 | Open Question 1：开源 80% 边界 | 未回答 | 见 §4.1 给出建议答案 |
| C-7 | Open Question 2：采集机宕机策略 | 未回答；代码无边缘冗余实现 | 见 §4.2 给出建议答案 |
| C-8 | Open Question 3：第一阶段启发式与性能目标 | 未回答；规则引擎已实现但无性能基准 | 见 §4.3 给出建议答案 |
| C-9 | Open Question 4：SaaS / 私有部署共享代码库 | 未回答；当前 docker-compose 是单租户 | 见 §4.4 给出建议答案 |
| C-10 | "外部独立评审"建议"48 小时原型做实时预测甘特图" | 甘特图已交付（dhtmlx-gantt + 瓶颈高亮 + 冲突闪烁），但**"预测"维度仍缺失**——只有"已排"和"冲突"，没有"未来 24 小时风险" | 需新增"风险/预测"层（详 §5.2） |

---

## 3. V1 设计文档应当增补的章节（结构化建议）

设计文档当前的章节是"决策草稿"模板，缺少"系统级"内容。建议补齐：

### 3.1 体系结构视图（应新增）
- **C4-Context**：产线管理员 / 操作员 / 工程师 / 管理员 ↔ AIMes ↔ ERP / PLM / 边缘采集机 / LLM Provider / Qdrant。
- **C4-Container**：MES.Api / MES.AI / Postgres / Redis / RabbitMQ / Qdrant / Frontend SPA / Edge Agent（计划）。
- **C4-Component（MES.AI）**：SchedulingAgent ↔ RuleEngine ↔ Rescheduler ↔ LockPeriodManager ↔ LlmGateway ↔ TraceFactory ↔ Validator。

### 3.2 数据模型与一致性边界（应新增）
- 聚合根列表与一致性边界图（哪些事务必须同库）。
- 关键值对象：`WorkOrderNumber` / `MaterialCode` / `EquipmentCode` / `Quantity` / `TimeWindow` / `ParameterSnapshot` / `AiDecisionTrace` —— 解释为何这些是值对象而非实体。
- 领域事件目录（`OperationEvents` / `ScheduleEvents`）与订阅者。

### 3.3 排程引擎规约（应新增 —— 这是核心差异化）
- **输入合约**：`ScheduleRequest{Orders, Equipment, Materials, Deadlines, LockedOrderIds, OptimizationObjective}` + `SchedulingContextSnapshot`。
- **优化目标形式化**（Rule 1：消除假设）：
  - `due_date`：minimize Σ max(0, EndTime − DueDate) × Weight。
  - `utilization`：maximize Σ(BusyMinutes / TotalMinutes) over bottleneck equipment。
  - `changeover`：minimize Σ Changeover(prevProduct → currProduct)。
  - `balanced`：lexicographic（先满足 due_date ≥ 95%，再优化 utilization，再优化 changeover）。
- **混合架构契约**：规则引擎是"可行解保证者"，LLM 是"局部精调者"，约束违规则强制回退（已实现，需文档化）。
- **性能 SLO**：`(50 单 × 10 设备 × 7 天窗口)` p95 ≤ 2s；`(200 单 × 30 设备)` p95 ≤ 15s；`Rescheduler 单次插单` p95 ≤ 500ms。

### 3.4 AI 决策可审计性（应新增 —— 商业版护城河）
- 已有 `AiDecisionTrace`（model/prompt/context hash + input/output summary + business keys）+ EF Entity + Middleware 验证。
- 文档应阐述 4 项不变量：
  1. 任何 Agent 输出必须写 trace；
  2. trace 必须能反查到具体业务键（工单号 / 设备号）；
  3. prompt 内容哈希化保留（不存明文，规避客户敏感数据泄露）；
  4. 模型版本变更必须导致 `ModelVersion` 字段变更，开源版强制使用 "deterministic-v1"。

### 3.5 部署矩阵（应新增）
| 维度 | 开源 / 单机 | 开源 / 集群 | 商业 / SaaS | 商业 / 私有 |
|------|-------------|-------------|-------------|-------------|
| Postgres | 单实例 | 主从 | 托管 | 客户提供 |
| Redis | 可选 | Sentinel | 托管 | 可选 |
| RabbitMQ | 可选 | 集群 | 托管 | 可选 |
| Qdrant | 关闭 | 单节点 | 托管 | 单节点 |
| LLM | 关闭 | 关闭 | Azure OpenAI / 自建 | 客户接入 / Ollama |
| Onnx 视觉 | 关闭 | 关闭 | GPU 节点池 | GPU 节点 |

### 3.6 安全模型（缺）
- JWT 已实现，角色：Operator / Lead / Engineer / Admin。
- 缺失：刷新 Token 流程、密钥轮转策略、租户隔离、审计日志归档周期、API 速率限制。

### 3.7 非功能指标（缺）
- 可用性目标、备份与恢复 RPO/RTO、可观测性（OpenTelemetry 已声明但未填充 instrumentation）、容量规划基线。

---

## 4. 开放问题的建议答案（Rule 1：先消除歧义，再前进）

### 4.1 OQ1 —— 开源 80% / 商业 AI 20% 的功能边界

**建议答案（V1 冻结）**：

| 模块 | 开源版 | 商业版增量 |
|------|--------|------------|
| 排程 | 规则引擎（EDD/SPT/WSPT + 最小负载 + 约束验证） + 重排器（插单 / 故障 / 锁定） | LLM 局部精调（v2.1.0-hybrid）+ 历史数据再训练 + 多目标 Pareto |
| 知识库 | 文档上传 + 关键字检索 + 演示问答 | RAG（Qdrant + Embedding + 多源） + 对话记忆 + 引用溯源 |
| 质量 | SPC 图 + 规则告警 + 人工根因模板 | AI 视觉缺陷检测（ONNX） + 根因 LLM 推断 + SPC 模式 LLM 识别 |
| 设备 | 状态 / 维护 / 健康分（规则） | 时序异常检测 + 故障预测 + 维护建议 LLM |
| 异常 | 人工上报 + 分级 + 响应流 | LLM 辅助诊断 + 相似案例向量检索 |
| 报表 | 静态聚合（SVG 自绘） | 自然语言 → SQL + 自动洞察 |
| 决策可追溯 | 写 trace，校验中间件已启用 | trace 反查面板 + 模型版本回滚 |

**物理分包建议**：把 `MES.AI` 拆为 `MES.AI.Core`（规则引擎 / 重排 / 约束 / Trace）+ `MES.AI.Pro`（LLM / Onnx / Qdrant / Agent），开源构建排除 `MES.AI.Pro` 引用。

### 4.2 OQ2 —— 采集机宕机应对

**建议答案**：三层容错。

1. **边缘缓冲**：在 Edge Agent（待建，V1 给规范不实现）本地 SQLite 缓冲 ≥ 72 小时遥测，断网期间不丢数据，恢复后批量上行；
2. **服务端冗余**：API 接收端做幂等键（`equipmentId + timestamp` 唯一约束），即使重复上行也不脏数据；
3. **降级路径**：采集机宕机时由"调度引擎"自动把对应设备标记为 `Status=Unknown` 并触发 Rescheduler 故障恢复流程（代码已实现 `Rescheduler.ReschedulingMode.FaultRecovery`），避免甘特图卡死。

### 4.3 OQ3 —— 第一阶段启发式与性能目标

**建议答案**：

- 算法栈：**EDD 排序 + 最小负载 + 瓶颈优先 + Setup Time-aware**（已实现）；下一步加 **CP-SAT / OR-Tools** 作为可选求解器（开源），LLM 作精调（商业）。
- 性能 SLO 已在 §3.3 给出。
- 验证手段：`MES.Tests.Unit/AI/SchedulingAppServiceTests` 加性能基准用例（BenchmarkDotNet），在 CI 上跑回归。

### 4.4 OQ4 —— SaaS / 私有部署共享代码

**建议答案**：

- **单代码库 + 多 Profile**：`appsettings.SaaS.json` / `appsettings.OnPrem.json` / `appsettings.Demo.json` 分别配置租户隔离策略、LLM 接入、向量库。
- **租户隔离**：DB 层 `tenant_id` 列 + EF Query Filter；存储层 Qdrant 用 collection-per-tenant；Redis Key 加 tenant 前缀。V1 先实现 DB 层即可（其他默认单租户）。
- **部署**：SaaS 走 Kubernetes（Helm Chart 待建），私有走 docker-compose（已建），共享 `Dockerfile`。

---

## 5. 完善建议（按优先级）

### 5.1 P0 —— 本周（Token Rule 6：单批不超过 4k 行动）

1. **重写设计文档第一节**（Problem / Status Quo / Wedge 保留；删除"Approaches Considered"中已选定的方案 A，避免歧义；把 Recommended Approach 改写为"V1 已落地基线"）。
2. **加入 §3.1 体系结构视图**（Mermaid C4 三张图）。
3. **加入 §3.3 排程引擎规约**（这是商业差异化的"门面"）。
4. **冻结开源 / 商业边界**（§4.1 表 + 物理分包决策）。
5. **修订项目根 `CLAUDE.md` 与 `task.md` 的 .NET 版本**与已落地阶段，避免 LLM 后续基于错误前提改代码。

### 5.2 P1 —— 兑现 "narrowest wedge"

设计文档承诺的 wedge 是"提前告诉产线管理员哪里要出问题"。当前甘特图只能看到**已排冲突**，需要新增"**风险预测层**"：

- 工单准时风险（基于规则引擎已得的 `EstimatedCompletion` vs `DueDate`，红 / 黄 / 绿）；
- 设备故障预警（基于维护记录间隔 + 健康分阈值，规则即可，不要求 LLM）；
- 物料齐套风险（BOM × Inventory，缺料工单标黄）；
- 这 3 条已存在的数据维度 + 1 个新页面 `RiskBoard.vue`，工作量 < 2 人天，但能让产线管理员第一次说"AIMes 让我少跑车间了"。

### 5.3 P2 —— 商业版护城河

- **AI 决策反馈闭环**：当前只写 trace，没有"产线管理员标注此次排程是否被采纳"的回路。建议加 `ScheduleAdoptionFeedback` 实体 + 一键采纳/拒绝按钮 + 反馈数据进训练池。
- **reward function 形式化**：把 §3.3 的目标函数落到代码（`IObjectiveFunction` 接口 + 4 实现），允许在 UI 切换。
- **多目标 Pareto**：返回 Top-3 方案让人选，而不是只给一个。

### 5.4 P3 —— 工程基线

- 把 `_docs/_review/` 目录补齐（项目 CLAUDE.md 约定但目录尚不存在）。
- OpenTelemetry instrumentation 填充（当前只 `AddOpenTelemetry()` 占位）。
- 性能基准入 CI（避免规则引擎被改动后无声退化）。
- Token / Rate limit / Refresh token 三项安全空白补齐。

---

## 6. 与 `task.md` (v4.0 愿景) 的关系处理

`task.md` 是"AIMes v4.0 AI 原生 + Plugin / Agent Factory + K8s"的远景。建议处理：

1. 在 `task.md` 顶部加显式横幅："**v4.0 是 12–24 个月远景，不是 V1 实施依据**"。
2. 在本设计文档顶部加引用："V1 = task.md 的 Phase 1 + 部分 Phase 2 的开源 80% 切片"。
3. v4.0 中**已落地或部分落地**的能力（Semantic Kernel / ONNX / Qdrant / 多 Agent / RAG 演示），在 V1 设计文档中以"现状"列出；**未落地**的能力（Plugin 加载器 / 多 Agent Orchestrator / GPU 节点池 / 自学习闭环）显式标注 "v2.0+"。

---

## 7. 失败模式与未消除假设（Rule 12：失败要响亮）

本审计仍未消除的假设，需要 Zen 决策：

- **A1**：是否同意把 `MES.AI` 拆分为 `Core` + `Pro`？这会动一次解决方案文件结构。
- **A2**：是否同意把 .NET 版本以 net10.0 为准并回写 CLAUDE.md / task.md？还是回退到 .NET 9 LTS？
- **A3**：开源协议尚未决定（设计文档写"MIT/GPL 待定"），这会影响 Pro 包能否私有；建议 **Apache-2.0**（避免 GPL 传染、保留专利条款）。
- **A4**：边缘 Agent 是否纳入 V1 范围？若是，至少要先给"规范 + 通信协议"，否则采集机宕机策略只能停留在文档。
- **A5**：商业版的 LLM Provider 默认是 Azure OpenAI 还是 Ollama 本地？影响成本与合规叙事。

---

## 8. 下一步行动建议

按 Rule 4（目标驱动）与 Rule 10（每步 checkpoint），建议 Zen 选择以下任一推进：

- **路径 A（保守）**：先把本审计文档作为正式 review，逐条确认 §7 的 A1–A5，再启动设计文档重写。
- **路径 B（激进）**：本周直接产出 `aimes-design-doc.v1.md`（替代当前文档），并行做 §5.1 的 5 件 P0 行动 + §5.2 的 RiskBoard 原型。
- **路径 C（最小动作）**：仅修订冲突清单 §2（C-1 / C-2 / C-3 / C-6–C-9），其他保持现状；适合"先稳住一致性再迭代"。

我推荐 **路径 B**：审计已经把决策面摆清楚，继续辩论的边际收益低于实际兑现 wedge 价值的边际收益。

---

## 附录 A：本次审计读取的关键文件清单

- `v1/_docs/_design/aimes-design-doc.md`（被审计文档）
- `v1/task.md`（v4.0 愿景）
- `v1/_docs/_changelog/20260512-*.md`（7 份 changelog）
- `v1/src/MES.Api/Program.cs`
- `v1/src/MES.AI/Agents/SchedulingAgent.cs`
- `v1/src/MES.AI/Scheduling/SchedulingRuleEngine.cs`
- `v1/src/MES.Domain/Entities/Scheduling/SchedulePlan.cs`
- 项目结构清单（5 个 src 项目 + 2 个 tests 项目 + frontend + database）
- 项目根 `CLAUDE.md`（12 条规则 + 中文与 .NET 9 约定）

## 附录 B：术语对齐（避免文档不同段落口径漂移）

| 术语 | 定义 | 出处 |
|------|------|------|
| 规则引擎 | `MES.AI.Scheduling.SchedulingRuleEngine`，确定性、不依赖 LLM | 代码实现 |
| 混合排程 | 规则引擎产初始解 + 约束验证 + LLM 精调 + 再验证 + 回退 | `SchedulingAgent.OptimizeScheduleAsync` |
| 锁定周期 | `LockPeriodManager`，默认 8 小时滚动窗口内的工单不可被重排 | Phase 2C |
| AI 决策痕迹 | `AiDecisionTrace`，记录 hash / 摘要 / 业务键 / 模型版本 | Domain ValueObject |
| 产线管理员 | "总线管理员"，narrowest wedge 的目标用户 | 设计文档 L17 |
| Wedge 价值 | "提前告诉哪里要出问题" → V1 兑现物 = RiskBoard | §5.2 建议 |
