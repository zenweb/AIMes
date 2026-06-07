# EquipmentScheduleImpactPanel 设备故障同步失败真实浏览器证据报告

日期：2026-06-06

## 范围

- A 轨道：精品化现有用户关键路径。
- 选片依据：`EquipmentScheduleImpactPanel.vue` 当前 coverage summary 中行覆盖 64.86%，且设备故障同步排产是生产与 AI 排产的关键约束链路。
- 本片修复并验证：设备故障停机事件同步时，如果 OTD 证据链写入失败，页面必须 fail loud，不能显示“设备故障已同步 AI 排产”。
- 未改动发布 B 轨道闸门。

## 变更

- `src/frontend/src/components/equipment/EquipmentScheduleImpactPanel.vue`
  - 新增 `syncState`，让同步提示可在成功时保持 `role="status"`，失败时切换为 `role="alert"`。
  - `syncDowntimeEvent()` 捕获设备停机事件/OTD 证据链写入异常。
  - 失败时显示 `设备故障同步失败` 与 `排产/OTD 证据未完整归档`，并透出具体错误原因。
- `src/frontend/tests/unit/equipment-schedule-impact-panel.test.ts`
  - 新增失败单测，先验证原实现会冒泡异常且不会显示 alert，再补实现通过。
- `src/frontend/tests/e2e/equipment.spec.ts`
  - 新增 `设备故障 OTD 证据写入失败时真实浏览器保留 fail-loud 告警`。
  - 在真实 Chromium 中覆盖 `Storage.prototype.setItem`，仅对 `aimes_otd_evidence_chain` 抛出 `chromium equipment OTD evidence storage unavailable`。
  - 断言页面显示失败告警，不显示成功同步文案，也不写入 `TRACE-EQ-DOWNTIME-CNC-001` 伪造证据。

## 验证

- `npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts`
  - 1 file passed。
  - 2/2 tests passed。
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "设备故障 OTD 证据写入失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 未通过/未覆盖项

- 当前 `eslint.config.cjs` 不覆盖 `tests/e2e/**/*.ts`，因此本片仍不能给出 e2e lint 通过证据。
- 本片只验证设备故障停机同步按钮的 OTD 证据失败；客户真实设备故障样例与异常分流维护复核单仍可继续补 fail-loud 浏览器证据。

## B 轨道仍未关闭

- Hosted CI 仍缺完整发布级 run URL / run id / job summary 归档。
- PostgreSQL/staging rehearsal 仍缺真实演练完成证据。
- Attack Chain A/B/C 仍缺人工 verifier 与 `VerifiedAt`。
- Security signoff 仍缺授权人签字。
- Gray observation 仍缺首次灰度与 14 个自然日 P0/P1=0 观察窗口。
