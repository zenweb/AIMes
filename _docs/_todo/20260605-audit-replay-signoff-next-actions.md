# 2026-06-05 Audit Replay Signoff Next Actions

## Done

- 已完成：`AuditDecisionReplayPanel.vue` POC 复盘签署 malformed payload fail loud。
- 已完成：新增目标测试覆盖签署载荷缺少 replay 必需数组时 assertive alert 包含“POC 复盘签署加载失败”和记录标识。
- 已完成：同一测试确认基础回放卡仍可见。
- 已完成：目标 unit 验证，`1 file / 12 tests passed`。
- 已完成：全量前端 unit coverage 验证，`82 files / 483 tests passed`；`AuditDecisionReplayPanel.vue` 行覆盖率 `65.32%`。
- 已完成：`npm run lint` 通过。

## Continue

- 继续：按覆盖率杠杆选择其它低覆盖且用户关键路径，优先发布证据链和用户必经路径。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录可用；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
