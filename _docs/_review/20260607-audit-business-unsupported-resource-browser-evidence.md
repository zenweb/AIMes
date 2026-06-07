# 2026-06-07 Review - AuditDecisionReplayPanel 未知业务落库资源 Chromium 证据

## 结论

通过。审计决策回放已补齐真实 Chromium 下未知业务落库资源的证据，覆盖 fail-loud、成功回放保留和未知资源不静默吞掉。

## 风险

- 本片使用 Playwright route mock 构造后端审计响应，验证的是浏览器 UI 行为，不等同于真实后端数据库损坏演练。
- 工作区存在大量既有脏改动，本 review 只覆盖本切片新增 e2e 和文档。

## 建议

- 继续优先补 `AuditDecisionReplayPanel` 的审计签字与配置审批异常分支真实浏览器证据。
- B 轨发布闸门继续单独追踪，不能被 A 轨浏览器证据替代。
