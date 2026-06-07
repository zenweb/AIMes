# 2026-05-23 V1.5 AI 功能深化审计与计划落地

## 触发

读完 `_docs/_plan/20260519-function-deepening-brainstorm.md`（1656 行）+ 全部 60+ 份 changelog（5/19 至今），按照 brainstorm 文档"以 changelog 工作成果，核对完成的工作。梳理未完成的工作。审计结果，安排子任务"的要求，做一轮系统审计并产出可落地的子任务计划。

## 关键澄清

中途我误把 `ai-mes-roadmap.md`（5/19 下午写的 V3 远期愿景）当作"当前执行口径"，把 5/19-5/23 全面铺陈推进定性为"偏航"。用户澄清版本观：

- V1 = 已交付的完整 MES 功能面
- **V1.5 = 当前主线，AI 功能深化**（即 brainstorm 在做的事）
- V2 = 产品化（远期）
- V3 = V1+V2 充分运维 1 年后再推的远期目标

按这个版本观，5/19-5/23 是 V1.5 AI 深化的正常推进，**不是偏航**。审计结论按此重新校准。

## 产出

### 1. 审计 plan：`_docs/_plan/20260523-CC-v15-ai-deepening-audit.md`

完整 V1.5 AI 深化审计与子任务清单，含 4 个 Block + 28 个子任务 + 5 周 Sprint 编排：

- **Block 0 文档治理**（T-01~T-04）：重新定位 ai-mes-roadmap 为 V3 远期研究、brainstorm 加 V1.5 主线身份、changelog 索引、当日 session digest
- **Block 1 后端 AI 决策落地**（T-05~T-15）：模型设计文档、`ScheduleAgentDecision` 聚合根、`ScheduleScenario` 子实体、仓储、应用服务、API 端点、扩展 `AdoptionFeedbackService`/`AiDecisionTrace`/`AuditLog`、事件订阅器、前端接入真实 API
- **Block 2 真实量化框架**（T-16~T-23）：30 单种子数据、基线策略、OTD 计算器、A/B 对比、蒙特卡洛、显著性检验、报告生成器、前端接入真数字（替换 hardcode `+14%`）
- **Block 3 测试稳定性 + 文档**（T-24~T-28）：修 production.spec.ts e2e 超时、修 Windows .nuxt EPERM、brainstorm 分册、演示视频、README 更新

### 2. 战略反思 plan：`C:\Users\陈奕铭\.claude\plans\enumerated-puzzling-dragon.md`

包含 Context 段落与战略推演过程的完整版本，作为审批依据保留。落地到 _docs/_plan 时去掉了 Context 段落，保留 Executive Summary。

## 核心审计结论

**60+ changelog 实现方式特征**：几乎全部是"新建 `aimes_xxx_xxx` localStorage 同步层 → 跨页面联动 → 统一 OTD 证据链 → 报表/审计/治理三处复用 → e2e 覆盖"模式。**git log 5/19 之后无后端 sprint 提交**。

**5 类未完成**：

1. 后端 AI 决策落地（前端 demo 未进入 .NET 实体/API/持久化）
2. 真实量化框架（OTD `+14%` 是 hardcode 字符串）
3. e2e 稳定性（brainstorm 行 593 自承）
4. 文档治理（brainstorm 1656 行 + 60+ changelog 缺索引）
5. 演示资产（5 分钟视频未真实录制）

**核心建议**：进入 V1.5 加深下一阶段，把 5/19-5/23 这层"前端 demo 状态机"落地到后端，让 AI 决策、Agent 触发、量化对比真有 .NET 代码支撑。

## 下一步

按 Sprint 1（5/26-6/01）启动 Block 0 文档治理（T-01~T-04）+ Block 1 后端模型设计（T-05）+ Block 2 数据集 schema（T-16）。
