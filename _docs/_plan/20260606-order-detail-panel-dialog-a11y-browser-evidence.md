# 2026-06-06 OrderDetailPanel 工单详情抽屉语义 Plan

## 成功标准

- 工单详情抽屉在组件单测中具备 `role="dialog"`、`aria-modal` 和动态可访问名称。
- loading/empty/error 状态具备 status/alert live region 语义。
- 真实 Chromium 工单详情接口失败兜底场景验证抽屉、错误提示和关闭按钮语义存在。
- 不修改业务逻辑。

## 执行

1. 刷新 `test:unit:coverage`，按覆盖率杠杆选片。
2. 读取 `OrderDetailPanel.vue`、`ScheduleBoard.vue` 调用点和既有 scheduling e2e。
3. 新增 RED 单测证明原抽屉缺少 dialog/status/alert 语义。
4. 最小修改组件模板语义属性。
5. 补真实 Chromium 断言。
6. 更新报告、changelog、review、todo、issue、plan。

## 结果

- 单测 RED 已复现，GREEN 已通过。
- 目标 Chromium 用例已通过。
- B 轨道发布闸门未纳入本片完成标准。
