# 2026-06-06 EquipmentScheduleImpactPanel 设备故障同步失败真实浏览器证据

## Changed

- 为 `EquipmentScheduleImpactPanel` 补设备故障同步失败的 fail-loud 状态。
- 当 `aimes_otd_evidence_chain` 写入失败时，面板显示 `设备故障同步失败` 与 `排产/OTD 证据未完整归档`，不再保留成功同步文案。
- 新增真实 Chromium 用例，确认不会伪造 `TRACE-EQ-DOWNTIME-CNC-001`。

## Tests

- `npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts`：1 file passed，2/2 passed。
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "设备故障 OTD 证据写入失败"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- `tests/e2e` 当前未纳入 ESLint 配置，不能声明 e2e lint passed。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。
