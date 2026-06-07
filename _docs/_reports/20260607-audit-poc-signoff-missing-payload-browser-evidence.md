# 2026-06-07 AuditDecisionReplayPanel POC 复盘签署载荷缺失 Chromium 证据

## 范围

- 目标：补齐审计决策回放在真实 Chromium 下处理 POC 复盘签署载荷缺失的证据。
- 约束：不扩新功能，只验证既有签署审计 fail-loud 行为和基础回放保留。

## 发现

- `AuditDecisionReplayPanel` 单元测试已覆盖 POC 复盘签署载荷缺失时的告警和基础回放保留。
- 真实浏览器证据此前只有 POC 复盘签署成功链路，缺少“后端返回签署记录但审计载荷字段不完整”的发布签字异常证据。

## 证据

- 新增 e2e：`POC 复盘签署载荷缺失时真实浏览器保留基础回放并告警`。
- Chromium route mock 返回：
  - `/api/v1/scheduling/poc-review-signoff/latest` 返回缺少 `reviewers` 和 `evidenceBatches` 的签署记录。
  - 其它无关审计依赖返回空成功响应，避免噪声告警掩盖目标断言。
- 页面验证：
  - 基础回放卡片 `WO-RUSH-9001 急单插入重排建议` 仍可见。
  - 缺失载荷签署记录 `AUD-POC-REVIEW-MISSING-PAYLOAD` 不生成回放卡片。
  - `.replay-sync-alert` 展示 `POC 复盘签署加载失败`。
  - 告警包含 `poc-review-signoff-missing-payload 复盘签署审计载荷缺失`。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts -g "POC 复盘签署载荷缺失"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 过程记录

- 首次定向 e2e 失败，因为未关闭 `aimes_offline_demo`，请求在 axios request interceptor 中被跳过，未命中 POC 签署 mock。
- 修正：显式设置 `aimes_offline_demo=false`，并将无关接口 mock 成成功空响应。

## 未关闭项

- 本切片只补 A 轨真实浏览器证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度、14 天 P0/P1=0。
