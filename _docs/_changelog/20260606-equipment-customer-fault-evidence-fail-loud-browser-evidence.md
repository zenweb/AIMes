# 2026-06-06 EquipmentScheduleImpactPanel 客户设备故障样例失败真实浏览器证据

## Changed

- 为 `EquipmentScheduleImpactPanel` 的 `生成客户设备故障样例` 补 POC/OTD 证据写入失败 fail-loud 状态。
- 当客户样例 OTD 证据链写入失败时，面板显示 `客户设备故障样例同步失败` 与 `POC/OTD 证据未完整归档`，不再保留 `客户设备故障样例已接入`。
- 新增真实 Chromium 用例，确认第二次 `aimes_otd_evidence_chain` 写入失败时不会伪造 `customer-equipment-fault-IMP-POC-EQ-FAULT-20260520-001`。

## Tests

- `npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts`：1 file passed，3/3 passed。
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "客户设备故障样例 OTD 证据写入失败"`：Nuxt production build passed，Chromium 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "(设备故障 OTD 证据写入失败|客户设备故障样例 OTD 证据写入失败)"`：Nuxt production build passed，Chromium 2/2 passed。

## Notes

- `tests/e2e` 当前未纳入 ESLint 配置，不能声明 e2e lint passed。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。

