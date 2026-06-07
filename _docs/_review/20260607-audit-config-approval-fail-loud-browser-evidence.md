# 2026-06-07 Review - AuditDecisionReplayPanel 配置审批失败 fail-loud Chromium 证据

## 结论

通过。配置审批接口失败现在能在审计决策回放中 fail-loud，真实 Chromium 已证明基础回放保留、待审批数归零、配置审批错误明确展示。

## 风险

- 本片使用 Playwright route mock 构造 503 响应，验证的是浏览器 UI 行为，不等同于真实后端配置审批服务宕机演练。
- `queryAgentConfigApprovals` 默认仍保留空数组 fallback，避免影响 Admin 侧既有容错；只有审计回放显式启用 fail-loud。
- 工作区存在大量既有脏改动，本 review 只覆盖本切片涉及的 API 同步工具、审计回放调用、e2e 和文档。

## 建议

- 后续继续围绕 `AuditDecisionReplayPanel` 的发布签字相关路径补 Chromium 证据，优先审计签字链路异常。
- B 轨发布闸门继续单独追踪，不能被 A 轨浏览器证据替代。
