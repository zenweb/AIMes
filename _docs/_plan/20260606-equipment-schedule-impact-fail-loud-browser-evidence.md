# Plan: EquipmentScheduleImpactPanel 设备故障同步失败真实浏览器证据

日期：2026-06-06

## 成功标准

- 设备页点击 `标记故障并同步排产`。
- 当 `aimes_otd_evidence_chain` 写入失败时，页面显示 fail-loud 告警。
- 告警说明 `排产/OTD 证据未完整归档`，并包含浏览器抛错原因。
- 不显示成功同步文案。
- 不写入 `TRACE-EQ-DOWNTIME-CNC-001`。
- 面板单元测试通过。

## 执行

- 已为 `EquipmentScheduleImpactPanel.vue` 增加 `syncState` 和同步失败捕获。
- 已新增单测覆盖失败态。
- 已新增真实 Chromium 用例覆盖浏览器 storage 写入失败。

## 验证命令

- `npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts`
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "设备故障 OTD 证据写入失败"`

## 停止条件

- 本片 A 轨证据已补齐。
- B 轨外部发布闸门未关闭，不能声明 v1.0.0 发布就绪。
