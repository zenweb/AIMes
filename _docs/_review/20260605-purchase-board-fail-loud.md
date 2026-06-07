# 2026-06-05 PurchaseBoard Fail-loud Review

## Purchase Detail Load Fail-loud Review

- 审计结论：本片修复采购详情接口失败时无页面反馈的问题，避免采购员把详情加载失败误认为没有详情或正常空态。
- 行为覆盖：`getPurchaseById()` 抛错后，页面保留采购订单列表和空详情状态，同时必须显示 `[role="alert"]`，包含“采购订单详情加载失败”和底层错误。
- 行为保持：成功详情加载路径不变；成功时只清理同类旧“采购订单详情加载失败”告警，不清理创建、提交、确认、收货、取消或供应风险错误。
- TDD 证据：测试先失败于找不到 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 12 tests passed`；全量前端 unit coverage `81 files / 416 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.46%`，`PurchaseBoard.vue` 行覆盖率 `61.34%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## Supply Risk Escalation Write Fail-loud Review

- 审计结论：本片修复供应风险升级写入失败时无页面反馈且状态先行变更的问题，避免未持久化的风险升级被误认为已生效。
- 行为覆盖：`writeSupplyRiskEscalation()` 抛错后，页面仍显示“待识别”和空追踪，同时必须显示 `[role="alert"]`，包含“供应风险升级失败”和底层错误。
- 行为保持：成功升级路径不变；成功时显示“供应延期已升级”并保留 OTD 证据链写入。
- TDD 证据：测试先失败于未捕获 native event handler 错误且页面错误显示“已升级”；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 13 tests passed`；全量前端 unit coverage `81 files / 417 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.50%`，`PurchaseBoard.vue` 行覆盖率 `62.80%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## Alternate Supplier Receipt Write Fail-loud Review

- 审计结论：本片修复替代供应商到货确认写入失败时无页面反馈且状态先行变更的问题，避免未持久化的到货确认被误认为已关闭供应风险。
- 行为覆盖：第二次 `writeSupplyRiskEscalation()` 抛错后，页面仍显示“替代已锁定”和“替代供应商已锁定”追踪，同时必须显示 `[role="alert"]`，包含“替代供应商到货确认失败”和底层错误。
- 行为保持：成功到货确认路径不变；成功时显示“替代到货已确认”并保留 OTD 证据链写入。
- TDD 证据：测试先失败于未捕获 native event handler 错误且页面错误显示“替代已到货”；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 14 tests passed`；全量前端 unit coverage `81 files / 418 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.56%`，`PurchaseBoard.vue` 行覆盖率 `64.93%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## Supplier Network Decision Write Fail-loud Review

- 审计结论：本片修复供应网络选优写入失败时无页面反馈且状态先行变更的问题，避免未持久化的 SLA 决策被误认为已生效。
- 行为覆盖：`writeSupplierNetworkDecision()` 抛错后，页面仍显示“待决策”，不展示 `.supplier-network-trace`，同时必须显示 `[role="alert"]`，包含“供应网络选优失败”和底层错误。
- 行为保持：成功选优路径不变；成功时显示“供应网络已选优”并保留 OTD 证据链写入。
- TDD 证据：测试先失败于未捕获 native event handler 错误且页面错误显示“已选优”；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 15 tests passed`；全量前端 unit coverage `81 files / 419 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.61%`，`PurchaseBoard.vue` 行覆盖率 `66.66%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## Material Supplier Correction Write Fail-loud Review

- 审计结论：本片修复来料异常供应商整改写入失败时无页面反馈且状态先行变更的问题，避免未持久化的整改承诺被误认为已锁定。
- 行为覆盖：`writeSupplyRiskEscalation()` 抛错后，页面仍显示“待识别”和空供应追踪，同时必须显示 `[role="alert"]`，包含“供应商整改承诺锁定失败”和底层错误。
- 行为保持：成功整改路径不变；成功时显示“来料异常整改承诺已锁定”并保留 OTD 证据链写入。
- TDD 证据：测试先失败于 backend-first mock 清空 material dispatch；修正测试布置后红于未捕获 native event handler 错误且页面错误显示“替代已锁定”；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 16 tests passed`；全量前端 unit coverage `81 files / 420 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.68%`，`PurchaseBoard.vue` 行覆盖率 `68.81%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## Expedited Shortage Receipt Write Fail-loud Review

- 审计结论：本片修复采购加急收货证据回写失败时状态先行变更的问题，避免未持久化的缺料关闭被误认为已释放排产风险。
- 行为覆盖：`writeShortageRiskResolution()` 抛错后，页面仍显示“已加急”和原加急单 trace，同时必须显示 `[role="alert"]`，包含“采购加急收货回写失败”和底层错误。
- 行为保持：成功收货路径不变；成功时显示“采购收货已回写风险”并保留 OTD 证据链写入。
- TDD 证据：测试先失败于未捕获 component event handler 错误且页面错误显示“风险下降”；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 17 tests passed`；全量前端 unit coverage `81 files / 421 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.92%`，`PurchaseBoard.vue` 行覆盖率 `75.41%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。

## Outsourcing Receipt Write Fail-loud Review

- 审计结论：本片修复外协到货确认写入失败时无页面反馈的问题，避免外协承诺仍待到货但用户无法感知。
- 行为覆盖：`confirmOutsourcingCommitmentArrival()` 抛错后，页面仍显示“外协承诺待到货”和“等待采购确认到货”，同时必须显示 `[role="alert"]`，包含“外协到货确认失败”和底层错误。
- 行为保持：成功到货确认路径不变；成功时显示“外协到货已确认”并保留 receipt trace。
- TDD 证据：测试先失败于未捕获 native event handler 错误且找不到 `[role="alert"]`；修复后目标 unit 变绿。
- 验证证据：目标 unit `1 file / 18 tests passed`；全量前端 unit coverage `81 files / 422 tests passed`；`npm run lint` 通过。
- 覆盖率证据：总行覆盖率 `74.93%`，`PurchaseBoard.vue` 行覆盖率 `75.81%`。
- 发布边界：本片仍是 A-track 前端可靠性证据；不关闭 Hosted CI、staging、攻击链验证、安全签字、灰度和 14 天观察。
