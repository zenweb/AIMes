# 2026-06-14 多目标对比后端失败 Fail-Loud

## 变更
- `ParetoCompare.vue` 在 `optimize-compare` 后端失败时，不再自动展示演示推荐方案。
- 真实后端失败时展示 `role="alert"` 的 `批量优化对比失败: ...`，并隐藏推荐卡和“采用此方案”按钮。
- 离线演示模式仍保留 demo 推荐，用于明确的演示场景。
- 新增单测区分真实后端失败和离线演示失败。
- 新增 Chromium 真实浏览器用例：后端 503 时弹窗展示失败告警，且无法采用演示推荐。

## 验证
- RED：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "fails loud"` 曾失败，旧逻辑展示 `综合平衡` 演示推荐并允许采用。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts -t "fails loud"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/pareto-compare.test.ts`，3 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "多目标对比后端失败"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium`，49 passed；其中 `批量方案反馈同步失败...` 首跑 flaky、retry 通过。
- GREEN：`npm run test:e2e -- tests/e2e/scheduling.spec.ts --project=chromium -g "批量方案反馈同步失败"`，1 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 705 tests passed，lines 83.26%，`ParetoCompare.vue` lines 90.41%。

## 范围
- 继续深挖现有排产多目标对比路径，不新增业务范围。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前阻塞项。
