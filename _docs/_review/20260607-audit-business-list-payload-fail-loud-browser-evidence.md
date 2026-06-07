# 2026-06-07 Review - AuditDecisionReplayPanel 业务落库审计列表坏载荷 fail-loud Chromium 证据

## 结论

通过。业务落库审计列表 `items` 非数组时现在能在审计决策回放中 fail-loud，真实 Chromium 已证明基础回放保留且坏载荷错误明确展示。

## 风险

- 本片使用 Playwright route mock 构造 200 非数组响应，验证的是浏览器 UI 行为，不等同于真实后端坏 payload 演练。
- 修复点位于 `AuditDecisionReplayPanel` 的业务落库审计读取函数，只影响该面板对 Agent execute 审计列表的处理。
- 当前工作区已有大量既有脏改动，本 review 只覆盖本切片涉及的审计回放组件、单元/e2e 和文档。

## 建议

- 后续继续围绕 `AuditDecisionReplayPanel` 的发布/审计可信路径补 Chromium 证据，优先审计详情对象形状或 POC 发布包异常。
- B 轨发布闸门继续单独追踪，不能被 A 轨浏览器证据替代。
