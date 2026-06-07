# 2026-06-05 ScheduleBoard Next Actions

## Done

- 已完成：`ScheduleBoard.vue` 初始排产计划加载失败时，演示排产 fallback warning 带出后端失败原因。
- 已完成：新增目标测试覆盖初始计划 API 失败时 warnings-bar 包含“后端排产服务不可用”“当前显示演示排产数据”和失败原因。
- 已完成：目标 unit、全量前端 coverage 和 lint 验证；`ScheduleBoard.vue` 行覆盖率为 `68.88%`。

## Continue

- 继续：按覆盖率杠杆选择其它低覆盖且用户关键路径。
- 可选：若继续 `ScheduleBoard.vue`，优先审计异步证据读取失败、Agent 建议采纳失败和复杂事件合并边界。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录可用；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
