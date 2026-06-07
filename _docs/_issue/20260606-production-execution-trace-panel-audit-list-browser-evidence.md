# 2026-06-06 Issue：ProductionExecutionTracePanel 执行记录缺少 live audit list 语义

## 现象

- 执行闭环面板原本只通过视觉卡片展示开工、完工或异常上报后的记录。
- 根面板没有 live status 语义，记录列表和记录项也没有 `list/listitem` 语义。

## 影响

- 辅助技术用户难以感知开工后新增的排产回写/OTD 复盘记录数量和记录边界。
- 这不影响业务数据写入，但影响生产执行闭环的精品级 UX 和可审计性。

## 处理

- 为面板增加 `role="status"`、`aria-live="polite"` 和带记录数的可访问名称。
- 为记录容器和记录卡片增加 list/listitem 语义。
- 用单测和真实 Chromium 验证。

## 状态

- A 轨道本片已处理并验证。
- B 轨道发布闸门仍未关闭。
