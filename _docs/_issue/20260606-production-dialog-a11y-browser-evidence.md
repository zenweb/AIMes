# 2026-06-06 Issue：ProductionBoard 操作弹窗缺少 modal dialog 语义

## 现象

- 生产报工的开工、完工、异常上报弹窗原本只通过 `.dialog-overlay` 和 `.dialog-card` 视觉展示。
- 弹窗缺少 `role="dialog"`、`aria-modal="true"` 和标题关联。
- 取消按钮只有通用文本“取消”，缺少当前操作上下文。

## 影响

- 辅助技术用户难以判断当前是否进入模态操作上下文。
- 生产异常上报属于用户关键路径，真实浏览器断言如果只找 heading，无法证明弹窗具备可访问 modal 语义。

## 处理

- 为三个生产操作弹窗补齐 modal dialog 语义和标题关联。
- 为取消按钮补充场景化可访问名称。
- 用 RED/GREEN 单测和真实 Chromium 异常上报链路验证。

## 状态

- A 轨道本片已处理并验证。
- B 轨道发布闸门仍未关闭。
