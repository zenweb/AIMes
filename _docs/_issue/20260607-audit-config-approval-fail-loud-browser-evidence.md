# 2026-06-07 Issue - 配置审批接口失败被审计回放静默吞掉

## 问题

`AuditDecisionReplayPanel` 组件层已有配置审批加载失败告警，但真实浏览器下 `/api/v1/scheduling/agent-config-approvals` 返回 503 时没有展示 `.replay-sync-alert`。

## 根因

`queryAgentConfigApprovals()` 在 API 层捕获错误并返回 `[]`，导致审计回放无法区分“后端无审批记录”和“配置审批接口失败”。

## 影响

配置审批属于发布签字相关路径。接口失败如果被静默吞掉，会让审计回放看起来正常，但实际丢失关键审批证据。

## 处理

- 为配置审批查询增加可选 fail-loud 模式。
- 审计回放读取配置审批时启用 fail-loud。
- 新增真实 Chromium e2e 验证接口失败时保留基础回放并展示配置审批加载失败。

## 状态

已通过同步工具单元、组件定向单元和真实 Chromium e2e。
