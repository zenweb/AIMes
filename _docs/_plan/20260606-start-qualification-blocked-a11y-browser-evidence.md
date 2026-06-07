# 2026-06-06 StartQualificationPanel 开工资质阻断语义 Plan

## 成功标准

- 阻断开工状态在组件单测中具备 `role="alert"` 与 `aria-live="assertive"`。
- gate chip 可暴露明确状态，例如 `阻断`、`告警`、`通过`。
- 真实 Chromium 生产开工场景验证热处理无有效替班候选时，阻断语义存在且确认开工禁用。
- 不扩大功能范围，不修改业务判定。

## 执行

1. 读取 `StartQualificationPanel.vue`、`ProductionBoard.vue` 调用点和既有 production 单元/e2e 测试。
2. 新增 RED 单测证明原面板缺少阻断告警语义。
3. 最小修改组件语义属性。
4. 补真实 Chromium 断言。
5. 记录报告、changelog、review、todo、issue、plan。

## 结果

- 单测 RED 已复现，GREEN 已通过。
- 目标 Chromium 用例已通过。
- B 轨道发布闸门未纳入本片完成标准。
