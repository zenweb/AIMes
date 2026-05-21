# 2026-05-20 替代料工程确认释放排产约束

## 变更

- 新增 `engineering-change-sync.ts`，统一存储 `BOM-A100 / M-AL-6061B` 替代料工程确认记录。
- `BOM 管理 > BOM 排产约束源` 新增替代料工程确认动作，点击后生成：
  - 审计编号 `AUD-ENG-ALT-20260520-001`
  - 追踪编号 `TRACE-ENG-ALT-BOM-A100-M-AL-6061B`
  - OTD 证据阶段 `工程放行`
- `AI 排产` 读取替代料确认结果，把 BOM 约束解释从“需工程确认”更新为“已工程确认，可释放缺料冻结约束”。
- 缺料事件生成 Agent 建议时，如果替代料已放行，会建议释放 `WO-RUSH-9001 / WO-DEMO-1002` 的冻结工序，同时保留首件检验和质量追溯窗口。
- `报表中心` 与 `审计日志` 继续通过统一 OTD 证据链读取工程放行证据。

## 验证

- `npx vue-tsc --noEmit -p tsconfig.json`：passed。
- `npm run test:e2e -- tests/e2e/engineering-data.spec.ts tests/e2e/scheduling.spec.ts tests/e2e/report.spec.ts tests/e2e/audit.spec.ts`：34 passed。

## 后续

- 下一步可把替代料确认从单一放行动作扩展成“工程变更影响分析”：比较库存、质量参数、供应商批次、成本和 OTD 影响。
- 可继续把人员排班冲突、资质过期阻断和替班建议升级成可执行闭环。
