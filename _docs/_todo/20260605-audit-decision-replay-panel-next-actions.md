# 2026-06-05 AuditDecisionReplayPanel Next Actions

## Done

- 已完成：`AuditDecisionReplayPanel.vue` 配置审批加载失败时 fail loud，避免配置审批同步失败被误判为 0 个待审批。
- 已完成：新增目标测试覆盖 `readAgentConfigApprovalsBackendFirst()` 失败时保留基础回放卡片、显示 assertive alert 和失败原因。
- 已完成：mounted 阶段其它 backend-first 审计来源改为来源级捕获，避免单个来源失败打断整页审计回放。
- 已完成：`AuditDecisionReplayPanel.vue` 业务落库审计列表 API 失败时 fail loud，避免 Agent 业务写入审计失败被误判为没有回放。
- 已完成：新增目标测试覆盖 `getAuditLogs()` 失败时保留基础回放卡片、显示“业务落库审计加载失败”和失败原因。
- 已完成：`AuditDecisionReplayPanel.vue` 单个业务落库动作类型 API 失败时保留其它成功回放，避免部分失败冲掉已有业务写入证据。
- 已完成：新增目标测试覆盖采购落库回放成功、质量动作 API 失败时仍显示采购回放并 fail loud。
- 已完成：`AuditDecisionReplayPanel.vue` 单条业务落库审计详情失败时 fail loud，避免详情缺失被静默吞掉。
- 已完成：新增目标测试覆盖一个审计详情成功、一个详情失败时仍显示成功业务落库回放并提示“业务落库审计详情加载失败”。
- 已完成：`AuditDecisionReplayPanel.vue` 单条业务落库审计详情载荷损坏时 fail loud，避免损坏 `newValues` 被静默当成没有业务写入。
- 已完成：新增目标测试覆盖一个审计详情载荷合法、一个详情载荷损坏时仍显示成功业务落库回放并提示损坏 audit id。
- 已完成：`AuditDecisionReplayPanel.vue` 未知业务落库资源 fail loud，避免新增/异常业务写入资源被静默过滤。
- 已完成：新增目标测试覆盖一个采购业务落库详情成功、一个未知资源详情失败时仍显示成功回放并提示不支持的资源类型。
- 已完成：`AuditDecisionReplayPanel.vue` 业务落库审计详情载荷缺失 fail loud，避免空 `newValues` 被静默过滤。
- 已完成：新增目标测试覆盖一个采购业务落库详情成功、一个载荷缺失详情失败时仍显示成功回放并提示缺失 audit id。
- 已完成：目标 unit、全量前端 coverage 和 lint 验证。

## Continue

- 继续：按“覆盖率最低且用户必经/高风险”原则选择后续切片；`AuditDecisionReplayPanel.vue` 当前行覆盖率为 `64.81%`。
- 继续：优先审计 POC 签署、质量推荐等发布/合规相关来源的 fail-loud 测试。

## B-track

- 仍需真实 GitHub Actions run、staging rehearsal、Attack Chain A/B/C、安全签字、首次灰度和 14 天无 P0/P1 观察证据。
- 已确认：`gh` 登录和 Docker 可用，根 `.github/workflows/ci.yml` / `eval.yml` 存在；仍缺 GitHub repo/remote 绑定，当前 `origin` 指向腾讯工蜂。
