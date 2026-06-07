# 2026-06-07 Issue - 助手动作审计非数组载荷被审计回放静默吞掉

## 问题

`AuditDecisionReplayPanel` 组件层已有助手动作审计非数组载荷告警，但真实浏览器下 `/api/v1/scheduling/assistant-action-audits` 返回 `{ items: [] }` 时没有展示 `.replay-sync-alert`。

## 根因

`readAssistantActionAuditsBackendFirst()` 缺少运行时数组校验。TypeScript 泛型只在编译期生效，真实 200 响应里的非数组载荷会被当作空结果 fallback 到本地审计。

## 影响

助手动作审计属于 AI 助手执行链路的审计证据。坏载荷如果被静默吞掉，审计回放会看起来像“没有助手动作证据”，而不是暴露后端载荷异常。

## 处理

- 为助手动作审计查询增加可选 fail-loud 模式。
- 审计回放读取助手动作审计时启用 fail-loud。
- 为 backend-first 同步工具增加运行时数组校验。
- 新增真实 Chromium e2e 验证非数组载荷时保留基础回放并展示助手动作审计加载失败。

## 状态

已通过助手动作审计工具单元、组件定向单元和真实 Chromium e2e。
