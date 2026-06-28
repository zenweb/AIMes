# 2026-06-14 TODO - 排产后端反馈可审计校验

## 下一步
- 若继续排产反馈链路，优先补后端接口契约测试，确保 `/scheduling/adoption-feedback/latest` 不返回不可审计字段。
- 若按覆盖率杠杆切换，候选为 `PurchaseBoard.vue`、`BomBoard.vue` 或 `ReportBoard.vue` 的用户必经低覆盖路径。
- 保持 TDD、真实 Chromium 和五类文档为切片完成门槛。

## 当前不做
- 不恢复 15 天灰度观察作为当前阻塞项。
- 不新增排产方案类型。
- 不在本片改造后端存储模型。
