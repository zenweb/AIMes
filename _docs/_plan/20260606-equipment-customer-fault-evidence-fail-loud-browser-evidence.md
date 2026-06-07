# Plan: EquipmentScheduleImpactPanel 客户设备故障样例失败真实浏览器证据

日期：2026-06-06

## 成功标准

- 设备页点击 `生成客户设备故障样例`。
- 当客户样例 OTD 证据链第二次写入失败时，页面显示 fail-loud 告警。
- 告警说明 `POC/OTD 证据未完整归档`，并包含浏览器抛错原因。
- 不显示 `客户设备故障样例已接入`。
- 不写入 `customer-equipment-fault-IMP-POC-EQ-FAULT-20260520-001`。
- 面板单元测试通过。
- 与上一片设备故障 OTD 失败真实浏览器用例合跑通过。

## 执行

- 已让 `syncDowntimeEvent()` 返回完整同步结果。
- 已为 `prepareCustomerFaultEvidence()` 增加客户样例证据失败捕获和 `role="alert"` 状态。
- 已新增单测覆盖第二次 OTD 写入失败。
- 已新增真实 Chromium 用例覆盖浏览器 storage 第二次写入失败。

## 验证命令

- `npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts`
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "客户设备故障样例 OTD 证据写入失败"`
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "(设备故障 OTD 证据写入失败|客户设备故障样例 OTD 证据写入失败)"`

## 停止条件

- 本片 A 轨证据已补齐。
- B 轨外部发布闸门未关闭，不能声明 v1.0.0 发布就绪。

