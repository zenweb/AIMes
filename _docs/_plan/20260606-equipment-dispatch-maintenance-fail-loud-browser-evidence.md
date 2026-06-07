# Plan: EquipmentScheduleImpactPanel 异常分流维护复核单失败真实浏览器证据

日期：2026-06-06

## 成功标准

- 真实浏览器先在异常管理确认 `CNC-001 主轴温升异常` 设备分流。
- 设备页显示 `异常分流设备维护` 面板。
- 点击 `生成维护复核单`。
- 当维护复核单 OTD 证据链写入失败时，页面显示 fail-loud 告警。
- 告警说明 `维护/OTD 证据未完整归档`，并包含浏览器抛错原因。
- 不显示 `异常分流维护单已同步`。
- 不写入 `equipment-maintenance-equipment-cnc001`。
- 面板单元测试通过。

## 执行

- 已为 `syncDispatchMaintenance()` 增加失败捕获和 `role="alert"` 状态。
- 已新增单测覆盖 OTD 写入失败。
- 已新增真实 Chromium 用例覆盖异常管理到设备维护的跨页路径。

## 验证命令

- `npm.cmd run test:unit -- tests/unit/equipment-schedule-impact-panel.test.ts -t "dispatch maintenance evidence failures"`
- `npm.cmd run test:e2e -- tests/e2e/equipment.spec.ts -g "异常分流维护复核单 OTD 证据写入失败"`

## 停止条件

- 本片 A 轨证据已补齐。
- B 轨外部发布闸门未关闭，不能声明 v1.0.0 发布就绪。

