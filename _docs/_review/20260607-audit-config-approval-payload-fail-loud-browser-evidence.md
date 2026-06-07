# 2026-06-07 Review - AuditDecisionReplayPanel 配置审批坏载荷 fail-loud Chromium 证据

## 结论

通过。配置审批 200 非数组载荷现在能在审计决策回放中 fail-loud，真实 Chromium 已证明基础回放保留且坏载荷错误明确展示。

## 风险

- 本片使用 Playwright route mock 构造 200 非数组响应，验证的是浏览器 UI 行为，不等同于真实后端坏 payload 演练。
- `readAgentConfigApprovalsBackendFirst()` 默认非 fail-loud 调用仍保持本地审批 fallback，避免影响 Admin 侧既有容错。
- 当前工作区已有大量既有脏改动，本 review 只覆盖本切片涉及的配置审批同步工具、审计回放单元/e2e 和文档。

## 建议

- 后续继续围绕 `AuditDecisionReplayPanel` 的发布/审计可信路径补 Chromium 证据，优先 POC 签署坏载荷或业务落库审计异常。
- B 轨发布闸门继续单独追踪，不能被 A 轨浏览器证据替代。
