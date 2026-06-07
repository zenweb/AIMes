# EquipmentScheduleImpactPanel 客户设备故障样例失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 本片继续收敛 `EquipmentScheduleImpactPanel`，不扩展新功能。
- 本片覆盖 `生成客户设备故障样例`：客户样例已生成、设备停机事件已写入后，如果客户样例 OTD 证据链写入失败，页面必须 fail loud，不能显示 `客户设备故障样例已接入`。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/equipment/EquipmentScheduleImpactPanel.vue`
  - `syncDowntimeEvent()` 返回同步是否完整成功，客户样例流程依赖该结果继续。
  - `prepareCustomerFaultEvidence()` 捕获客户样例 POC/OTD 证据写入异常。
  - 失败时显示 `客户设备故障样例同步失败` 与 `POC/OTD 证据未完整归档`，并透出具体错误原因。
  - 成功时明确恢复 `role="status"`，失败时保持 `role="alert"`。
- `src/frontend/tests/unit/equipment-schedule-impact-panel.test.ts`
  - 新增 `keeps customer fault evidence failures visible instead of announcing import success`。
  - 模拟第一次 OTD 写入停机事件成功、第二次客户样例 OTD 写入失败。
- `src/frontend/tests/e2e/equipment.spec.ts`
  - 新增 `客户设备故障样例 OTD 证据写入失败时真实浏览器保留 fail-loud 告警`。
  - 在真实 Chromium 中覆盖 `Storage.prototype.setItem`，只在第二次写入 `aimes_otd_evidence_chain` 时抛出 `chromium customer equipment fault OTD evidence storage unavailable`。
  - 断言页面显示失败告警，不显示成功导入文案，也不写入 `customer-equipment-fault-IMP-POC-EQ-FAULT-20260520-001` 伪造证据。

## 验证

- `npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts`
  - Vitest 1 file passed。
  - 3/3 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "客户设备故障样例 OTD 证据写入失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "(设备故障 OTD 证据写入失败|客户设备故障样例 OTD 证据写入失败)"`
  - Nuxt production build passed。
  - Chromium 2/2 passed。

## 未通过/未覆盖项

- 当前 `eslint.config.cjs` 不覆盖 `tests/e2e/**/*.ts`，因此本片仍不能给出 e2e lint 通过证据。
- 本片只验证客户样例 OTD 证据写入失败；异常分流 `生成维护复核单` 的证据失败路径仍待补真实浏览器证据。
- 本片未关闭 hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、灰度观察窗口等 B 轨发布闸门。

