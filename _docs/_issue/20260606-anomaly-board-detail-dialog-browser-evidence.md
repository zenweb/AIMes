# 2026-06-06 Issue：异常详情抽屉缺少 Dialog 语义

## 现象

- 异常详情滑出面板只是普通固定层和内容容器。
- 关闭按钮只有 `✕`，没有明确可访问名称。

## 影响

- 辅助技术用户无法稳定识别当前异常详情是模态详情面板。
- 异常管理是现场事件到风险、排产、质量、采购闭环的入口，该缺口降低了精品级 UX。

## 处理

- 为 `.panel-content` 增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby="anomaly-detail-title"`。
- 为详情标题增加 `id="anomaly-detail-title"`。
- 为关闭按钮增加 `aria-label="关闭异常详情"`。
- 用 RED/GREEN 单测和真实 Chromium e2e 验证。

## 状态

- A 轨道本片已处理并验证。
- B 轨道发布闸门仍未关闭。
