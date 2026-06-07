# QualityBoard 根因分析加载失败真实浏览器证据

日期：2026-06-07

## 目标

补齐质量页根因分析 API 不可用时的真实 Chromium 失败态证据：点击检验批次 `根因分析` 时，如果 `/api/v1/quality/inspections/{id}/analyze` 返回 503，页面必须 fail-loud，并展示本地 fallback 根因分析。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`根因分析加载失败时真实浏览器展示 fail-loud 且保留 fallback 分析`。
  - 关闭 offline demo，并 mock 统计、检验批次、异常、SPC API 成功，隔离根因分析失败。
  - 对 `INS-ROOT-FAIL` 根因分析请求返回 503。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "根因分析加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面展示 `WO-ROOT-FAIL` 检验行。
- 点击 `查看 INS-ROOT-FAIL 根因分析` 后显示 `role="alert"`。
- alert 包含 `根因分析加载失败`。
- alert 包含真实 axios 503 文案 `Request failed with status code 503`。
- 根因分析 dialog 仍展示 `根因分析 — INS-ROOT-FAIL`。
- fallback 根因包含 `刀具磨损超差`、`冷却液温度偏高`、`来料硬度波动`。
- fallback 摘要包含 `主要根因为刀具磨损导致表面粗糙度超差`。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 和 fallback 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
