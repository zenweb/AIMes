# 2026-06-06 Issue：AnomalyBoard 现场事件分流 lane 缺少 list/listitem 语义

## 现象

- 现场事件中心原本通过 `.event-lanes` 和 `.event-lane` 视觉展示设备、质量、物料三类异常分流入口。
- 容器没有 `role="list"`，每条 lane 没有 `role="listitem"`。
- 事件类型、标题和下游路线没有合并成稳定可访问名称。

## 影响

- 辅助技术用户难以感知这是一个可逐项浏览的异常分流队列。
- 异常分流是进入风险队列、AI 排产、质量闭环和采购协同的关键入口，缺少列表语义削弱精品级 UX。

## 处理

- 为 `.event-lanes` 增加 `role="list"` 和带数量的 `aria-label`。
- 为 `.event-lane` 增加 `role="listitem"` 和包含类型、标题、路线的 `aria-label`。
- 用 RED/GREEN 单测和真实 Chromium 场景验证。

## 状态

- A 轨道本片已处理并验证。
- B 轨道发布闸门仍未关闭。
