# V1.5 `/goal` Continuation Ledger

> 生成时间：2026-05-23  
> 目的：恢复旧 `/goal` 未竟事业状态，按任务逐项标明证据、缺口和下一步。  
> 口径：本文件是恢复审计台账，不等同于完成声明。

## 0. 恢复来源

| 来源 | 结果 |
|---|---|
| `.omx/` runtime 状态 | `C:\AIWorks\AIMes\v1` 仓库内不存在 `.omx`；上一层 `C:\AIWorks\AIMes\.omx` 存在，但没有 `.omx/plans`，因此不能按 `/goal` plan artifact 严格恢复任务状态。可用证据仅限 `state/session.json`、`metrics.json`、`logs/turns-2026-05-20.jsonl`、hook 日志。 |
| `.omx` turns 摘要 | `turns-2026-05-20.jsonl` 显示 2026-05-20 曾推进实时监控、AI 助手、条码、系统管理 Agent 治理、调度员 Agent 工作台、AI 排产解释入口等前端 demo 切片；但这些是 turn 输出摘要，不是验收通过的 durable task ledger。 |
| 主计划 | `_docs/_plan/20260523-CC-v15-ai-deepening-audit.md`，含 T-00、T-01 到 T-28。 |
| V1.5 baseline | `_docs/_plan/20260519-function-deepening-brainstorm.md`。 |
| 设计证据 | `_docs/_design/20260524-v15-*.md`、`_docs/_design/20260524-demo-otd-30-data-dictionary.md`。 |
| 实现证据 | 当前 git 工作区 diff、新增后端 Agent 模型/API/测试、前端 API client、A/B evaluation 类。 |
| 验证证据 | 本轮记录中已跑过后端 build、排产集成测试、基准单测、A/B smoke、前端 build；但未跑全量 e2e、未对真实 PostgreSQL 执行 migration update。 |

### `.omx` 可恢复边界

- 已确认：当前仓库是 `C:\AIWorks\AIMes\v1`，git root 在 `v1`；顶层 `C:\AIWorks\AIMes` 不是 git 仓库。
- 已确认：顶层 `.omx/state/session.json` 的 `cwd` 是 `C:\AIWorks\AIMes`，`started_at` 为 `2026-05-23T01:02:59.706Z`。
- 已确认：顶层 `.omx/metrics.json` 只有 turn 计数和最后活动时间；没有可直接续跑的 T-xx 状态。
- 已确认：顶层 `.omx/logs/turns-2026-05-20.jsonl` 保存了若干旧 turn 的中文完成摘要，可作为“曾推进过哪些前端 demo 切片”的旁证。
- 缺口：没有 `.omx/plans/prd-*.md`、`.omx/plans/test-spec-*.md`、`.omx/notepad.md` 或 repo-local `.omx`；不能证明旧 `/goal` 的完整 checklist、暂停点、worker 分工和验收状态。

## 1. 当前总体判断

| 维度 | 状态 | 说明 |
|---|---|---|
| Sprint 1 文档锁口径 | 基本完成 | T-00/T-05/T-05A/T-13A/T-16 文档和 seed 已存在。 |
| Block 1 后端 Agent 决策落地 | 部分完成 | 通用实体、仓储、API、权限拒绝审计、trace/feedback 写回、事件轮询 handler 和目标集成测试已存在；完整角色矩阵和真实 PostgreSQL update 仍缺。 |
| Block 2 真实量化框架 | 部分完成 | 有可重放基础类、单测、确定性 `AbReport.json/md`；尚未把真实 30 单 SQL 导入 PostgreSQL 后跑完整 A/B。 |
| Block 3 测试稳定性与文档治理 | 部分完成 | production e2e 5 连通过，scheduling e2e 24/24 通过，capability 分册和录制脚本已补；mp4 未录制，全量 e2e 未跑。 |
| 前端后端化 | 部分完成 | `ScheduleAgentWorkbenchPanel.vue` 接后端最近决策；报表和首页读取 `latest-ab-report.json`；大量 `aimes_*` 仍是 demo localStorage。 |

## 2. 逐项任务状态

状态定义：

- `Done`：有实现/文档和至少目标级验证。
- `Partial`：有部分实现或文档，但未满足完整验收。
- `DocOnly`：只有设计/计划文档，没有落地代码。
- `Open`：未发现有效落地证据。
- `NeedsReview`：有实现，但存在迁移/架构/测试风险，不能直接宣称完成。

