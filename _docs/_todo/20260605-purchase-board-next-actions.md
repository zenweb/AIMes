# 2026-06-05 PurchaseBoard Next Actions

## Done

- 已完成：`PurchaseBoard.vue` 采购详情接口失败时 fail loud，避免详情加载失败被误读为正常空态。
- 已完成：新增目标测试覆盖 `getPurchaseById()` 抛错时页面提示“采购订单详情加载失败”并保留采购列表。
- 已完成：`PurchaseBoard.vue` 供应风险升级写入失败时 fail loud，避免未持久化风险升级被误认为已进入审计和 OTD 证据链。
- 已完成：新增目标测试覆盖 `writeSupplyRiskEscalation()` 抛错时页面提示“供应风险升级失败”并保持待识别/空追踪。
- 已完成：`PurchaseBoard.vue` 替代供应商到货确认写入失败时 fail loud，避免未持久化到货确认被误认为已关闭供应风险。
- 已完成：新增目标测试覆盖第二次 `writeSupplyRiskEscalation()` 抛错时页面提示“替代供应商到货确认失败”并保持“替代已锁定”状态和原追踪。
- 已完成：`PurchaseBoard.vue` 供应网络选优写入失败时 fail loud，避免未持久化 SLA 决策被误认为已生效。
- 已完成：新增目标测试覆盖 `writeSupplierNetworkDecision()` 抛错时页面提示“供应网络选优失败”并保持“待决策”。
- 已完成：`PurchaseBoard.vue` 来料异常供应商整改承诺写入失败时 fail loud，避免未持久化整改承诺被误认为已锁定。
- 已完成：新增目标测试覆盖 `writeSupplyRiskEscalation()` 抛错时页面提示“供应商整改承诺锁定失败”并保持“待识别”。
- 已完成：`PurchaseBoard.vue` 采购加急收货证据回写失败时 fail loud，避免未持久化缺料关闭被误认为已释放排产风险。
- 已完成：新增目标测试覆盖 `writeShortageRiskResolution()` 抛错时页面提示“采购加急收货回写失败”并保持“已加急”。
- 已完成：`PurchaseBoard.vue` 外协到货确认失败时 fail loud，避免外协承诺仍待到货但用户无反馈。
- 已完成：新增目标测试覆盖 `confirmOutsourcingCommitmentArrival()` 抛错时页面提示“外协到货确认失败”并保持“外协承诺待到货”。

## Continue

- 继续：按覆盖率杠杆转向其它更低覆盖且用户必经组件。
- 继续：按“覆盖率最低且用户必经”选择后续切片，避免回到已高覆盖组件做低收益精修。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
