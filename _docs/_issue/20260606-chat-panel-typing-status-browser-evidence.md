# 2026-06-06 Issue：ChatPanel 等待回复指示器缺少 status 语义

## 现象

- 用户发送问题后，AI 助手显示 typing dots，但该节点没有 `role="status"` 或明确可访问名称。

## 影响

- 辅助技术用户无法稳定获知“助手正在生成回复”，只能等待新消息出现。
- 这不影响问答结果，但影响 AI 助手入口的精品级 UX。

## 处理

- 为 typing 指示器增加 `role="status"`、`aria-live="polite"` 和 `aria-label="AI 生产助手正在生成回复"`。
- 用 deferred Promise 单测和真实 Chromium 可控 pending 请求验证。

## 状态

- A 轨道本片已处理并验证。
- B 轨道发布闸门仍未关闭。
