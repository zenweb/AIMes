# ProductionExecutionTracePanel 执行闭环语义真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片覆盖生产开工后的 `ProductionExecutionTracePanel`：排产回写与 OTD 复盘记录必须在真实页面中以 live audit list 暴露。
- 未扩展新功能，未改动开工、完工、异常上报或证据写入业务逻辑。
- 未关闭发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/production/ProductionExecutionTracePanel.vue`
  - 根面板增加 `role="status"`、`aria-live="polite"`，并在 `aria-label` 中带上记录数量。
  - 记录容器增加 `role="list"` 和 `aria-label="生产执行闭环记录"`。
  - 每条 trace card 增加 `role="listitem"` 和包含类型、标题、时间的可访问名称。
- `src/frontend/tests/unit/production-execution-trace-panel.test.ts`
  - 新增独立面板单测，先验证原实现缺少 live/list 语义而失败，再补实现转绿。
- `src/frontend/tests/e2e/production.spec.ts`
  - 在 `开工对话框` 真实 Chromium 场景中验证开工后生成的执行闭环记录具备 status/list/listitem 语义。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/production-execution-trace-panel.test.ts`
  - 预期失败：`role` 为 `undefined`，没有 live audit list 语义。
- GREEN：`npm.cmd run test:unit -- tests/unit/production-execution-trace-panel.test.ts`
  - Vitest 1 file passed，1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/production.spec.ts -g "开工对话框"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 未通过/未覆盖项

- `tests/e2e/**/*.ts` 当前仍未纳入 ESLint 配置，不能声明 e2e lint passed。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天 P0/P1=0 观察窗口。
