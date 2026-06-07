# 20260523 Ultragoal 审计消化与系统深化

## 变更

- 创建 `.omx/ultragoal/` durable 目标账本，用于承接旧 `/goal` 中断后的 AIMes V1.5 系统深化。
- 新增 `_docs/_plan/20260523-ultragoal-ai-mes-system-deepening.md`，把审计结论、三份 baseline、capability 分册和后续工作包收束成统一计划。
- 重跑真实 A/B 脚本，当前口径为 `40.00% -> 56.67%`、`+16.67pt`、`p=0.1965`。
- 修正后端 `GetAllPlans_Performance` 的冷启动计时误伤。
- 修正 `purchase.spec.ts` 对“延期减少 5 单”的旧硬编码断言。
- 同步 README、审计复盘、demo 脚本/字幕、能力文档以及前端报表/助手/知识引用中的旧 OTD 主口径。
- 补齐 demo 截图说明中的当前 OTD 口径，避免 storyboard 仍显示过期 `46.67% -> 56.67%`。
- 统一 `ScheduleAgentService` 的 Agent action result + audit log 写入路径；采纳、拒绝、跨域执行、权限拒绝现在都会把 `AgentActionResult.AuditLogId` 指向对应审计日志。
- 加强 Agent 集成测试断言，锁定 action result 与 audit log 的关联，防止审计回放链路再次断开。
- 为 `ScheduleAdoptionFeedback` 增加最近反馈查询路径：`GET /api/v1/scheduling/adoption-feedback/latest`。
- 报表中心的排产反馈证据优先读取后端最近反馈；后端不可用时继续使用 `aimes_schedule_feedback_snapshot` 作为 demo fallback。

## 验证

- `powershell -ExecutionPolicy Bypass -File scripts/run-ab-comparison.ps1`：通过，刷新 JSON/Markdown 报告。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~PerformanceTests" -p:UseSharedCompilation=false`：通过，`8/8`。
- `npm run test:e2e -- purchase.spec.ts`：通过，`6/6`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests&FullyQualifiedName~Agent" -p:UseSharedCompilation=false`：通过，`29/29`。
- `dotnet test src/tests/MES.Tests.Integration/MES.Tests.Integration.csproj --filter "FullyQualifiedName~SchedulingControllerTests&FullyQualifiedName~AgentAdopt_AsAdmin" -p:UseSharedCompilation=false`：通过，`1/1`，覆盖后端最近反馈查询。
- `dotnet build src/backend/AIMes.slnx --no-restore -p:UseSharedCompilation=false`：通过，`0 warning / 0 error`。
- `npm run build`（`src/frontend`）：通过。
- `npm run test:e2e -- report.spec.ts`（`src/frontend`）：通过，`17/17`。
- `dotnet test src/backend/AIMes.slnx --no-build -p:UseSharedCompilation=false`：Unit `308/308` 通过，Integration `118/118` 通过；Evaluation project 无测试。
- `npm run test:e2e`：通过，`258/258`。
- `npm run lint`（`src/frontend`）：未能执行，ESLint 10 找不到 `eslint.config.(js|mjs|cjs)`；这是当前项目 lint 配置缺口，不是本轮代码编译错误。

## 风险

- 审计已知红点已清零；完整“AI MES 后端化”仍需继续推进 Agent policy/audit handler 和 localStorage 分批迁移。
- 30 单 demo 数据集仍未达到 95% 显著性，不能作为销售显著性宣称。
