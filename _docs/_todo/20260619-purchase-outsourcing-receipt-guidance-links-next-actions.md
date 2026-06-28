# 20260619 Purchase Outsourcing Receipt Guidance Links Next Actions

## 已完成
- 外协到货确认前提示：简体中文 + English。
- 关联链接：风险预警、AI 排产、报表证据、帮助。
- 单测覆盖：提示文本、链接、`aria-describedby`。
- 真实浏览器证据：`purchase-outsourcing-receipt-guidance-visible-real-browser-20260619`。

## 下一步建议
- 继续按覆盖率杠杆和用户关键路径选择下一片。
- 不要继续停留在 `PurchaseBoard.vue`，除非发现真实采购写入、失败恢复、证据新鲜度或操作安全缺口。
- 当前候选仍可从 `GanttChart.vue`、`RoutingBoard.vue`、`DocumentUpload.vue`、`AdminBoard.vue` 等低覆盖/高价值路径中重新筛选。

## 非本片范围
- 未调整外协到货写入、失败恢复或防重复逻辑。
- 未改变 `/scheduling/` baseURL 行为。
- 未关闭灰度观察发布门。
