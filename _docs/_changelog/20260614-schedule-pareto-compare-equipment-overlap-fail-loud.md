# 2026-06-14 多目标对比同设备时间重叠 Fail-Loud

## 变更
- `ParetoCompare.vue` 在对比方案同一设备上存在计划项时间重叠时，不再进入可采用状态。
- 新增按 `equipmentId` 分组、按 `plannedStartTime` 排序的重叠检测；相邻任务出现 `previousEnd > currentStart` 时抛出 `后端对比方案同设备计划项时间重叠`。
- 失败后沿用现有 `role="alert"` 告警，清空推荐状态，不展示推荐卡或“采用此方案”按钮。
- 补充单测和 Chromium 真实浏览器用例，覆盖同一设备 08:00-12:00 与 10:00-14:00 重叠时必须 fail-loud。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "overlap"` 曾失败，旧逻辑仍渲染推荐卡和采用按钮。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "overlap"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "时间重叠"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，16 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，62 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 718 tests passed，lines 83.32%，`ParetoCompare.vue` lines 91.06%。
- GREEN：敏感信息扫描 touched files，exit code 1，未命中。

## 范围
- 继续深挖现有排产多目标对比关键路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
