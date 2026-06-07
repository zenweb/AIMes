# 2026-06-05 PurchaseBoard Fail-loud Changelog

## Purchase Detail Load Fail-loud Slice

- 选片依据：按覆盖率杠杆从已接近 80% 行覆盖的 `BomBoard.vue` 转向更低覆盖且业务关键的 `PurchaseBoard.vue`；采购详情是确认、收货、取消和供应风险动作的前置上下文。
- 问题：`getPurchaseById()` 抛错时，`selectOrder()` 静默回退到本地 demo detail 或空详情，没有告知真实采购详情接口不可用。
- 风险：采购员可能只看到详情未打开或 demo fallback，误判为没有采购单详情，而不是后端详情接口失败。
- 修复：`selectOrder()` 失败时提示“采购订单详情加载失败”并展示底层错误，同时保留当前列表状态和既有 fallback 行为。
- 行为保持：采购详情成功加载路径不变；成功时只清理同类旧“采购订单详情加载失败”告警。
- 测试：新增 TDD 用例 `announces when purchase order detail loading fails`，先红于列表仍存在但找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/purchase-board.test.ts` 通过，`1 file / 12 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 416 tests passed`，总行覆盖率 `74.46%`，`PurchaseBoard.vue` 行覆盖率 `61.34%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## Supply Risk Escalation Write Fail-loud Slice

- 选片依据：继续 `PurchaseBoard.vue` 的供应风险控制塔；供应延期升级会影响缺料排产复核、OTD 证据链和采购协同闭环。
- 问题：`handleEscalateSupplyRisk()` 在证据写入前先把页面状态改成“已升级”，且 `writeSupplyRiskEscalation()` / `upsertOtdEvidenceChainRecord()` 抛错时没有页面级失败反馈。
- 风险：采购员可能看到供应风险已升级，但审计记录和 OTD 证据链实际未持久化，形成假绿灯。
- 修复：供应风险升级现在先写供应风险记录和 OTD 证据链，全部成功后才更新页面状态；失败时提示“供应风险升级失败”并保持待识别/空追踪状态。
- 行为保持：成功升级路径仍显示“供应延期已升级”并写入对应 trace。
- 测试：新增 TDD 用例 `keeps supply risk open when escalation cannot be audited`，先红于未捕获 native event handler 错误且页面错误显示“已升级”，再最小修复。
- 验证：`npm run test:unit -- tests/unit/purchase-board.test.ts` 通过，`1 file / 13 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 417 tests passed`，总行覆盖率 `74.50%`，`PurchaseBoard.vue` 行覆盖率 `62.80%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## Alternate Supplier Receipt Write Fail-loud Slice

- 选片依据：继续 `PurchaseBoard.vue` 的供应风险控制塔；替代供应商到货确认是采购风险从“替代已锁定”到“风险关闭”的关键闭环。
- 问题：`handleReceiveAlternateSupplier()` 在证据写入前先把页面状态改成“替代已到货”，且 `writeSupplyRiskEscalation()` / `upsertOtdEvidenceChainRecord()` 抛错时没有页面级失败反馈。
- 风险：采购员可能看到供应风险已关闭，但替代到货审计记录和 OTD 证据链实际未持久化，形成假闭环。
- 修复：替代供应商到货确认现在先写供应风险记录和 OTD 证据链，全部成功后才更新页面状态；失败时提示“替代供应商到货确认失败”并保持“替代已锁定”的原状态。
- 行为保持：成功到货路径仍显示“替代到货已确认”并写入对应 receipt trace。
- 测试：新增 TDD 用例 `keeps alternate supplier committed when receipt cannot be audited`，先红于未捕获 native event handler 错误且页面错误显示“替代已到货”，再最小修复。
- 验证：`npm run test:unit -- tests/unit/purchase-board.test.ts` 通过，`1 file / 14 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 418 tests passed`，总行覆盖率 `74.56%`，`PurchaseBoard.vue` 行覆盖率 `64.93%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## Supplier Network Decision Write Fail-loud Slice

