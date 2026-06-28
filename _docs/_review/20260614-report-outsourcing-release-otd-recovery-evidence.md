# 2026-06-14 Review - Report 外协释放 OTD 恢复证据

## Findings
- 报表中心会把外协等待和厂内恢复口径分开，避免把外部等待误算成厂内排产能力问题。
- `product-flange` 在外协未释放时保持 at-risk；当承诺包带有 `scheduleReleaseTraceId` 后，现有实现会把该产品族改为 recovered。
- 本片只补测试证据，没有改动生产代码。

## Verification
- 单文件单测：`report-board.test.ts` 17 passed。
- 完整前端 coverage：105 files / 757 tests passed。
- CSV 导出包含 `产品族 / 法兰盘 DN100` 的 `外协已释放` KPI 行和外协承诺审计行。

## Residual Risk
- 本片是组件单元证据，未重新跑真实浏览器截图。
- 若后续改动外协承诺包字段名、CSV 行结构或产品族 ID，需要同步更新本测试。
