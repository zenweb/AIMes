# 2026-06-06 Issue：OrderDetailPanel 工单详情抽屉缺少 dialog/status/alert 语义

## 现象

- 工单详情侧边抽屉原本只通过视觉 open class 展示，没有 `role="dialog"` 或 `aria-modal`。
- 关闭按钮只有 `×`，没有明确可访问名称。
- loading/error/empty 状态没有 live region 语义。

## 影响

- 辅助技术用户难以识别当前处于工单详情抽屉，也难以及时获知详情加载失败和本地排产解释兜底。
- 这不影响接口 fallback 逻辑，但影响排产工作台的精品级 UX 和可审计性。

## 处理

- 为抽屉、关闭按钮、loading/error/empty 状态补语义。
- 用单测和真实 Chromium 验证。

## 状态

- A 轨道本片已处理并验证。
- B 轨道发布闸门仍未关闭。
