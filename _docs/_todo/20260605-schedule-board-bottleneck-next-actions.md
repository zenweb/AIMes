# 2026-06-05 ScheduleBoard Bottleneck Next Actions

## Done

- 已完成：`ScheduleBoard.vue` 瓶颈设备读取失败时 fail loud。
- 已完成：新增目标测试覆盖瓶颈设备 API 失败时 warnings-bar 包含“瓶颈设备识别失败”和失败原因。
- 已完成：同一测试确认页面不进入演示排产 fallback，也不显示阻断 error banner。
- 已完成：目标 unit 验证，`1 file / 13 tests passed`。
- 已完成：全量前端 unit coverage 验证，`82 files / 482 tests passed`；`ScheduleBoard.vue` 行覆盖率 `69.20%`。
- 已完成：`npm run lint` 通过。

## Continue

- 继续：按覆盖率杠杆选择其它低覆盖且用户关键路径，不继续在已收口组件上做低收益微切片。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录可用；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