| 任务 | 状态 | 证据 | 缺口 / 风险 | 下一步 |
|---|---|---|---|---|
| T-00 Backend AI Surface Inventory | Done | `_docs/_design/20260524-v15-backend-ai-surface-inventory.md`；明确复用 `SchedulingAgent`、`SchedulingRuleEngine`、`SchedulingEndpoints.cs`、`SchedulingAppService`、`ScheduleAdoptionFeedback`、`AiDecisionTraceEntity`。 | `.omx` 没有 T-00 独立验收记录，只能按文档和代码判断。 | 保留为 T-05/T-17 的约束源。 |
| T-01 `ai-mes-roadmap.md` 标 V3 | Done | `_docs/ai-mes-roadmap.md` 已修改；`20260523-session-digest.md` 记录 V3 远期研究口径。 | 未逐字复核全文是否还有“当前主线”误导。 | 后续文档整理时 grep V3/V1.5 冲突。 |
| T-02 brainstorm 标 V1.5 主线 | Done | `_docs/_plan/20260519-function-deepening-brainstorm.md` 已修改；session digest 记录。 | brainstorm 很大，后续仍需分册。 | T-26 处理。 |
| T-03 changelog 索引 | Done | `_docs/_changelog/README.md` 存在并按 P0/P1/P2/P3/POC 分类。 | 索引可能未覆盖新增所有 20260523 后端化条目，已补一条但需最终校验。 | 每轮新增 changelog 后同步索引。 |
| T-04 session digest | Done | `_docs/_changelog/20260523-session-digest.md`。 | 只覆盖当时文档设计阶段，不覆盖后续代码实现；已另有后端化 changelog。 | 可在最终 release digest 合并。 |
| T-05 后端 Agent 模型设计 | Done | `_docs/_design/20260524-v15-backend-agent-models.md`；模型从排产专用改为 `AgentTriggerEvent`、`AgentDecision`、`AgentDecisionScenario`、`AgentEvidenceLink`、`AgentActionResult`。 | 文档说商业版 Agent 继续走 `SchedulingAgent`，当前开源实现实际用规则引擎 fallback。 | 文档补一段“开源构建 fallback / 商业构建 hybrid”。 |
| T-05A localStorage 迁移矩阵 | Done | `_docs/_design/20260524-v15-localstorage-to-backend-map.md`；列出首批 OTD 主线和大量 `aimes_*` 批次迁移。 | 只是矩阵，未实现所有 key 迁移。 | 按 batch 逐个迁移，不再组件散接。 |
| T-13A Agent Permission Policy | Partial | `_docs/_design/20260524-v15-agent-permission-policy.md`；后端 `AgentPolicyRejected` 审计；排产 Agent adopt/reject 已按 Admin/Planner 允许、Operator/Quality 等非授权角色拒绝；集成测试覆盖 Planner adopt 成功、Operator adopt 403、Quality reject 403。 | 矩阵仍散落在 endpoint helper，尚未抽成统一 policy handler；Quality/Purchase/Maintenance 的 execute 类 API 尚未落地。 | 设计统一授权策略/Policy handler，补跨域 execute API 的矩阵测试。 |
| T-06 `AgentDecision` 实体 + EF 迁移 | Partial | `AgentDecision.cs`、DbSet、配置；迁移已拆为 `20260523063550_AddAdminAuthAndConcurrencyBaseline` 与 `20260523063614_AddAgentDecisionModels`，Agent 五表进入后者。 | 真实 PostgreSQL `database update` 未执行；baseline 迁移仍承接历史认证/并发/反馈/审计补差。 | 在测试 PostgreSQL 跑 `database update` 并记录结果。 |
| T-07 `AgentDecisionScenario` 实体 + EF 迁移 | Partial | `AgentDecisionScenario.cs`、配置和 `20260523063614_AddAgentDecisionModels` 创建 `agent_decision_scenarios` FK。 | 同 T-06，未做真实 DB update。 | 与 T-06 一起做 PostgreSQL update 验证。 |
| T-08 Agent repository + EF 实现 | Partial | `IAgentDecisionRepository.cs`、`AgentDecisionRepository.cs`；方法覆盖 AddDecision/RecordAdoption/RecordRejection/GetById/QueryRecent，并增加 trigger/evidence/action。 | 命名不是计划里的 `IScheduleAgentRepository`，但更通用；缺并发/事务边界测试。 | 补 repository 单测或集成测试，确认多表写入事务语义。 |
| T-09 ScheduleAgentService 应用服务 | Partial | `IScheduleAgentService.cs` 在 Application；实现 `ScheduleAgentService.cs` 在 Api 层以避免 Application 依赖 `MES.AI`；生成 4 个规则引擎方案并持久化。 | 与计划“Application 层服务”不完全一致；当前没有直接调用商业 `SchedulingAgent` LLM hybrid，只用规则引擎 baseline。 | 决定是否引入 orchestration 项目，或保留 Api 适配；商业版接 `SchedulingAgent`。 |
| T-10 ScheduleAgent API 端点 | Done | recommend/list/get/adopt/reject 端点存在；`SchedulingControllerTests` 覆盖 recommend、adopt、reject、非 Admin 拒绝和新 client 查询。 | 端点仍在 `SchedulingEndpoints.cs`，未拆独立文件。 | 可后续按代码组织拆分，不影响验收。 |
| T-11 `ScheduleAdoptionFeedback` Agent 字段 | Done | Agent adopt 成功后写 `ScheduleAdoptionFeedback`，集成测试断言 `InitiatedByAgent`、`AgentDecisionId`、`AiTraceId`、`AgentVersion`。 | 真实 PostgreSQL 未验证。 | DB update 后补持久查询验证。 |
| T-12 `AiDecisionTrace` 业务键 | Done | Agent recommend 写 `AiDecisionTraceEntity`，包含 business key、linked decision、prompt/context hash；集成测试断言。 | 商业 `AiTraceFactory` 未联动，但开源路径已闭环。 | 商业版接入时复用字段。 |
| T-13 `AuditLog.InitiatedBy` 扩展 | Partial | `AuditLog.cs` 增加 `InitiatedBy`、`BusinessKey`、`TraceId`、`PromptHash`、`ContextHash`；`AuditEndpointFilter.cs` 和 DTO/service 扩展；前端审计相关文件已有修改。 | `InitiatedBy` 是 string，不是枚举；前端“触发主体”列需人工确认；旧记录默认值和 migration 风险需核查。 | 补审计页面截图/e2e 或组件测试；决定 string vs enum。 |
| T-14 后端 Agent 触发事件订阅器 | Partial | `SchedulerAgentEventHandler.cs` 配置 `Agent:EnableSchedulingEventHandler=true` 后轮询新工单、急单、低安全库存物料和设备故障，复用 `IScheduleAgentService.RecommendAsync`；`SchedulingControllerTests` 已覆盖四类 trigger 并断言 Agent decision 持久化。 | 默认关闭；仍是本地轮询器，不是真实消息总线订阅。 | 后续如接入事件总线，再把轮询器变成 adapter；本轮不再把新工单/急单列为未测缺口。 |
| T-15 前端 ScheduleAgent 接真实 API | Partial | `src/frontend/src/api/scheduling.ts` 增加 Agent API client；`ScheduleAgentWorkbenchPanel.vue` `getAgentDecisions(5)` API 优先，catch 后 fallback demo；工作台已提供 `recommend/adopt/reject` 操作入口，成功时走后端，失败时保留 demo fallback 并显示原因；`scheduling.spec.ts` 已覆盖 API mock 成功 recommend+adopt、403 权限提示、API 不可用 fallback。 | 真实浏览器 + 真实后端联调未跑；当前 e2e 是前端 mock 级验证。 | 有联调环境后再跑真实后端会话的 recommend/adopt/reject。 |
| T-16 30 单数据集 schema + seed | Partial | SQL seed、数据字典和脚本固定 dataset/seed；`run-ab-comparison.ps1` 严格解析 30 条 `work_orders` 插入行并生成报告。 | 仍未把 SQL 导入真实 PostgreSQL 后断言 30 行。 | 用测试 DB 导入 seed，写 DB 断言。 |
| T-17 RuleEngine baseline runners | Partial | `RuleEngineBaselineRunner.cs` 封装 FCFS/EDD/WeightedComposite/LeastLoaded，复用 `ISchedulingRuleEngine`；单测覆盖 4 baseline。 | 文件路径为 `Scheduling/Evaluation`，非计划 `Scheduling/BaselineRunners`；LeastLoaded 与 EDD priority + LeastLoaded capacity 语义需确认。 | 评估命名/目录是否调整；补真实 30 单 benchmark。 |
| T-18 OtdCalculator | Done | `OtdCalculator.cs` 输出 OTD rate/on-time/late/avg delay；`RuleEngineBenchmarkTests.OtdCalculator_ShouldHandleBoundaryCases` 覆盖空 assignment、缺 deadline、准时和延期。 | DTO 名称与计划 `LatePeriodHours/AverageLateness` 不完全一致，但语义已覆盖。 | 后续只在报表字段命名统一时调整。 |
| T-19 AbComparisonHarness | Partial | `AbComparisonHarness.cs` 接受同一 `ScheduleRequest`、context、agentResult；单测校验 dataset/seed/baselines。 | 计划期望 baseline/agent 策略接口与 improvement percent；当前 agentResult 外部传入，未统一策略接口。 | 设计 `IAgentScheduleRunner` 或明确 agentResult 来源。 |
| T-20 MonteCarloSimulator | Partial | `MonteCarloSimulator.cs` 用 seed 扰动交期/数量；同 seed 重放单测通过；`Summarize(...)` 已输出 sample count、mean、stddev、95% CI，单测覆盖置信区间。 | 未扰动设备故障概率、加工时长；仍不是完整生产 Monte Carlo runner。 | 扩展模拟维度，并接真实 30 单 DB runner。 |
| T-21 SignificanceTest | Partial | `SignificanceTest.cs` 实现 two-proportion z-test；单测覆盖显著和不显著两种结论文本。 | 计划要求 paired t 或 Wilcoxon；当前不是配对检验。 | 根据 Monte Carlo 成对样本输出改 paired test 或补 Wilcoxon。 |
| T-22 AbReportGenerator + 一键脚本 | Partial | `scripts/run-ab-comparison.ps1` 现在生成 `src/frontend/public/reports/latest-ab-report.json` 和 `_docs/_reports/20260524-demo-otd-30-ab-report.md`，并跑相关单测。 | 没有 `.sh`；Monte Carlo/显著性仍是 deterministic smoke 口径，不是完整真实 runner。 | 后续做跨平台 CLI runner。 |
| T-23 报表中心前端接真实数字 | Done | `ReportBoard.vue` 和 `DashboardBoard.vue` 优先读取 `/reports/latest-ab-report.json`，API/文件不可用时 fallback demo；`npm run build` 通过。 | OTD KPI 明细钻取仍有历史 demo 数字。 | 分批把 drilldown 接 report 明细。 |
| T-24 修 `production.spec.ts` e2e 超时 | Done | `npm run test:e2e -- production.spec.ts` 在隔离端口 4301-4305 连续 5 轮通过，每轮 21/21；脚本使用独立 `.nuxt-e2e-*` / `.output-e2e-*`。 | 仍有既有 chunk size、SignalR Rollup 注释和 Node deprecation warning。 | 后续可单独处理构建噪声，不阻塞此项。 |
| T-25 修 Windows `.nuxt` EPERM | Done | production e2e 5 连使用独立 build/output 目录，未复现 Windows `.nuxt` EPERM；并发误跑时暴露的是端口竞态，不是 `.nuxt` EPERM。 | `src/frontend/scripts/clean-nuxt.ps1` 不存在；当前靠隔离目录而不是清理脚本规避。 | 如要支持并发 e2e，可把端口分配也纳入脚本锁或外部传参规范。 |
| T-26 brainstorm 分册 capability docs | Done | 新增 `_docs/_capability/v15-*.md` 五个分册，覆盖调度 Agent、A/B benchmark、localStorage 迁移、安全审计、前端 fallback。 | brainstorm 主文档尚未瘦身为纯索引。 | 后续可继续减重主文档。 |
| T-27 演示视频录制 | Partial | 新增 `_docs/_marketing/demo-5min-v15-script.md` 和 `.srt` 字幕草案。 | 未录制 `demo-5min-v15.mp4`。 | 选择浏览器窗口和录屏工具后录制。 |
| T-28 README + Hero V1.5 完成度 | Done | README 写入 V1.5 当前真实 A/B 数字；Dashboard Hero 读取 `latest-ab-report.json`，fallback 改为 `83.3% -> 96.7% / +13.3pt`。 | README 只更新 v1 根；顶层无 README。 | 需要对外发布时同步官网/营销页。 |

