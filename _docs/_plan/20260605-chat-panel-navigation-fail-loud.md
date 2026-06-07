# 2026-06-05 ChatPanel Navigation Fail-loud Plan

## Success Criteria

- 普通导航动作失败时不能沉默崩溃。
- `router.push()` 失败必须通过 assertive alert 明确显示失败原因。
- 成功导航路径不受影响。
- 完成后同步 changelog、review、issue、plan、todo 五类文档。

## A-track

- 已完成：`ChatPanel.vue` 普通导航 / `schedule_suggestion` 动作增加失败告警。
- 已完成：新增 unit 覆盖 `打开风险预警` 的导航失败场景。
- 已完成：目标 unit、全量前端 unit、lint 和 build 验证通过。
- 下一步：继续按覆盖率杠杆选择其它低覆盖且用户关键的动作分支，不继续在同一普通导航点上榨边际收益。

## B-track

- Hosted CI、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察仍缺真实外部证据。
- 不用本片前端单测结果替代发布闸门证据。
