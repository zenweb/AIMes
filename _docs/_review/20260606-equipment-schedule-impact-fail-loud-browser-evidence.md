# Review: EquipmentScheduleImpactPanel 设备故障同步失败真实浏览器证据

日期：2026-06-06

## 结论

- 新增失败态实现和真实浏览器证据，修复设备故障同步 OTD 证据写入失败时没有 fail-loud 的缺口。
- 变更范围局限在设备故障排产影响面板和对应测试，没有扩大新功能。

## 已验证

- 原失败单测可复现未处理异常和 `role=status` 的错误状态。
- 修复后单测 2/2 通过。
- Chromium 中模拟 `aimes_otd_evidence_chain` 写入失败时，页面显示 `role="alert"`。
- Chromium 中未显示 `设备故障已同步 AI 排产`。
- Chromium 中未写入 `TRACE-EQ-DOWNTIME-CNC-001` 伪造证据。

## 风险

- e2e 文件当前未纳入 ESLint 配置，静态检查证据仍缺。
- 客户真实设备故障样例与异常分流维护复核单还有各自写证据路径，本片未覆盖这些按钮的失败态。
- 后端持久化、PostgreSQL/staging、hosted CI 不在本片范围内，不能由本片关闭发布闸门。

## 建议

- 下一片继续按覆盖率杠杆选择用户关键路径。
- 若继续设备路径，优先补 `生成客户设备故障样例` 或 `生成维护复核单` 的证据失败 fail-loud 浏览器证据。
