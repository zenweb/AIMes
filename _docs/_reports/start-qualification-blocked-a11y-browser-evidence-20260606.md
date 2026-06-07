# StartQualificationPanel 开工资质阻断语义真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片覆盖生产开工前的 `StartQualificationPanel`：热处理无有效替班候选时，阻断状态必须在真实页面中以 fail-loud 语义暴露。
- 未扩展新功能，未改动开工业务决策、证据写入或后端接口。
- 未关闭发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/production/StartQualificationPanel.vue`
  - 面板根据 `check.status` 暴露 `role="alert"`/`aria-live="assertive"` 或 `role="status"`/`aria-live="polite"`。
  - 面板 `aria-label` 带上当前开工资质状态，例如 `停工复核`。
  - 每个 gate chip 增加状态语义，如 `替班候选：无有效候选，阻断`。
  - 替班审计使用 `role="status"`，阻断审计使用 `role="alert"`，并在 `aria-label` 中包含审计号、追踪号和阻断原因。
- `src/frontend/tests/unit/start-qualification-panel.test.ts`
  - 新增独立面板单测，先验证原实现缺少 `role="alert"` 而失败，再补实现转绿。
- `src/frontend/tests/e2e/production.spec.ts`
  - 在 `热处理无有效替班候选时阻断确认开工` 的真实 Chromium 场景中验证面板和阻断审计的可访问 fail-loud 语义。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/start-qualification-panel.test.ts`
  - 预期失败：`role` 为 `undefined`，没有阻断告警语义。
- GREEN：`npm.cmd run test:unit -- tests/unit/start-qualification-panel.test.ts`
  - Vitest 1 file passed，1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "热处理无有效替班候选时阻断确认开工"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 未通过/未覆盖项

- `tests/e2e/**/*.ts` 当前仍未纳入 ESLint 配置，不能声明 e2e lint passed。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口。
