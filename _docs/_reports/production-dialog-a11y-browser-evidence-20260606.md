# ProductionBoard 操作弹窗语义真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片覆盖生产报工 `ProductionBoard` 的开工、完工、异常上报三个既有操作弹窗。
- 重点验证异常上报弹窗能在真实 Chromium 中以命名 modal dialog 暴露，并继续完成风险联动记录链路。
- 未扩展新功能，未改动业务提交、异常管理、OTD 证据或风险联动逻辑。
- 未关闭发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/production/ProductionBoard.vue`
  - 开工、完工、异常上报弹窗增加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby`。
  - 三个弹窗标题增加稳定 id。
  - 三个取消按钮增加场景化 `aria-label`。
- `src/frontend/tests/unit/production-board.test.ts`
  - 新增异常上报弹窗 modal dialog 语义单测。
- `src/frontend/tests/e2e/production.spec.ts`
  - 将异常上报真实 Chromium 断言从 heading 升级为 `getByRole('dialog', { name: '异常上报' })`。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/production-board.test.ts -t "labelled modal dialog"`
  - 预期失败：`Unable to get [role="dialog"]`，证明原异常上报弹窗没有 modal dialog 语义。
- GREEN：`npm.cmd run test:unit -- tests/unit/production-board.test.ts -t "labelled modal dialog"`
  - Vitest 1 file passed，1/23 passed，22 skipped。
- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "异常上报后生成风险联动记录"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run lint`
  - ESLint passed，覆盖 `src`、`tests/unit`、`tests/e2e`、`vitest.config.ts`。

## 未通过/未覆盖项

- 本片未分别为开工、完工弹窗新增独立 Chromium 断言；它们已同步补齐同结构语义，由异常上报路径提供真实浏览器证据。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口。
