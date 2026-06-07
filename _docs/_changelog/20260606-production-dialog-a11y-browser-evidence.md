# 2026-06-06 ProductionBoard 操作弹窗语义真实浏览器证据

## Changed

- 为 `ProductionBoard` 的开工、完工、异常上报三个既有操作弹窗补充 modal dialog 语义。
- 弹窗现在暴露 `role="dialog"`、`aria-modal="true"` 和对应标题 `aria-labelledby`。
- 取消按钮补充场景化可访问名称：取消开工确认、取消完工报告、取消异常上报。
- 真实 Chromium 异常上报链路现在按 `getByRole('dialog', { name: '异常上报' })` 验证弹窗。

## Tests

- RED：`npm.cmd run test:unit -- tests/unit/production-board.test.ts -t "labelled modal dialog"`：预期失败，原异常弹窗缺少 `[role="dialog"]`。
- GREEN：`npm.cmd run test:unit -- tests/unit/production-board.test.ts -t "labelled modal dialog"`：1 file passed，1/23 passed，22 skipped。
- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "异常上报后生成风险联动记录"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run lint`：ESLint passed，覆盖 `src`、`tests/unit`、`tests/e2e`、`vitest.config.ts`。

## Notes

- 本片只硬化既有生产报工弹窗 UX/可访问性，不新增业务功能。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察。
