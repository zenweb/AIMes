# 2026-05-19 Sprint C — 生产执行回写闭环

## 触发

Sprint B 已完成“事件 -> Agent 建议 -> 采纳反馈”的排产主线，继续推进 Sprint C“执行闭环”，先落地生产报工对排产、质量、风险的回写。

## 产出

- 新增 `src/frontend/src/components/production/ProductionExecutionTracePanel.vue`
- 更新 `src/frontend/src/components/production/ProductionBoard.vue`
- 更新 `src/frontend/tests/e2e/production.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 生产报工详情页新增“执行闭环：排产回写与 OTD 复盘”面板。
- 开工后生成排产回写记录，展示工位、设备占用和进度回写。
- 完工后：
  - 更新当前工单完成数量、进度和状态。
  - 生成排产回写记录。
  - 生成质量联动记录。
  - 标记 `OTD 达成` 或 `OTD 风险`。
- 异常上报后生成风险联动记录，提示进入异常管理并触发排产风险复核。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- `node node_modules/@playwright/test/cli.js test tests/e2e/production.spec.ts --reporter=list --workers=1 --retries=0`：16 passed。

## 下一步

继续 Sprint C-3：缺料进入采购协同。目标是把排产/风险中的缺料事件转成采购加急或替代料动作，并在采购收货后回写风险下降。
