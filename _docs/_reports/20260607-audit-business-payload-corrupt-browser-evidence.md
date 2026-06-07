# 2026-06-07 AuditDecisionReplayPanel 业务落库审计载荷损坏 Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理损坏业务落库审计载荷的证据。
- 约束：不扩新功能，只验证既有审计 fail-loud 行为。

## 发现

- `AuditDecisionReplayPanel` 单元测试已覆盖损坏 `newValues` JSON 时的告警和成功回放保留。
- 真实浏览器证据此前覆盖了详情接口失败，但没有覆盖“详情接口成功返回、审计载荷损坏”的审计完整性分支。

## 证据

- 新增 e2e：`业务落库审计载荷损坏时真实浏览器保留成功回放并告警`。
- Chromium route mock 返回：
  - 一条有效 `AgentExecutePurchaseAction` 业务落库审计。
  - 一条 `newValues` 为损坏 JSON 的审计详情。
- 页面验证：
  - 成功采购落库回放仍可见。
  - 回放详情展示 `trace-agent-payload-ok` 和业务写入内容。
  - `.replay-sync-alert` 展示 `业务落库审计详情加载失败`。
  - 告警包含 `audit-agent-payload-broken 审计载荷解析失败`。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计载荷损坏"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
