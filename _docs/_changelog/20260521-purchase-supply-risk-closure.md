# 2026-05-21 采购供应风险闭环

## 触发

功能深化计划中 `采购协同` 被标记为“流程完整，缺供应风险”。现有缺料加急链路能覆盖物料短缺，但还缺少供应商延期、替代供应承诺、替代到货关闭、排产复核和审计回放的闭环。

## 产出

- 更新 `src/frontend/src/components/purchase/PurchaseBoard.vue`
- 更新 `src/frontend/src/components/schedule/ScheduleBoard.vue`
- 更新 `src/frontend/src/utils/shortage-risk-sync.ts`
- 更新 `src/frontend/tests/e2e/purchase.spec.ts`
- 更新 `CHANGELOG.md`
- 更新 `_docs/_plan/20260519-function-deepening-brainstorm.md`

## 功能

- `采购协同` 新增“供应风险控制塔”，展示延期 PO、物料、供应商、替代供应商、影响工单和 OTD 风险。
- 点击“升级供应风险”后写入供应延期风险状态，并同步统一 OTD 证据链。
- 点击“锁定替代供应商”后记录替代供应承诺、到料窗口和追踪编号。
- 点击“确认替代到货”后把供应风险状态推进为 `替代已到货`，写入 `TRACE-PUR-MAT-B02-ALT-SUPPLIER-RECEIVED` 并关闭供应风险。
- `AI 排产` 事件队列读取供应风险状态，生成 `MAT-B02 供应延期风险` 事件。
- 排产建议区可按风险升级、替代供应承诺和替代到货确认生成排产保护、复核与释放建议。
- `报表中心` 和 `审计日志` 通过统一 OTD 证据链回放供应延期升级、替代供应商锁定、替代到货关闭和排产复核记录。
- `采购协同` 新增“供应网络治理”，对 `华东快供二厂 / 北方精密协作厂 / 南方钢材集团` 做绩效、准交率、不良率、报价、产能和 SLA 对比。
- 点击“选优供应商并生成 SLA 决策”后写入 `TRACE-PUR-MAT-B02-SUPPLIER-NETWORK-SLA`，把 `华东快供二厂` 作为恢复供应商，原供应商标记为 SLA 违约。
- `AI 排产` 新增 `MAT-B02 供应商绩效与 SLA 选优` 事件，报表和审计通过 `供应网络` OTD 证据链回放选优决策。

## 验证

- 通过：`npx vue-tsc --noEmit -p tsconfig.json`
- 通过：`npm run test:e2e -- tests/e2e/purchase.spec.ts`，覆盖升级、锁定、到货确认、排产释放、报表和审计回放。

## 下一步

继续补齐采购协同的供应商绩效、交付 SLA 和多供应商报价/承诺比较，让采购侧从单点处置升级为可持续供应网络治理。
