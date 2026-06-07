# 2026-06-07 Demo Smoke 主链路真实浏览器证据

## 范围

- 目标：补齐 5 分钟 Demo 主链路 `Dashboard -> Scheduling -> Audit -> Report` 的真实 Chromium 证据。
- 约束：不扩新功能，不替代 B 轨发布硬门禁。

## 证据

- 运行方式：Nuxt production build + Playwright Chromium。
- 用例：`5 分钟 Demo 主链路 Smoke > Dashboard -> Scheduling -> Audit -> Report 可回放`。
- 覆盖路径：
  - Dashboard 展示 `AI MES 指挥中心` 和 OTD baseline/agent/delta。
  - 点击进入 AI 排产。
  - Scheduling Agent 生成后端建议并采纳推荐。
  - Audit 回放 `WO-RUSH-9001 急单插入重排建议`，展示 `TRACE-SCH-20260520-001`。
  - Report 展示 OTD 改善复盘、p value、5 分钟 Demo 路径和导出步骤。

## 验证

```powershell
npm.cmd run test:e2e -- tests/e2e/demo-smoke.spec.ts -g "Dashboard -> Scheduling -> Audit -> Report"
```

结果：`1 passed`。

说明：首次以 180 秒外层超时运行时在 Nuxt build 阶段被截断；给足 420 秒后，Nuxt production build 完成，Chromium 用例通过。

## 发布门禁边界

- 本报告只关闭 A 轨真实浏览器主链路证据缺口。
- B 轨仍未关闭：
  - PostgreSQL/staging：Docker Desktop Linux engine 当前不可用。
  - Attack Chain A/B/C：缺人工 verifier、时间戳和 A/B/C 证据。
  - Security signoff：仍未人工签字。
  - Gray observation：首次灰度和 14 天 P0/P1=0 观察尚未开始。
