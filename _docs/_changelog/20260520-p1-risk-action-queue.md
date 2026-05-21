# 2026-05-20 P1 — 风险预警行动队列

## 触发

深化计划中 P1 “风险预警变行动队列”要求风险页不再只展示延期、设备、物料和产能风险，而是为每个风险生成可关闭、可转派、可升级的处置工作项。

## 产出

- 新增 `src/frontend/src/components/risk/RiskActionQueuePanel.vue`
- 更新 `src/frontend/src/components/risk/RiskBoard.vue`
- 新增 `src/frontend/tests/e2e/risk.spec.ts`
- 更新 `src/frontend/tests/e2e/modules.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `风险预警` 页面新增“风险处置队列”面板。
- 每张处置卡展示：
  - 风险类型
  - 影响工单
  - 交期影响
  - 建议动作
  - 负责人
  - 截止时间
  - 当前状态
- demo 处置卡覆盖工单延期、物料缺口和设备健康三类风险。
- 支持风险工作项“转派 / 升级 / 关闭”操作。
- 操作后更新状态、负责人和处置留痕，留痕进入 OTD 复盘与审计口径。

## 验证

- 通过：`node ./node_modules/nuxt/bin/nuxt.mjs build`
- 通过：`node node_modules/@playwright/test/cli.js test tests/e2e/risk.spec.ts --reporter=list --workers=1 --retries=0`，2 passed。
- 通过：`node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`，99 passed。
- 已知非阻塞警告：Node `DEP0180`、SignalR Rollup PURE comment、chunk size > 900 kB。

## 下一步

继续 P1：按工单做齐套检查，把 BOM 展开、库存可用量、在途量、缺口和排产时间窗连成缺料齐套闭环。
