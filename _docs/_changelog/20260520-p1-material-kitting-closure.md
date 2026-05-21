# 2026-05-20 P1 — 缺料齐套闭环

## 触发

深化计划中 P1 “缺料齐套闭环”要求库存和 BOM 不再只是独立列表，而是能按工单和排产窗口判断齐套状态，并把缺料风险回写到调度员 Agent 工作台。

## 产出

- 新增 `src/frontend/src/components/inventory/KittingClosurePanel.vue`
- 更新 `src/frontend/src/components/inventory/InventoryBoard.vue`
- 更新 `src/frontend/src/utils/shortage-risk-sync.ts`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 新增 `src/frontend/tests/e2e/inventory.spec.ts`
- 更新 `src/frontend/tests/e2e/modules.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `库存管理` 页面新增“工单齐套闭环”面板。
- 按工单展示 BOM、需要量、可用量、在途量和缺口。
- 按排产时间窗预测：
  - 今天缺
  - 3 天后缺
  - 7 天内齐套
- 自动建议覆盖：
  - 调拨
  - 替代料
  - 采购加急
  - 调整排产顺序
- 生成缺料排产事件后，`AI 排产` 事件队列会读取齐套缺口并生成 Agent 重排建议。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/inventory.spec.ts --reporter=list --workers=1 --retries=0`，2 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`，101 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续 P1：设备故障与瓶颈联动，把设备不可用、预计停机、可替代设备和重排建议打通。