## 3. 本轮已验证过的内容

这些验证来自当前会话的实际命令输出，说明“目标切片可构建/可跑”，不代表全量 `/goal` 完成。

| 验证 | 结果 |
|---|---|
| `dotnet build src\backend\AIMes.slnx --no-restore -p:UseSharedCompilation=false` | 通过，0 warning，0 error。 |
| `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-build --filter "FullyQualifiedName~SchedulingControllerTests"` | 历史记录 15/15 通过。 |
| `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-build --filter "FullyQualifiedName~RuleEngineBenchmarkTests"` | 4/4 通过。 |
| `powershell -ExecutionPolicy Bypass -File scripts\run-ab-comparison.ps1` | 通过，但只是 smoke，不是真实 A/B 全链路。 |
| `npm run build` in `src/frontend` | 最新通过，有 chunk size warning、SignalR Rollup 注释 warning 和 Node deprecation warning。 |
| `dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests"` | 最新 23/23 通过，覆盖 Agent recommend/adopt/reject、Planner 采纳、policy audit、trace、feedback、新 client 查询、四类事件 handler。 |
| `dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --filter "FullyQualifiedName~RuleEngineBenchmarkTests"` | 最新 7/7 通过，覆盖 4 个 baseline runner、同 seed 重放、同一 request A/B、OTD 边界、Monte Carlo CI、显著/不显著结论。 |
| `powershell -ExecutionPolicy Bypass -File scripts\run-ab-comparison.ps1` | 最新通过，严格断言 30 条 seed 行并生成 JSON/Markdown 报告。 |
| `npm run test:e2e -- scheduling.spec.ts` | 最新 24/24 通过，覆盖调度页、工作台、API mock 成功 recommend+adopt、403 fallback、API 不可用 fallback、三类事件、反馈回写和新增后端建议/采纳/拒绝入口。 |
| `npm run test:e2e -- production.spec.ts` | 最新隔离端口 4301-4305 连续 5 轮通过，每轮 21/21；使用 `.nuxt-e2e-*` / `.output-e2e-*` 隔离目录，未复现 Windows `.nuxt` EPERM。 |
| `dotnet ef migrations script --project src\backend\MES.Infrastructure\MES.Infrastructure.csproj --startup-project src\backend\MES.Api\MES.Api.csproj --context MesDbContext --idempotent --output obj\v15-agent-migrations.sql` | 设置设计时 `ConnectionStrings__DefaultConnection` 后通过；EF 设计时管线能生成幂等迁移 SQL。由于本机无 Docker/psql，未执行真实 PostgreSQL `database update`。 |

