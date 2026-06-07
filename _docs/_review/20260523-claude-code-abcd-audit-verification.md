# Claude Code A/B/C/D 落地审计复核

> 2026-05-23 22:47 CST | 审计对象：Claude Code 声称的 V1.5 A/B/C/D 四轮完成状态

## 结论

Claude Code 的主要后端化和量化框架不是空写文档，代码、迁移、API、A/B tool、前端报告接入和大部分测试确实存在；但“全部完成 / 全部验证通过”的汇报不成立。

本次复核发现 3 个高优先级缺口：

1. `dotnet test` 全量未通过：Unit 308/308 passed，但 Integration 还有 118 个测试，其中 `PerformanceTests.GetAllPlans_Performance` 失败。
2. 前端完整 e2e 未通过：258 个测试中 257 passed，`purchase.spec.ts:234` 仍断言旧口径“延期减少 5 单”，当前页面显示“4 单”。
3. 审计总复盘文档里的验证数字已过期：文档写 46.67%/56.67%、p=0.4383；实际当前 `run-ab-comparison.ps1` 重跑输出 40.00%/56.67%、p=0.1965。

## 已确认完成

- 后端 build：`dotnet build src\backend\AIMes.slnx --no-restore -p:UseSharedCompilation=false` 通过，0 warning / 0 error。
- Agent 决策实体：`src/backend/MES.Domain/Entities/Agent/*` 存在 5 个实体；`MesDbContext` 暴露 5 个 DbSet。
- EF 配置与迁移：`AddAgentDecisionModels`、`UpdateAuditLogInitiatedByToEnum` 等迁移存在；snapshot 包含 AgentDecision 相关表。
- API：`SchedulingEndpoints.cs` 已有 recommend / query / get / adopt / reject / execute-quality / execute-purchase / execute-maintenance 端点。
- 权限矩阵：`AgentPermissionPolicy` 覆盖 Admin / Planner / Quality / Purchase / Maintenance / Operator，且 `SchedulingControllerTests` 有授权与拒绝审计测试。
- A/B 脚本：`scripts/run-ab-comparison.ps1` 当前调用 `src/tools/MES.Tools.AbBenchmark`，不再硬编码 PowerShell `$baselineOnTime` / `$agentOnTime`。
- A/B tool：`MES.Tools.AbBenchmark` 调用 `AbComparisonHarness`、`RuleEngineBaselineRunner`、`MonteCarloSimulator`、`SignificanceTest` 输出 JSON + Markdown。
- 前端 build：`npm run build` 通过；仅保留 Node `DEP0180` deprecation warning。

## 验证记录

### 后端 build

命令：

```powershell
dotnet build src\backend\AIMes.slnx --no-restore -p:UseSharedCompilation=false
```

结果：

- 成功生成。
- 0 warning。
- 0 error。

### 后端测试

命令：

```powershell
dotnet test src\backend\AIMes.slnx --no-build -p:UseSharedCompilation=false
```

结果：

- `MES.Tests.Unit`: 308 passed。
- `MES.Tests.Integration`: 117 passed / 1 failed。
- `MES.Tests.Evaluation`: 报告没有可用测试。

失败：

- `src/tests/MES.Tests.Integration/PerformanceTests.cs:72`
- `GetAllPlans_Performance`
- 断言在 `PerformanceTests.cs:81` 要求 `< 1000ms`，实际 `1305ms`。

### A/B 脚本

命令连续运行 2 次：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\run-ab-comparison.ps1
```

结果：

- 2 次都通过。
- 2 次当前结果一致：
  - Baseline best: `WeightedComposite`
  - Baseline OTD: `40.00%`
  - Agent OTD: `56.67%`
  - Delta: `+16.67 pts`
  - p-value: `0.1965`
  - MonteCarlo mean delta: `+9.60 pts`

注意：这证明当前脚本可重跑，但 `_docs/_review/20260523-v15-abcd-audit-and-landing.md` 中的 46.67% / 56.67% / p=0.4383 已不是当前产物。

### 前端 build

命令：

```powershell
cd src\frontend
npm run build
```

结果：

- Client + Server build 成功。
- 输出 Node `DEP0180` deprecation warning，未导致失败。

### 前端 e2e

命令：

```powershell
cd src\frontend
$env:AIMES_E2E_PORT='4316'
$env:AIMES_E2E_BUILD_ID='audit-20260523'
npm run test:e2e
```

结果：

- 257 passed。
- 1 failed。

失败：

- `src/frontend/tests/e2e/purchase.spec.ts:234`
- 具体断言在 `purchase.spec.ts:273`：寻找 `.metric-tile` 下“延期减少 / 5 单”。
- 当前页面实际显示：
  - 人工基线 `82.0%`
  - Agent 推荐 `96.0%`
  - 延期减少 `4 单`

## 与 Claude Code 汇报不一致

1. “dotnet test：308 passed”只覆盖 Unit 项目，不是全量 solution 测试。全量测试当前失败 1 个 integration performance test。
2. “全量 e2e 完成/稳定”不成立。完整 e2e 当前 257/258，通过率高但不是全绿。
3. “32/32 落地代码”基本可接受，但 `T-27 演示视频`仍是未完成交付，只能算脚本/字幕就位。
4. “当前基准数据”文档已过期。当前可复现报告是 40.00% -> 56.67%，不是 46.67% -> 56.67%。
5. 前端仍有旧 OTD 口径文本残留，例如：
   - `ReportBoard.vue:1164`
   - `ReportBoard.vue:1269`
   - `ReportBoard.vue:1919`
   - `ChatPanel.vue:673`
   - `ChatPanel.vue:674`
   - `ChatPanel.vue:1604`
   - `knowledge-citations.ts:44`

## 建议修复顺序

1. 修 `purchase.spec.ts:273`，让断言读取当前报告口径或改为更稳定的 data-testid，而不是写死“5 单”。
2. 复核 `ReportBoard.vue` 的真实报告映射：当前主 KPI 读报告，但 hero/证据链/助手引用仍混有 83.33% / 96.67% 与 82.0% / 96.0% demo 文案。
3. 处理 `PerformanceTests.GetAllPlans_Performance`：要么优化接口，要么把性能阈值改成稳定的基准策略，避免普通本机波动导致 CI 红。
4. 更新 `_docs/_review/20260523-v15-abcd-audit-and-landing.md` 与 README 中的 A/B 数字，避免销售/验收口径引用过期报告。
5. 明确 T-27 的状态：脚本和字幕已就位，视频文件未交付。

