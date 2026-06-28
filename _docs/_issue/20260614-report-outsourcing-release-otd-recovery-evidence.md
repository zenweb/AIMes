# 2026-06-14 Issue - 外协释放后的 OTD 恢复口径缺少回归证据

## Problem
- 法兰盘 DN100 的 OTD 风险来自外协等待，不应在外协未闭环时被算作厂内恢复。
- 外协到货并完成 AI 排产释放后，报表应明确把该产品族从延期样本转为已恢复。
- 该分支此前缺少单元回归证据，后续改动容易让报表和 CSV 口径漂移。

## Resolution
- 新增 `ReportBoard` 组件测试，注入带 `scheduleReleaseTraceId` 的外协承诺包。
- 断言 OTD 复盘原因出现外协排产释放 trace。
- 断言产品族 KPI 卡改为 recovered，详情解释为外协到货 + AI 排产释放。
- 断言 CSV 导出包含外协已释放 KPI 行和审计 trace 行。

## Verification
- `npm run test:unit -- tests/unit/report-board.test.ts`：17 passed。
- `npm run test:unit:coverage`：105 files / 757 tests passed。
