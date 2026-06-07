# 2026-06-06 ScheduleEventQueuePanel 事件队列语义 Plan

## 成功标准

- 事件队列容器在组件单测中暴露 `role="list"`。
- 事件队列容器 `aria-label` 包含待评估事件数量。
- 每张事件卡片暴露 `role="listitem"`，并包含类型、标题、风险等级、影响订单、窗口的可访问名称。
- 真实 Chromium “三类事件触发 Agent 重排建议”场景验证事件队列语义存在，并继续完成缺料、设备、急单三类建议生成。
- 不改动排产建议生成/采纳业务逻辑。

## 执行

1. 读取 `ScheduleEventQueuePanel.vue`、组件单测和 `scheduling.spec.ts` 的三类事件路径。
2. 新增 RED 单测证明原事件队列缺少 list/listitem 语义。
3. 最小修改组件语义属性和可访问名称 helper。
4. 升级目标 e2e 断言到真实浏览器语义验证。
5. 运行目标单测、目标 Chromium e2e、lint，并记录文档。

## 结果

- 单测 RED 已复现，GREEN 已通过。
- 目标 Chromium 用例已通过。
- lint 已通过。
- B 轨道发布闸门未纳入本片完成标准。
