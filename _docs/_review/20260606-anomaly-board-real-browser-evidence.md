# AnomalyBoard 真实浏览器证据自审

日期：2026-06-06

## 发现

- 本轮真实 Chromium e2e 未发现现场事件中心关键路径失败。
- 已验证质量、设备、物料三类异常分流能进入下游风险、排产、库存、采购、设备、报表和审计回放链路。
- 没有证据表明需要继续围绕该路径反复试错。

## 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/anomaly.spec.ts
```

- 5/5 passed。
- 生产构建成功。

## 风险

- 这是本地项目 Playwright/Chromium 证据，不等于 hosted CI。
- 未覆盖 staging PostgreSQL、人工安全签字、Attack Chain 人工验证或灰度观察。
- 后续若继续补 `AnomalyBoard`，应基于单测覆盖缺口或真实失败路径，而不是重复跑同一条浏览器绿灯。
