# 2026-06-06 Issue：StartQualificationPanel 阻断状态缺少 fail-loud 语义

## 现象

- 开工资质阻断状态原本只通过视觉 class 和文本展示。
- 屏幕阅读器或自动化可访问检查无法从根面板获得 `alert/assertive` 语义。

## 影响

- 热处理无有效替班候选这类“禁止开工”的关键状态，可能对辅助技术用户不够响亮。
- 这不影响按钮禁用逻辑，但影响精品级 UX 和可审计性。

## 处理

- 为阻断面板增加 `role="alert"`、`aria-live="assertive"` 和带状态的 `aria-label`。
- 为 gate chip 和阻断审计增加可朗读状态/原因。
- 用单测和真实 Chromium 验证。

## 状态

- A 轨道本片已处理并验证。
- B 轨道发布闸门仍未关闭。
