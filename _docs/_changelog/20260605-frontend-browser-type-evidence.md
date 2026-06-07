# 2026-06-05 前端真实浏览器与类型证据补强

## Change

- 为 `dhtmlx-gantt` 增加本地保守类型声明，覆盖 `GanttChart.vue` 实际使用的配置、模板、事件和渲染 API，移除 `gantt is unknown` 类型红项。
- 修复 `MainLayout.vue` 的 `aria-expanded` 绑定类型，保持移动菜单可访问性语义。
- 为采购供应风险记录补充 `SupplyRiskEscalation` 类型边界，避免供应整改决策被拓宽成普通 `string`。

## Validation

- `node ./node_modules/vue-tsc/bin/vue-tsc.js --noEmit`：通过。
- `npm run test:unit -- tests/unit/gantt-chart.test.ts tests/unit/schedule-board.test.ts`：`2 files / 28 tests passed`。
- `npm run test:e2e -- login.spec.ts demo-smoke.spec.ts`：Nuxt production build + Chrome Playwright，`12 tests passed`。

## Note

- E2E 构建仍提示部分 chunk 超过 `900 kB`。本轮未处理打包拆分，因为它不是当前登录/排产真实浏览器证据的阻断项。
