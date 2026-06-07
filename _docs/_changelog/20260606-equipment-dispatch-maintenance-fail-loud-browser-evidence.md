# 2026-06-06 EquipmentScheduleImpactPanel 异常分流维护复核单失败真实浏览器证据

## Changed

- 为 `EquipmentScheduleImpactPanel` 的 `生成维护复核单` 补 OTD 证据写入失败 fail-loud 状态。
- 当维护复核单 OTD 证据链写入失败时，面板显示 `异常分流维护单同步失败` 与 `维护/OTD 证据未完整归档`，不再保留 `异常分流维护单已同步`。
- 新增真实 Chromium 用例，确认 `equipment-maintenance-equipment-cnc001` 写入失败时不会伪造维护复核单证据。

## Tests

- `npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts -t "dispatch maintenance evidence failures"`：RED 先失败，GREEN 后 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "异常分流维护复核单 OTD 证据写入失败"`：Nuxt production build passed，Chromium 1/1 passed。

## Notes

- `tests/e2e` 当前未纳入 ESLint 配置，不能声明 e2e lint passed。
- B 轨道发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、14 天灰度观察。