- 选片依据：继续 `PurchaseBoard.vue` 的供应网络治理；供应商绩效/SLA 选优是延期供应恢复与二供策略的用户关键动作。
- 问题：`handleSupplierNetworkDecision()` 在审计写入前先把页面状态改成“已选优”，且 `writeSupplierNetworkDecision()` / `upsertOtdEvidenceChainRecord()` 抛错时没有页面级失败反馈。
- 风险：采购员可能看到首选恢复供应商已确认，但供应网络决策和 OTD 证据链实际未持久化，形成 SLA 决策假闭环。
- 修复：供应网络选优现在先写供应网络决策和 OTD 证据链，全部成功后才更新页面状态；失败时提示“供应网络选优失败”并保持“待决策”状态。
- 行为保持：成功选优路径仍显示“供应网络已选优”并写入对应 SLA trace。
- 测试：新增 TDD 用例 `keeps supplier network decision pending when SLA decision cannot be audited`，先红于未捕获 native event handler 错误且页面错误显示“已选优”，再最小修复。
- 验证：`npm run test:unit -- tests/unit/purchase-board.test.ts` 通过，`1 file / 15 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 419 tests passed`，总行覆盖率 `74.61%`，`PurchaseBoard.vue` 行覆盖率 `66.66%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## Material Supplier Correction Write Fail-loud Slice

- 选片依据：继续 `PurchaseBoard.vue` 的异常分流采购整改链路；来料异常供应商 8D + 备用批次承诺会影响采购、库存齐套和排产复核。
- 问题：`handleMaterialSupplierCorrection()` 在审计写入前先把供应风险改成“替代已锁定”，且 `writeSupplyRiskEscalation()` / `upsertOtdEvidenceChainRecord()` 抛错时没有页面级失败反馈。
- 风险：采购员可能看到供应商整改承诺已锁定，但真实整改审计和 OTD 证据链未持久化，形成异常分流采购整改假闭环。
- 修复：来料异常供应商整改现在先写供应风险记录和 OTD 证据链，全部成功后才更新供应风险状态；失败时提示“供应商整改承诺锁定失败”并保持“待识别”。
- 行为保持：成功整改路径仍显示“来料异常整改承诺已锁定”并写入对应 anomaly trace。
- 测试：新增 TDD 用例 `keeps material supplier correction pending when audit write fails`，先修正测试布置让同步和 backend-first 异常分流记录一致，再红于未捕获 native event handler 错误且页面错误显示“替代已锁定”，最后最小修复。
- 验证：`npm run test:unit -- tests/unit/purchase-board.test.ts` 通过，`1 file / 16 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 420 tests passed`，总行覆盖率 `74.68%`，`PurchaseBoard.vue` 行覆盖率 `68.81%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## Expedited Shortage Receipt Write Fail-loud Slice

- 选片依据：继续 `PurchaseBoard.vue` 的缺料采购协同；加急收货会直接把缺料风险从“已加急”降为“风险下降”，属于排产释放关键路径。
- 问题：`handleReceiveExpedite()` 在 `writeShortageRiskResolution()`、`closeOtdEvidenceChainRecords()` 和 `upsertOtdEvidenceChainRecord()` 成功前，已经把缺料状态改成 `mitigated`、缺口清零并显示“采购收货已回写风险”。
- 风险：采购员可能看到齐套缺口已清零、排产复核可释放，但真实缺料风险关闭记录和 OTD 证据链未持久化。
- 修复：加急收货现在先拿到收货结果并写入缺料关闭记录、关闭库存齐套证据、写采购回写证据；全部成功后才更新页面状态。失败时提示“采购加急收货回写失败”并保持“已加急”。
- 行为保持：成功收货路径仍显示“采购收货已回写风险”，并在成功后继续关闭 assistant recovery purchase action。
- 测试：新增 TDD 用例 `keeps expedited shortage ordered when receipt evidence cannot be audited`，先红于未捕获 component event handler 错误且页面错误显示“风险下降”，再最小修复。
- 验证：`npm run test:unit -- tests/unit/purchase-board.test.ts` 通过，`1 file / 17 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 421 tests passed`，总行覆盖率 `74.92%`，`PurchaseBoard.vue` 行覆盖率 `75.41%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。

## Outsourcing Receipt Write Fail-loud Slice

- 选片依据：继续 `PurchaseBoard.vue` 的外协承诺到货确认；该动作会把厂外等待口径转为排产释放复核，属于采购与排产交接关键路径。
- 问题：`handleConfirmOutsourcingArrival()` 调用 `confirmOutsourcingCommitmentArrival()` 时未捕获异常，且返回 `null` 时没有页面级失败反馈。
- 风险：外协到货确认写入 OTD 证据失败或找不到可写记录时，采购员只能看到点击无响应或未捕获错误，无法判断外协承诺仍待到货。
- 修复：外协到货确认现在捕获写入错误并提示“外协到货确认失败”；返回 `null` 时同样 fail loud，明确外协承诺仍待到货。
- 行为保持：成功确认路径仍更新为“外协到货已确认”并展示 receipt trace。
- 测试：新增 TDD 用例 `keeps outsourcing commitment awaiting receipt when arrival evidence cannot be audited`，先红于未捕获 native event handler 错误且找不到 `[role="alert"]`，再最小修复。
- 验证：`npm run test:unit -- tests/unit/purchase-board.test.ts` 通过，`1 file / 18 tests passed`。
- 验证：`npm run test:unit:coverage` 通过，`81 files / 422 tests passed`，总行覆盖率 `74.93%`，`PurchaseBoard.vue` 行覆盖率 `75.81%`。
- 验证：`npm run lint` 通过。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、Attack Chain A/B/C、安全签字、首次灰度和 14 天观察。
