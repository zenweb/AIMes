# 2026-06-05 EngineeringConstraintPanel Next Actions

## Done

- 已完成：`EngineeringConstraintPanel.vue` 工程约束证据写入失败时 fail loud，避免同步失败只表现为未处理异常。
- 已完成：新增目标测试覆盖 OTD 证据链写入失败时保留工程约束解释、显示 assertive alert 和失败原因。
- 已完成：目标 unit、全量前端 coverage 和 lint 验证。

## Continue

- 继续：按“覆盖率最低且用户必经/高风险”原则选择后续切片。
- 继续：优先审计低覆盖且连接排产、审计、质量或风险证据链的现有组件。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 当前 `gh` 登录和 Docker 可用，但仓库 remote 未绑定 GitHub，Hosted CI 仍不能关闭。
