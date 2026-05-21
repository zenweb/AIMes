# 2026-05-20 P1 — 生产执行闭环补强

## 触发

深化计划中 P1 “生产执行闭环”要求生产报工不只是开工、完工、异常按钮，而要把工序 SOP、质检点、设备要求、人员资质、物料齐套、排产回写、质量联动和异常管理事件串成一条现场执行闭环。

## 产出

- 新增 `src/frontend/src/utils/production-anomaly-sync.ts`
- 更新 `src/frontend/src/components/production/ProductionBoard.vue`
- 更新 `src/frontend/src/components/production/StartQualificationPanel.vue`
- 更新 `src/frontend/src/components/anomaly/AnomalyBoard.vue`
- 更新 `src/frontend/src/components/risk/RiskActionQueuePanel.vue`
- 更新 `src/frontend/tests/e2e/production.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 工序卡片展示 SOP、质检点、设备要求和物料齐套约束。
- 开工前校验从人员资质扩展到：
  - 人员资质
  - 设备状态
  - 物料齐套
  - 上道工序状态
  - SOP 版本
  - 质检点
- 开工确认后的执行回写记录包含 SOP、设备占用、人员资质和物料齐套标签。
- 异常上报写入生产异常共享事件。
- `异常管理` 页面会合并生产报工生成的异常事件，并可打开详情查看 AI 处置建议。
- `风险预警` 页面会把生产异常事件自动转成处置卡，进入风险队列并保留处置留痕。
- 质量页的检验批次会自动生成返工排产事件，排产页和报表页会读取同一条共享返工记录。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
  - 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE 注释、chunk size > 900 kB。
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/production.spec.ts --reporter=list --workers=1 --retries=0`
  - 结果：18 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`
  - 结果：102 passed，3 flaky 后重试通过，退出码 0。
  - flaky 用例均为页面加载超时后 retry 通过：`Equipment 设备管理 › 设备卡片显示名称和状态`、`Equipment 设备管理 › 点击设备打开详情面板`、`Scheduling 排产甘特图 › 任务条数量`。
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/risk.spec.ts tests/e2e/production.spec.ts --reporter=list --workers=1`
  - 结果：22 passed。
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/quality.spec.ts --reporter=list --workers=1 --retries=0`
  - 结果：1 passed。

## 下一步

继续 P1/P2：把生产异常进一步回写到风险预警处置队列，并让质量不合格自动生成返工排产事件和根因证据。
