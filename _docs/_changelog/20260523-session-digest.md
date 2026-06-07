# 2026-05-23 Session Digest

## 版本观

- V1：已交付 MES 功能面。
- V1.5：当前主线，AI 功能深化，以 `_docs/_plan/20260519-function-deepening-brainstorm.md` 为活跃清单。
- V2：产品化。
- V3：V1+V2 运维 1 年后的远期路线，`_docs/ai-mes-roadmap.md` 已标记为 V3 研究。

## 本轮完成

1. 补 T-00 后端 AI surface inventory：明确复用 `SchedulingAgent`、`SchedulingRuleEngine`、`SchedulingAppService`、`ScheduleAdoptionFeedback`、`AiDecisionTraceEntity` 和现有 `/api/v1/scheduling/*`。
2. 补 T-05 后端 Agent 模型设计：从排产专用模型改成 `AgentTriggerEvent`、`AgentDecision`、`AgentDecisionScenario`、`AgentEvidenceLink`、`AgentActionResult`。
3. 补 T-05A localStorage 迁移矩阵：首批只迁移排产建议、OTD 证据链、设备停机、缺料齐套、质量返工、客户承诺包，保留 demo fallback。
4. 补 T-13A 权限策略：AI 默认建议，写操作必须授权和审计，拒绝也留痕。
5. 补 T-16 数据集启动：固定 `DEMO-OTD-30-202605`、seed `20260523`，输出 SQL seed 和数据字典。
6. 补 changelog 索引：按 P0/P1/P2/P3/POC 分类导航 5/19-5/23 记录。

## 下阶段重点

- T-05 后的实体迁移不得命名为 `ScheduleAgentDecision`，使用通用 `AgentDecision`。
- T-17 baseline 不新增平行策略体系，只封装现有规则引擎为 FCFS、EDD、WeightedComposite、LeastLoaded runner。
- T-15 前端接 API 时必须按迁移矩阵走 adapter，不允许组件散接。
- 每个 Agent 写 API 的验收都要覆盖权限拒绝、审计留痕、成功写入、重启后可查询。
