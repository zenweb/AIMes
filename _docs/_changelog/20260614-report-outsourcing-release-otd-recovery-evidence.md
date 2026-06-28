# 2026-06-14 Changelog - Report 外协释放 OTD 恢复证据

## 变更
- 按覆盖率杠杆转向 `ReportBoard`，聚焦报表中心现有 OTD 复盘口径。
- 新增外协到货并完成 AI 排产释放后，`product-flange` 从延期样本转为已恢复的组件测试。
- 验证产品族 KPI 卡、详情解释和 CSV 导出都反映外协释放后的 OTD 口径。

## 验证
- `npm run test:unit -- tests/unit/report-board.test.ts`：17 passed。
- `npm run test:unit:coverage`：105 files / 757 tests passed。
- 覆盖率：总 lines 83.96%，statements 80.40%，branches 65.17%，functions 77.25%。
- `ReportBoard.vue`：lines 78.21%，statements 78.18%，branches 69.06%，functions 79.31%。

## 说明
- 本片没有新增报表功能，只补现有外协释放 OTD 口径的回归证据。
- 15 天灰度观察按 owner 指令后置，不作为当前继续工作的阻塞项。
