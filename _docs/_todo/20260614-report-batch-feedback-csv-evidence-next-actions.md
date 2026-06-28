# 2026-06-14 TODO - 报表批量采纳 CSV 证据

## 下一步
- 按覆盖率杠杆继续挑用户必经且覆盖偏低的现有组件。
- 候选方向：从 coverage 报告中选择 `PurchaseBoard.vue`、`BomBoard.vue` 或 `ReportBoard.vue` 中仍缺证据的用户必经路径。
- 若继续报表链路，优先检查 PDF/Excel 导出是否需要同等批量采纳追溯断言。

## 当前不做
- 不恢复 15 天灰度观察作为当前阻塞项。
- 不新增排产/报表业务范围。
- 不改写 CSV 结构或 snapshot 存储格式。
