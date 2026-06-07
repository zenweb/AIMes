# 2026-06-05 PurchaseBoard Fail-loud Issues

## Fixed

- 问题：`PurchaseBoard.vue` 的采购详情接口失败时静默回退到 demo detail 或空详情。
- 风险：采购员可能误以为详情不存在或正常未选中，后续确认、收货、取消和供应风险动作缺少真实上下文。
- 处理：`selectOrder()` 捕获 `getPurchaseById()` 错误，通过 assertive alert 提示“采购订单详情加载失败”及底层错误，同时保留当前采购列表状态。
- 验证：目标 unit `1 file / 12 tests passed`，全量前端 unit coverage `81 files / 416 tests passed`，lint 通过。

- 问题：`PurchaseBoard.vue` 的供应风险升级写入失败时，页面可能已经显示“已升级”。
- 风险：采购员可能误以为延期风险已进入审计和 OTD 证据链，但真实供应风险记录未持久化。
- 处理：`handleEscalateSupplyRisk()` 改为先完成供应风险记录和 OTD 证据写入，再更新页面状态；失败时通过 assertive alert 提示“供应风险升级失败”及底层错误，并保持待识别/空追踪。
- 验证：目标 unit `1 file / 13 tests passed`，全量前端 unit coverage `81 files / 417 tests passed`，lint 通过。

- 问题：`PurchaseBoard.vue` 的替代供应商到货确认写入失败时，页面可能已经显示“替代已到货”。
- 风险：采购员可能误以为替代供应已到货且供应风险关闭，但真实到货审计和 OTD 证据链未持久化。
- 处理：`handleReceiveAlternateSupplier()` 改为先完成替代到货记录和 OTD 证据写入，再更新页面状态；失败时通过 assertive alert 提示“替代供应商到货确认失败”及底层错误，并保持“替代已锁定”状态和原追踪。
- 验证：目标 unit `1 file / 14 tests passed`，全量前端 unit coverage `81 files / 418 tests passed`，lint 通过。

- 问题：`PurchaseBoard.vue` 的供应网络选优写入失败时，页面可能已经显示“已选优”。
- 风险：采购员可能误以为首选恢复供应商和 SLA 决策已落地，但真实供应网络决策和 OTD 证据链未持久化。
- 处理：`handleSupplierNetworkDecision()` 改为先完成供应网络决策和 OTD 证据写入，再更新页面状态；失败时通过 assertive alert 提示“供应网络选优失败”及底层错误，并保持“待决策”。
- 验证：目标 unit `1 file / 15 tests passed`，全量前端 unit coverage `81 files / 419 tests passed`，lint 通过。

- 问题：`PurchaseBoard.vue` 的来料异常供应商整改承诺写入失败时，页面可能已经显示“替代已锁定”。
- 风险：采购员可能误以为供应商 8D 和备用批次承诺已落地，但真实整改审计和 OTD 证据链未持久化。
- 处理：`handleMaterialSupplierCorrection()` 改为先完成供应风险记录和 OTD 证据写入，再更新页面状态；失败时通过 assertive alert 提示“供应商整改承诺锁定失败”及底层错误，并保持“待识别”。
- 验证：目标 unit `1 file / 16 tests passed`，全量前端 unit coverage `81 files / 420 tests passed`，lint 通过。

- 问题：`PurchaseBoard.vue` 的采购加急收货证据回写失败时，页面可能已经显示“风险下降”并把缺口清零。
- 风险：采购员可能误以为缺料风险已关闭、排产可恢复执行，但真实缺料关闭记录和 OTD 证据链未持久化。
- 处理：`handleReceiveExpedite()` 改为先完成缺料关闭记录、库存齐套证据关闭和采购回写证据写入，再更新页面状态；失败时通过 assertive alert 提示“采购加急收货回写失败”及底层错误，并保持“已加急”。
- 验证：目标 unit `1 file / 17 tests passed`，全量前端 unit coverage `81 files / 421 tests passed`，lint 通过。

- 问题：`PurchaseBoard.vue` 的外协到货确认写入失败或返回空结果时没有页面级失败反馈。
- 风险：采购员可能无法判断外协承诺仍待到货，影响厂外等待口径关闭和排产释放复核。
- 处理：`handleConfirmOutsourcingArrival()` 捕获 `confirmOutsourcingCommitmentArrival()` 错误并提示“外协到货确认失败”；返回 `null` 时提示未找到可写记录，保持原承诺状态。
- 验证：目标 unit `1 file / 18 tests passed`，全量前端 unit coverage `81 files / 422 tests passed`，lint 通过。

## Remaining

- `PurchaseBoard.vue` 行覆盖率已到 `75.81%`，当前供应风险、供应网络、异常整改、加急收货和外协到货的写入失败均有 fail-loud 覆盖；后续更适合按覆盖率杠杆转向其它更低覆盖的用户必经组件。
- B-track 发布门仍缺真实 GitHub repo/Actions run、staging rehearsal、Attack Chain A/B/C 人工验证、安全签字、首次灰度和 14 天无 P0/P1 观察。
