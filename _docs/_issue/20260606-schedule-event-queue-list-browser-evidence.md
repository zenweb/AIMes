# 2026-06-06 Issue：ScheduleEventQueuePanel 事件队列缺少 list/listitem 语义

## 现象

- 排产事件队列原本通过 `.event-grid` 和 `.event-card` 视觉展示缺料、设备、急单等重排触发事件。
- 事件队列容器没有 `role="list"`，事件卡片没有 `role="listitem"`。
- 事件卡片的类型、标题、风险等级、影响订单和窗口没有合并成稳定可访问名称。

## 影响

- 辅助技术用户难以感知这是一个可逐项浏览的排产事件队列。
- 三类事件触发 Agent 重排建议是排产页核心入口，缺少列表语义会削弱精品级 UX 和可审计性。

## 处理

- 为事件队列容器增加 `role="list"` 和带事件数量的 `aria-label`。
- 为每张事件卡增加 `role="listitem"` 和稳定可访问名称。
- 用 RED/GREEN 单测和真实 Chromium 场景验证。

## 状态

- A 轨道本片已处理并验证。
- B 轨道发布闸门仍未关闭。
