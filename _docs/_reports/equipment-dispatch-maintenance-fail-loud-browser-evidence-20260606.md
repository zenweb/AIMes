# EquipmentScheduleImpactPanel 异常分流维护复核单失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续收敛 `EquipmentScheduleImpactPanel`，不扩展新功能。
- 本片覆盖 `生成维护复核单`：异常分流设备维护记录存在时，维护复核单写入 OTD 证据失败必须 fail loud，不能显示 `异常分流维护单已同步`。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/equipment/EquipmentScheduleImpactPanel.vue`
  - `syncDispatchMaintenance()` 捕获设备停机事件/OTD 证据链写入异常。
  - 成功时设置 `role="status"` 并显示 `异常分流维护单已同步`。
  - 失败时设置 `role="alert"`，显示 `异常分流维护单同步失败` 与 `维护/OTD 证据未完整归档`，并透出具体错误原因。
- `src/frontend/tests/unit/equipment-schedule-impact-panel.test.ts`
  - 新增 `keeps dispatch maintenance evidence failures visible instead of announcing sync success`。
  - 先验证原实现会冒泡异常且 `role` 仍为 `status`，再补实现转绿。
- `src/frontend/tests/e2e/equipment.spec.ts`
  - 新增 `异常分流维护复核单 OTD 证据写入失败时真实浏览器保留 fail-loud 告警`。
  - 真实 Chromium 先进入异常管理确认 `CNC-001 主轴温升异常` 设备分流，再进入设备维护页。
  - 覆盖 `Storage.prototype.setItem`，仅当 `aimes_otd_evidence_chain` 写入值包含 `equipment-maintenance-equipment-cnc001` 时抛出 `chromium dispatch maintenance OTD evidence storage unavailable`。
  - 断言页面显示失败告警，不显示成功同步文案，也不写入 `equipment-maintenance-equipment-cnc001` 伪造证据。

## 验证

- RED：`npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts -t "dispatch maintenance evidence failures"`
  - 预期失败：未处理异常 `dispatch maintenance OTD evidence storage unavailable`，且 `role` 仍为 `status`。
- GREEN：`npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts -t "dispatch maintenance evidence failures"`
  - Vitest 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "异常分流维护复核单 OTD 证据写入失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 调试记录

- 真实 Chromium 用例初跑失败一次，原因是测试错误假设维护单 id 为 `equipment-maintenance-ANOM-EQ-CNC001-20260521`。
- 查 `AnomalyBoard.vue` 后确认真实 `anomalyId` 为 `equipment-cnc001`，维护单 id 为 `equipment-maintenance-equipment-cnc001`。
- 修正测试条件后同一用例通过。

## 未通过/未覆盖项

- 当前 `eslint.config.cjs` 不覆盖 `tests/e2e/**/*.ts`，因此本片仍不能给出 e2e lint 通过证据。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、灰度观察窗口等 B 轨发布闸门。