## 4. 重要风险

1. **迁移已拆分，但真实数据库未更新**  
   原 `20260523051950_AddAgentDecisionModels.cs` 已被移除并拆为 `20260523063550_AddAdminAuthAndConcurrencyBaseline` 与 `20260523063614_AddAgentDecisionModels`；但仍未在真实 PostgreSQL 上执行 `database update`，不能宣称生产迁移已验收。

2. **开源 fallback 与商业 Agent hybrid 未统一**  
   当前 `ScheduleAgentService` 在 Api 层直接用规则引擎生成 4 个方案，符合开源可编译路径；但计划里的商业 `SchedulingAgent` LLM 精调路径尚未端到端验证。

3. **前端主口径已接报告，但仍不是全真实 A/B**  
   `ReportBoard.vue`、`DashboardBoard.vue` 已优先读取 `latest-ab-report.json`，运行时代码旧 `82% -> 96%` 主口径已改为 `83.33% -> 96.67% / +13.34pt`；但该报告仍是 deterministic seeded smoke，不是导入真实 PostgreSQL 后的全链路 Monte Carlo runner。

4. **localStorage 后端化只是第一刀**  
   矩阵覆盖很多 `aimes_*`，但代码只把调度员 Agent 工作台接了最近决策读取。OTD 证据链、缺料、设备、质量、客户承诺等仍大多是前端同步层。

