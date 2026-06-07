# AuditDecisionReplayPanel 真实浏览器证据自审

日期：2026-06-06

## 发现

- 本轮真实 Chromium e2e 未发现审计回放关键路径失败。
- 组件已有单测覆盖多条 fail-loud 路径：业务落库审计加载失败、审计详情失败、载荷解析失败、配置审批失败、POC 复盘签署载荷缺失、质量灰度决策非数组等。
- 继续在该组件上做盲目微切片风险较高，容易变成低收益覆盖率填充。

## 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/audit.spec.ts
```

- 12/12 passed。
- 生产构建成功。

## 风险

- 这是本地项目 Playwright/Chromium 证据，不等于 hosted CI 证据。
- 该证据不覆盖真实 staging 数据库、不覆盖人工安全签字、不覆盖灰度观察。
- 下一步应转向仍缺少真实浏览器证据或失败路径证据的用户必经组件。
