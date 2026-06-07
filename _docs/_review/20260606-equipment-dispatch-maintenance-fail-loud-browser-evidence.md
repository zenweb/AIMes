# Review: EquipmentScheduleImpactPanel 异常分流维护复核单失败真实浏览器证据

日期：2026-06-06

## 结论

- 新增失败态实现和真实浏览器证据，修复异常分流维护复核单 OTD 证据写入失败时可能误报成功的缺口。
- 变更范围局限在设备排产影响面板和对应测试，没有扩大新功能。

## 已验证

- RED 单测复现了当前实现的未处理异常和 `role=status` 错误状态。
- GREEN 后单测目标用例 1/1 通过。
- Chromium 中先通过异常管理生成真实设备分流记录，再进入设备维护页点击 `生成维护复核单`。
- Chromium 中仅让 `equipment-maintenance-equipment-cnc001` 对应 OTD 写入失败，页面显示 `role="alert"`。
- Chromium 中未显示 `异常分流维护单已同步`。
- Chromium 中未写入 `equipment-maintenance-equipment-cnc001` 伪造证据。

## 风险

- e2e 文件当前未纳入 ESLint 配置，静态检查证据仍缺。
- 本片未覆盖后端持久化失败路径；当前真实浏览器证据聚焦 localStorage OTD 证据链写入失败。
- PostgreSQL/staging、hosted CI、安全签字、灰度观察不在本片范围内，不能由本片关闭发布闸门。

## 建议

- 后续继续按覆盖率杠杆选择低覆盖且用户必经组件。
- 若继续设备路径，复跑 coverage summary 判断 `EquipmentScheduleImpactPanel` 是否仍是最优收益点。

