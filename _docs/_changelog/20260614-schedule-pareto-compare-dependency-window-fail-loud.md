# 2026-06-14 多目标对比依赖时间顺序 Fail-Loud

## 变更
- `ParetoCompare.vue` 在对比方案的计划项依赖时间顺序不可执行时，不再进入可采用状态。
- 新增依赖窗口校验：下游任务的 `plannedStartTime` 必须不早于所有依赖任务的 `plannedEndTime`。
- 命中时展示 `批量优化对比失败: 后端对比方案计划项依赖时间顺序无效`。
- 失败后不展示推荐卡或“采用此方案”按钮，避免依赖链还没完成就开始下游任务的方案进入采纳、甘特图和审计链路。
- 补充单测和 Chromium 真实浏览器用例，覆盖 B 依赖 A 但 B 在 A 完成前开始的 fail-loud 行为。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "dependency finishes"` 曾失败，旧逻辑仍渲染推荐卡和采用按钮。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "dependency finishes"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "依赖时间顺序"`，1 passed。
- 中间完整套件曾红：新校验先于自依赖/循环依赖报错，覆盖了更具体的错误信息；已调整顺序为结构性依赖错误优先。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，17 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，63 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 719 tests passed，lines 83.37%，`ParetoCompare.vue` lines 92.68%。
- GREEN：敏感信息扫描 touched files，exit code 1，未命中。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
