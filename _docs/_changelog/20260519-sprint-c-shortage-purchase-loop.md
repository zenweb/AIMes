# 2026-05-19 Sprint C — 缺料进入采购协同

## 触发

继续推进 Sprint C“执行闭环”，把排产/风险中的缺料事件转成采购协同动作，并在采购收货后回写风险下降。

## 产出

- 新增 `src/frontend/src/components/purchase/ShortageActionPanel.vue`
- 新增 `src/frontend/src/utils/shortage-risk-sync.ts`
- 更新 `src/frontend/src/components/purchase/PurchaseBoard.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleEventQueuePanel.vue`
- 更新 `src/frontend/src/components/dashboard/DashboardBoard.vue`
- 新增 `src/frontend/tests/e2e/purchase.spec.ts`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- 采购协同页新增“缺料采购协同”面板，展示受影响工单、缺口数量、建议动作、供应商与替代料。
- 点击“生成采购加急单”后创建或 fallback 插入 `PO-RUSH-20260519`，并选中采购详情。
- 点击“启用替代料建议”后生成 `M-AL-6061B` 替代 `M-AL-6061` 的联动记录。
- 点击“模拟加急收货”后把缺口清零，采购单状态更新为已完成，并展示“风险下降 / 采购收货已回写风险”。
- 采购收货会写入共享缺料风险同步记录。
- 排产事件队列读取该记录后，把 `M-AL-6061 齐套缺口` 标记为 `风险下降 / 已缓解`，并提供“缺料缓解后排产复核”建议。
- 生产概览物料预警读取该记录后显示“风险下降”同步卡，展示缺口清零和受影响工单。

## 验证

- `node ./node_modules/nuxt/bin/nuxt.mjs build`：通过。
- `node node_modules/@playwright/test/cli.js test tests/e2e/purchase.spec.ts --reporter=list --workers=1 --retries=0`：2 passed，覆盖采购 -> 排产 -> 生产概览跨页面风险回写。
- `node node_modules/@playwright/test/cli.js test tests/e2e/scheduling.spec.ts --reporter=list --workers=1 --retries=0`：14 passed。
- `node node_modules/@playwright/test/cli.js test tests/e2e/dashboard.spec.ts --reporter=list --workers=1 --retries=0`：6 passed。
- `node node_modules/@playwright/test/cli.js test tests/e2e/production.spec.ts --reporter=list --workers=1 --retries=0`：16 passed。
- `node node_modules/@playwright/test/cli.js test tests/e2e/equipment.spec.ts --reporter=list --workers=1 --retries=0`：16 passed。
- `node node_modules/@playwright/test/cli.js test --reporter=list --workers=1`：77 passed。

## 下一步

进入 Sprint D 前置：把 OTD 改善复盘报告、30 单演示数据和 5 分钟可销售 demo 路径串起来。
