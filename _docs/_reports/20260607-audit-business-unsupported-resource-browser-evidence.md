# 2026-06-07 AuditDecisionReplayPanel 未知业务落库资源 Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理未知 `businessWrite.resource` 的证据。
- 约束：不扩新功能，只验证既有审计 fail-loud 行为。

## 发现

- 单元测试已覆盖 `businessWrite.resource = warehouse-transfer` 时的告警和成功回放保留。
- 真实浏览器此前缺少该分支证据。
- 该分支与发布签字相关：未知业务落库资源不能被静默过滤，否则审计人员会误以为业务落库链路完整。

## 证据

- 新增 e2e：`业务落库审计资源未知时真实浏览器保留成功回放并告警`。
- Chromium route mock 返回：
  - 一条有效 `purchase-order` 业务落库审计。
  - 一条未知 `warehouse-transfer` 业务落库审计详情。
- 页面验证：
  - 成功采购落库回放仍可见。
  - 回放详情展示 `trace-agent-resource-ok` 和业务写入内容。
  - `.replay-sync-alert` 展示 `业务落库审计详情加载失败`。
  - 告警包含 `audit-agent-resource-unsupported 不支持的业务落库资源：warehouse-transfer`。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "业务落库审计资源未知"
npm.cmd run test:unit -- tests/unit/audit-decision-replay-panel.test.ts -t "business-write resource is unsupported"
```

结果：Vitest 定向用例通过；Nuxt production build passed；Chromium `1 passed`。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
