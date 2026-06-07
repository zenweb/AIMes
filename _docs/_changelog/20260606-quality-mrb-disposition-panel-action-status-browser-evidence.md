# 2026-06-06 QualityMrbDispositionPanel MRB 动作语义真实浏览器证据

## Changed

- 为 MRB 报废补料生成和闭环确认按钮补充包含 WO/INS 上下文的可访问名称。
- MRB 同步消息现在通过 `role="status"`、`aria-live="polite"` 暴露给辅助技术。
- MRB 真实 Chromium 用例改用上下文 `getByRole` 和 status 断言。

## Tests

- `npm.cmd run test:unit -- tests/unit/quality-mrb-disposition-panel.test.ts`：1 file passed，3/3 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量 MRB 报废补料决策联动排产和 OTD 复盘"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- 本片不改变 MRB 业务联动逻辑。
- B 轨道发布闸门仍未关闭。
