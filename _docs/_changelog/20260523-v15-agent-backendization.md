# 2026-05-23 V1.5 Agent 后端化与可重放基准

## 范围

- 新增通用 Agent 事件、决策、方案、证据、动作结果模型，排产作为首个 bounded context。
- 新增调度员 Agent API：推荐、多方案查询、采纳、拒绝，并对非 Admin 执行动作写入拒绝审计。
- 扩展 `AuditLog`、`AiDecisionTrace`、`ScheduleAdoptionFeedback`，补齐 businessKey、traceId、prompt/context hash 与 Agent 关联字段。
- 新增规则引擎基准 runner、OTD 计算、A/B 对比、Monte Carlo seed 重放、显著性检验和 Markdown 报告生成。
- 前端排产 Agent 工作台改为后端 API 优先读取最近决策，API 不可用时保留现有 demo fallback。

## 验收

- 后端构建：`dotnet build src\backend\AIMes.slnx --no-restore -p:UseSharedCompilation=false`
- 排产集成测试：`dotnet test src\tests\MES.Tests.Integration\MES.Tests.Integration.csproj --no-build --filter "FullyQualifiedName~SchedulingControllerTests"`，15/15 通过。
- 可重放基准单测：`dotnet test src\tests\MES.Tests.Unit\MES.Tests.Unit.csproj --no-build --filter "FullyQualifiedName~RuleEngineBenchmarkTests"`，4/4 通过。
- A/B smoke：`powershell -ExecutionPolicy Bypass -File scripts\run-ab-comparison.ps1` 通过，校验固定 dataset 与 seed。
- 前端构建：`npm run build` 通过。
