# 2026-06-06 QualityReworkImpactPanel 返工动作语义真实浏览器证据

## Changed

- 为返工排产事件生成按钮补充包含 WO/INS 上下文的可访问名称。
- 返工同步消息现在通过 `role="status"`、`aria-live="polite"` 暴露给辅助技术。
- 返工真实 Chromium 用例改用上下文 `getByRole` 和 status 断言。

## Tests

- `npm.cmd run test:unit -- tests/unit/quality-rework-impact-panel.test.ts`：1 file passed，2/2 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量返工事件回写排产和 OTD 复盘"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- 本片不改变质量返工业务联动逻辑。
- B 轨道发布闸门仍未关闭。
