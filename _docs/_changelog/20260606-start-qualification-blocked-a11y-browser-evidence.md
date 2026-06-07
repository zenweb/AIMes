# 2026-06-06 StartQualificationPanel 开工资质阻断语义真实浏览器证据

## Changed

- 为 `StartQualificationPanel` 的开工资质阻断状态补充 fail-loud 可访问语义。
- 阻断面板现在暴露 `role="alert"` 与 `aria-live="assertive"`，gate chip 和阻断审计包含可朗读的状态/原因。
- 在生产开工真实 Chromium 场景中验证热处理无有效替班候选时，确认开工仍被禁用且阻断语义可见。

## Tests

- `npm.cmd run test:unit -- tests/unit/start-qualification-panel.test.ts`：1 file passed，1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "热处理无有效替班候选时阻断确认开工"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- `tests/e2e` 当前未纳入 ESLint 配置，不能声明 e2e lint passed。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察。
