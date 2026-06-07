# 2026-06-05 ScheduleBoard Bottleneck Fail-loud Plan

## Success Criteria

- 瓶颈设备读取失败时，不能静默吞错。
- 同一失败不能阻断主排产计划和设备列表渲染。
- 页面必须通过 polite warning 明确说明当前甘特图不会标记后端瓶颈设备，并带出失败原因。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：新增红灯测试覆盖 `getBottleneckEquipmentIds()` 失败时必须保留甘特图并提示失败原因。
- 已完成：修复 `ScheduleBoard.vue`，将静默 catch 改为 warning 记录。
- 已验证：目标 unit `1 file / 13 tests passed`。
- 已验证：全量前端 unit coverage `82 files / 482 tests passed`；总行覆盖率 `76.88%`，`ScheduleBoard.vue` 行覆盖率 `69.20%`。
- 已验证：`npm run lint` 通过。
- 下一步：继续按覆盖率杠杆选择下一条用户关键路径。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
- 当前 `gh` 已登录；GitHub repo/remote 仍需用户确认创建或提供。
