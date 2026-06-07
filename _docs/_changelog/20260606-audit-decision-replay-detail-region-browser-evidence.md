# 2026-06-06 AuditDecisionReplayPanel 回放详情区真实浏览器证据

## Changed

- 审计回放详情区现在作为命名 `region` 暴露，并通过 `aria-live="polite"` 播报选中回放链变化。
- 真实 Chromium 审计用例现在通过 `getByRole('region', { name })` 验证回放详情区域。

## Tests

- `npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "selected replay chain as a named status region"`：1 file passed，目标用例通过。
- `npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "回放急单插入决策链"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- 本片不改变审计回放业务映射或加载逻辑。
- B 轨道发布闸门仍未关闭。