5. **`.omx` 只有有限运行旁证，不能严格恢复旧 `/goal`**  
   顶层 `.omx` 存在，但没有 plan/notepad artifacts；`v1` 仓库内无 `.omx`。本 ledger 是以仓库证据为主、顶层 turns 摘要为辅重建，不能当作旧 `/goal` runtime 的原生 continuation state。

## 5. 建议继续顺序

1. **先做真实 PostgreSQL 验收**：对拆分后的迁移跑 `database update`，再导入 `DEMO-OTD-30-202605` SQL seed 并断言 30 单字段完整。
2. **补 T-13A 统一 policy handler**：排产 Agent 已实现 Admin/Planner 执行、其他角色拒绝；下一步把 Admin/Planner/Quality/Purchase/Maintenance 的建议、待审批、自动闭环权限从 endpoint helper 抽成统一 policy handler，并覆盖 execute 类 API。
3. **把 T-19~T-22 做成真实 runner**：从同一 `ScheduleRequest` 跑 baseline/agent，输出 `AbReport.json/md`，包含 Monte Carlo CI 和配对显著性结论。
4. **补 T-15 真实联调 e2e**：API mock 已覆盖成功、403、不可用；下一步是在真实后端会话中跑 recommend/adopt/reject。
5. **完成 T-27 演示资产**：脚本和字幕已存在，仍需录制 `demo-5min-v15.mp4`。
