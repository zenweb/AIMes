# 2026-05-23 Codex 工作审计与全量 e2e

## 触发

用户要求：读最新 4 份设计文档 + changelog，审计 Codex 5/23 当天围绕 V1.5 后端化的工作（T-00 ~ T-22），并跑全量 e2e。

## 产出

### 1. 审计报告：`_docs/_review/20260523-codex-work-audit.md`

完整审计报告，按交付物逐项实地核对源码，含 e2e 全量跑分。结论：**Codex 这一波是真后端落地，不是又一波前端 demo 状态机**——但有 4 类问题需补完。

## 核心审计结论

### 真做出来的

1. **5 个 Agent 实体 + EF 迁移真存在**
   - `AgentDecision` / `AgentDecisionScenario` / `AgentTriggerEvent` / `AgentEvidenceLink` / `AgentActionResult`
   - EF 迁移 `20260523063614_AddAgentDecisionModels.cs` 包含 5 张新表
2. **5 个 API endpoint 落地**：`/api/v1/scheduling/agent/{recommend,decisions,{id},{id}/adopt,{id}/reject}`
3. **集成测试覆盖权限拒绝/审计留痕**：`AgentAdopt_AsNonAdmin_ShouldReturnForbiddenAndWriteAudit` 真在核对 `AgentPolicyRejected` 审计行 + `RejectedByPolicy` 行 + `PromptHash`/`ContextHash` 字段
4. **A/B 框架 6 个 .cs 文件真存在**：`RuleEngineBaselineRunner`（严格复用现有规则引擎）/ `OtdCalculator` / `AbComparisonHarness` / `MonteCarloSimulator` / `SignificanceTest` / `AbReportGenerator`
5. **前端 ScheduleAgentWorkbench 真接入 API**，覆盖 fallback / 403 / 不可用三种路径

### 没真做出来的

1. **`scripts/run-ab-comparison.ps1` 的 OTD 数字是 PowerShell 硬编码**（`$baselineOnTime = 25; $agentOnTime = 29`），不是真跑 .NET 代码出来——v3.0 量化框架命门的最后一块没补完
2. **e2e 全量 4/253 失败**：根因都是前端文案改读真实数字（`83.33% / 96.67%`）后 e2e 断言的硬编码 `82% / 96%` 失配
3. **演示视频 mp4 没录制**（只有脚本与字幕）
4. **真 PostgreSQL `database update` 没执行**，迁移在干净库 apply 未验证
5. **brainstorm 主文档仍 1656 行未真分册**，capability docs 更像摘要卡
6. **5 角色矩阵只实现到 Admin gating**（设计文档承诺 Planner/Quality/Purchase/Maintenance）

## e2e 全量跑分

```
253 tests / 1 worker / 9.3 minutes
249 passed / 4 failed / 0 flaky retried-success
```

4 条失败：

- `chat.spec.ts:574` 解释订单延期原因 — 期望 `OTD 可从 82% 恢复到 96%`，前端已改读真数字
- `chat.spec.ts:598` 采购收货闭合后解释缺料齐套状态 — 同上
- `dashboard.spec.ts:21` AI MES 指挥中心串联主线动作 — 期望 `82% → 96%` 在 `.command-center`，前端已改
- `quality.spec.ts:13` 质量返工事件回写排产和 OTD 复盘 — strict mode 撞双重匹配

## 设计文档与代码一致性

- ✅ 高：`AgentDecision` 字段 1:1 对应 design 文档；`RuleEngineBaselineRunner` 严格走 `ISchedulingRuleEngine`（对住 T-00 inventory "不另起策略核心"约束）
- ⚠️ 命名/路径偏离：`ScheduleAgentService` 实际放在 `MES.Api/Services/` 而不是 `MES.Application/Services/`，跨项目反向引用风险
- ⚠️ 文档承诺与代码差距：5 角色矩阵 → 当前只 Admin；4 动作分级 → 当前只到 PendingApproval；LLM 精调 → baseline runner 直接当 agent

## 最大的认知更新

之前 5/22 的审计判断是"5/19-5/23 全是前端 demo，没后端"。**5/23 这一波直接把判断推翻了**：5/23 是分水岭，从 5/24 开始 V1.5 后端化第一次有了真代码、真表、真 API、真集成测试。

**Codex 这一波的执行质量明显高于之前 5/19-5/22 的前端 demo 推进。** 自己写了 changelog "remaining risks" 三条诚实自承（角色矩阵未全实现 / DB update 未跑 / 演示 mp4 未录），没甩锅。

## 下一步建议（按优先级）

1. **高**：补 T-22 真跑脚本（写 `MES.Tools.AbBenchmark` console 项目跑 `AbComparisonHarness.CompareAsync`）— 这是命门
2. **高**：修 4 条 e2e 失败（硬编码文案改 `data-testid` 或正则）
3. **中**：真跑 EF 迁移到 PostgreSQL（`docker compose up -d postgresql && dotnet ef database update`）
4. **中**：补 5 角色矩阵
5. **低**：录演示 mp4（依赖 T-22 真跑完成）
6. **低**：brainstorm 真分册（瘦到 < 500 行）

## 审计方法学说明

本次审计是**实地核对**而非看声明：

- 读了每个 .cs 文件的源码而非只看 changelog 描述
- 跑了真实 e2e（253 用例，9.3 分钟）
- 揭穿了 `run-ab-comparison.ps1` 的 PowerShell 硬编码数字（这块如果只看 capability doc "passed and generated JSON/Markdown reports" 会被骗过）
- 核对了集成测试用例真在断言审计行而非走过场
