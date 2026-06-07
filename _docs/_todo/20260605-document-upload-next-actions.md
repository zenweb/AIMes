# 2026-06-05 DocumentUpload Next Actions

## Done

- 已完成：`DocumentUpload.vue` 客户工单导入证据后端刷新失败时 fail loud。
- 已完成：新增目标测试覆盖后端刷新失败时 assertive alert 包含“客户工单导入证据刷新失败”和失败原因。
- 已完成：同一测试确认客户工单导入面板仍显示本地空状态。
- 已完成：目标 unit 验证，`1 file / 13 tests passed`。
- 已完成：全量前端 unit coverage 验证，`82 files / 481 tests passed`；`DocumentUpload.vue` 行覆盖率 `64.89%`。
- 已完成：`npm run lint` 通过。

## Continue

- 继续：按覆盖率杠杆选择其它低覆盖且用户关键路径，不继续在已收口组件上做低收益微切片。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录可用；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
