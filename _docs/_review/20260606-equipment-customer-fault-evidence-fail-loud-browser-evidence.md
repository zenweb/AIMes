# Review: EquipmentScheduleImpactPanel 客户设备故障样例失败真实浏览器证据

日期：2026-06-06

## 结论

- 新增失败态实现和真实浏览器证据，修复客户设备故障样例 OTD 证据写入失败时可能误报成功的缺口。
- 变更范围局限在设备排产影响面板和对应测试，没有扩大新功能。

## 已验证

- 原失败单测可复现客户样例第二次 OTD 写入异常未被 fail-loud 告警承接的问题。
- 修复后 `equipment-schedule-impact-panel.test.ts` 3/3 通过。
- Chromium 中模拟第二次 `aimes_otd_evidence_chain` 写入失败时，页面显示 `role="alert"`。
- Chromium 中未显示 `客户设备故障样例已接入`。
- Chromium 中未写入 `customer-equipment-fault-IMP-POC-EQ-FAULT-20260520-001` 伪造证据。
- 设备故障和客户样例两个 OTD 失败真实浏览器用例合跑 2/2 通过。

## 风险

- e2e 文件当前未纳入 ESLint 配置，静态检查证据仍缺。
- 异常分流 `生成维护复核单` 仍有独立写证据路径，本片未覆盖该按钮失败态。
- 后端持久化、PostgreSQL/staging、hosted CI 不在本片范围内，不能由本片关闭发布闸门。

## 建议

- 下一片继续按覆盖率杠杆选择低覆盖且用户必经组件。
- 若继续设备路径，优先补异常分流 `生成维护复核单` 的 OTD 证据失败 fail-loud 浏览器证据。

