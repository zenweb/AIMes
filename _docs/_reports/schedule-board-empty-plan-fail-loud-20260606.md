# ScheduleBoard 空排产计划 fail-loud 真实浏览器证据

日期：2026-06-06

## 范围

- A 轨质量切片：`ScheduleBoard.vue` 后端返回合法结构但 `items: []` 的空排产计划。
- 目标：不能静默展示 0 任务甘特图；必须 fail loud，并回退到演示排产数据，保留可执行甘特任务。

## 改动

- `src/frontend/src/components/schedule/ScheduleBoard.vue`
  - 在后端排产计划 payload 校验通过后继续校验 `plan.items.length`。
  - 当任务列表为空时抛出“后端排产计划缺少可执行任务，已切换演示排产数据”，走既有 fallback warning。
- `src/frontend/tests/unit/schedule-board.test.ts`
  - 增加空排产计划回退测试，断言 warning 文案和 demo 甘特任务。
- `src/frontend/tests/e2e/scheduling.spec.ts`
  - 增加真实 Chromium e2e：路由模拟 `/api/v1/scheduling/current` 返回 `items: []`，断言 `.warnings-bar` 可见且 `.gantt_task_line` 数量非 0。

## 验证

- `npm run test:unit -- tests/unit/schedule-board.test.ts`
  - 结果：19 passed
- `npm run test:unit:coverage`
  - 结果：84 files / 516 tests passed
  - 覆盖率增量：Global branches 56.93% -> 56.94%；`ScheduleBoard.vue` lines 73.15% -> 73.25%；branches 39.00% -> 39.16%。
- `npm run test:e2e -- tests/e2e/scheduling.spec.ts`
  - 结果：生产构建完成，Chromium 25 passed。
  - 新增真实浏览器用例：`后端返回空排产计划时真实浏览器展示 fail-loud fallback`。
  - 构建观测：最大 JS chunk 仍为 817.50 kB。

## 真实浏览器说明

- Codex 内置 Browser 插件启动失败，原因仍是用户目录 `C:\Users\陈奕铭\package.json` 含 `"type": "module"`，导致插件临时 Node kernel 的 CommonJS `require` 在 ESM 作用域报错。
- 未继续消耗 token 乱修用户目录；改用项目 Playwright e2e，通过真实 Chromium 验证生产构建后的页面行为。

## 结论

- 当前切片已关闭“空计划假绿”风险：后端返回空排产计划时，用户会看到明确预警，页面不会展示 0 任务甘特图伪装成功。
- 这不关闭 B 轨发布门禁；Hosted CI、staging/PostgreSQL、攻击链人工验证、安全签字、14 天灰度观察仍需单独追踪。
