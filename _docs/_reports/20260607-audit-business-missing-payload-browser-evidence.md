# 2026-06-07 AuditDecisionReplayPanel 业务落库审计载荷缺失 Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理缺失业务落库审计载荷的证据。
- 约束：不扩新功能，只验证既有审计 fail-loud 行为和成功回放保留。

## 发现

- `AuditDecisionReplayPanel` 单元测试已覆盖业务落库审计 `newValues` 缺失时的告警和成功回放保留。
- 真实浏览器证据此前覆盖了业务落库载荷损坏和不支持资源，但没有覆盖“详情接口成功返回、审计载荷为空”的审计完整性分支。

## 证据

- 新增 e2e：`业务落库审计载荷缺失时真实浏览器保留成功回放并告警`。
- Chromium route mock 返回：
  - 一条有效 `AgentExecutePurchaseAction` 采购收货业务落库审计。
  - 一条 `newValues: null` 的业务落库审计详情。
- 页面验证：
  - 成功采购落库回放仍可见。
  - 回放详情展示 `trace-agent-missing-payload-ok` 和业务写入内容。
  - `.replay-sync-alert` 展示 `业务落库审计详情加载失败`。
  - 告警包含 `audit-agent-missing-payload 审计载荷缺失`。

## 验证

```powershell
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "payload is missing"
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计载荷缺失"
```

结果：单元定向用例通过；Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
