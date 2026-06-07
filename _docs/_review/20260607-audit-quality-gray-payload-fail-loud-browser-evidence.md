# 2026-06-07 Review - AuditDecisionReplayPanel 质量灰度决策坏载荷 fail-loud Chromium 证据

## 结论

通过。质量灰度决策 200 非数组载荷现在能在审计决策回放中 fail-loud，真实 Chromium 已证明基础回放保留且坏载荷错误明确展示。

## 风险

- 本片使用 Playwright route mock 构造 200 非数组响应，验证的是浏览器 UI 行为，不等同于真实后端坏 payload 演练。
- 运行时数组校验位于质量知识证据通用读取 helper，会覆盖质量样本、复用草案、复用闭环、复核队列、推荐反馈、再训练版本和灰度决策这些 backend-first 读取。
- `readQualityKnowledgeRecordsBackendFirst()` 仍保留“后端失败且本地存在记录时回退本地”的既有策略；本片只确保非数组响应不会被当作正常空数组。
- 工作区存在大量既有脏改动，本 review 只覆盖本切片涉及的质量知识同步工具、审计回放 e2e 和文档。

## 建议

- 后续继续围绕 `AuditDecisionReplayPanel` 的发布/审计可信路径补 Chromium 证据，优先 POC 签署、配置审批或质量推荐反馈的坏载荷形态。
- B 轨发布闸门继续单独追踪，不能被 A 轨浏览器证据替代。
