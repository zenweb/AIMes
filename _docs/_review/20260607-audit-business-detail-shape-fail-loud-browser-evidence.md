# 2026-06-07 Review - AuditDecisionReplayPanel 业务落库审计详情坏形状 fail-loud Chromium 证据

## 结论

通过。业务落库审计详情 `200` 但返回非详情对象时，现在能在审计决策回放中 fail-loud，真实 Chromium 已证明成功回放保留且坏详情载荷错误明确展示。

## 风险

- 本片使用 Playwright route mock 构造 `200 + { items: [] }` 响应，验证的是浏览器 UI 行为，不等同于真实后端坏 payload 演练。
- 运行时校验是详情对象基本形状校验，不是完整 schema 验证；`newValues` 内容仍由既有解析和坏载荷测试覆盖。
- 当前工作区已有大量既有脏改动，本 review 只覆盖本切片涉及的审计回放组件、单元/e2e 和文档。

## 建议

- 后续继续围绕 `AuditDecisionReplayPanel` 的发布/审计可信路径补真实浏览器证据，优先选择能通过公开 API route 稳定触发的异常。
- B 轨发布闸门继续单独追踪，不能被 A 轨浏览器证据替代。
