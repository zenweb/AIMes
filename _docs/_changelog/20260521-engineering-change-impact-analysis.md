# 2026-05-21 工程变更影响分析闭环

## 变更

- `BOM 管理 > BOM 排产约束源` 新增工程变更影响分析，围绕 `ECN-BOM-A100-6061B-20260521` 比较库存、质量参数、供应商批次、成本和 OTD 影响。
- 新增 `aimes_engineering_change_impact_analysis` 本地同步记录，固化：
  - 审计编号 `AUD-ENG-ECN-20260521-001`
  - 追踪编号 `TRACE-ENG-ECN-BOM-A100-6061B`
  - 影响工单 `WO-RUSH-9001 / WO-DEMO-1002 / WO-DEMO-1005`
- 工程变更影响写入统一 OTD 证据链，阶段为 `工程变更影响`。
- `AI 排产` 读取同一影响分析，把 BOM 约束解释升级为 ECN 审批前模拟，并在事件队列生成 `工程变更影响` 事件。
- 工程变更事件可生成 Agent 建议：按锁定期后第一个 CNC 空窗模拟释放受影响工单，同时保留首件材质复核、OP-040 扭矩检验和批次追溯。
- `BOM 管理` 继续新增 ECN 决策状态机：
  - `批准 ECN 放行` 写入 `AUD-ENG-ECN-20260521-APPROVE`，`AI 排产` 把审批前模拟转成“工程变更批准后的正式排产释放”。
  - `驳回 ECN` 写入 `AUD-ENG-ECN-20260521-REJECT`，`AI 排产` 撤回模拟并保持 `M-AL-6061` 原物料策略。
- 批准/驳回结论会追加 `工程变更批准` 或 `工程变更驳回` OTD 证据链记录，并进入 `审计日志` 决策回放。
- `报表中心` 与 `审计日志` 继续通过统一 OTD 证据链回放工程变更影响分析，避免工程影响只停留在 BOM 页面。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：passed。
- `npm run test:e2e -- tests/e2e/engineering-data.spec.ts`：8 passed。

## 后续

- 可继续让采购、质量、库存按 ECN 批准/驳回结论自动切换处置策略，并补充真实后端事件持久化。
