# 2026-06-05 ScheduleBoard Fail-loud Plan

## Success Criteria

- 初始排产计划加载失败时，必须保留可用的演示排产 fallback。
- 初始排产计划加载失败时，必须通过 warnings-bar 明确说明当前显示的是演示排产。
- 同一提示必须包含后端失败原因，避免泛化提示掩盖真实故障。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：新增红灯测试覆盖 `api.getCurrentPlan()` 失败时 fallback warning 必须包含后端失败原因。
- 已完成：修复 `ScheduleBoard.vue`，将 `errorMessage(e)` 写入演示排产 fallback warning。
- 已验证：目标 unit `1 file / 12 tests passed`。
- 已验证：全量前端 unit coverage `82 files / 480 tests passed`；总行覆盖率 `76.85%`，`ScheduleBoard.vue` 行覆盖率 `68.88%`。
- 已验证：`npm run lint` 通过。
- 下一步：按覆盖率杠杆继续选择低覆盖且用户关键的组件，或等待 GitHub repo/remote 口径后推进 B-track hosted CI。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
- 当前 `gh` 已登录；GitHub repo/remote 仍需用户确认创建或提供。
