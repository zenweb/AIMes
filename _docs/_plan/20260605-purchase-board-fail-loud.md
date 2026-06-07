# 2026-06-05 PurchaseBoard Fail-loud Plan

## A-track

- 已完成：按覆盖率杠杆从 `BomBoard.vue` 转向更低覆盖且业务关键的 `PurchaseBoard.vue`。
- 已完成：修复采购详情接口失败时没有页面级失败反馈的问题。
- 已完成：新增目标测试覆盖 `getPurchaseById()` 抛错时页面提示“采购订单详情加载失败”且保留当前采购列表状态。
- 已验证：目标 unit `1 file / 12 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 416 tests passed`；总行覆盖率 `74.46%`，`PurchaseBoard.vue` 行覆盖率 `61.34%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复供应风险升级写入失败时页面状态先行变更的问题。
- 已完成：新增目标测试覆盖 `writeSupplyRiskEscalation()` 抛错时页面提示“供应风险升级失败”且保持待识别/空追踪。
- 已验证：目标 unit `1 file / 13 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 417 tests passed`；总行覆盖率 `74.50%`，`PurchaseBoard.vue` 行覆盖率 `62.80%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复替代供应商到货确认写入失败时页面状态先行变更的问题。
- 已完成：新增目标测试覆盖第二次 `writeSupplyRiskEscalation()` 抛错时页面提示“替代供应商到货确认失败”且保持“替代已锁定”状态和原追踪。
- 已验证：目标 unit `1 file / 14 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 418 tests passed`；总行覆盖率 `74.56%`，`PurchaseBoard.vue` 行覆盖率 `64.93%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复供应网络选优写入失败时页面状态先行变更的问题。
- 已完成：新增目标测试覆盖 `writeSupplierNetworkDecision()` 抛错时页面提示“供应网络选优失败”且保持“待决策”状态。
- 已验证：目标 unit `1 file / 15 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 419 tests passed`；总行覆盖率 `74.61%`，`PurchaseBoard.vue` 行覆盖率 `66.66%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复来料异常供应商整改承诺写入失败时页面状态先行变更的问题。
- 已完成：新增目标测试覆盖 `writeSupplyRiskEscalation()` 抛错时页面提示“供应商整改承诺锁定失败”且保持“待识别”状态。
- 已验证：目标 unit `1 file / 16 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 420 tests passed`；总行覆盖率 `74.68%`，`PurchaseBoard.vue` 行覆盖率 `68.81%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复采购加急收货证据回写失败时页面状态先行变更的问题。
- 已完成：新增目标测试覆盖 `writeShortageRiskResolution()` 抛错时页面提示“采购加急收货回写失败”且保持“已加急”状态和原 trace。
- 已验证：目标 unit `1 file / 17 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 421 tests passed`；总行覆盖率 `74.92%`，`PurchaseBoard.vue` 行覆盖率 `75.41%`。
- 已验证：`npm run lint` 通过。
- 已完成：修复外协到货确认写入失败或返回空结果时没有页面级失败反馈的问题。
- 已完成：新增目标测试覆盖 `confirmOutsourcingCommitmentArrival()` 抛错时页面提示“外协到货确认失败”且保持“外协承诺待到货”。
- 已验证：目标 unit `1 file / 18 tests passed`。
- 已验证：全量前端 unit coverage `81 files / 422 tests passed`；总行覆盖率 `74.93%`，`PurchaseBoard.vue` 行覆盖率 `75.81%`。
- 已验证：`npm run lint` 通过。
- 下一步：`PurchaseBoard.vue` 已从 `62.80%` 提升到 `75.81%`；按覆盖率杠杆转向其它更低覆盖且用户必经组件。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
