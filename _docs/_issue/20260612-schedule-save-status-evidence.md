# 2026-06-12 Issue: 排产保存状态证据缺口

## 问题

- live staging 已证明真实 dhtmlx 拖拽会写入 API 和 PostgreSQL，但保存成功在页面上缺少独立、明确的用户可见状态。
- 仅依赖工作台文案不够稳，因为“正式排产计划已更新”与 feedback/采纳流程有关，不适合作为纯拖拽保存的唯一 UI 证据。

## 处理

- 新增 `scheduleSaveStatus`，只在拖拽保存成功后展示。
- 状态文案包含工单号和保存后的窗口，便于调度员确认实际落盘内容。
- live staging E2E 在刷新前断言状态并截图，刷新后继续验证 GET read model 与 PostgreSQL 同窗。

## 当前状态

- 已解决。
- 无新阻断项。
