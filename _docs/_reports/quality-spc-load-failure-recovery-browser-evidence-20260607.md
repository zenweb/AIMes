# QualityBoard SPC 趋势分析加载失败恢复真实浏览器证据

日期：2026-06-07

## 目标

补齐质量页 SPC 趋势分析 API 不可用时的真实 Chromium 失败态和恢复态证据：`/api/v1/quality/spc/analyze` 返回 503 时页面必须 fail-loud 并展示 fallback 图点；后续切换参数且 API 成功时，必须清理 stale alert 并展示后端数据。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`SPC 趋势分析加载失败后真实浏览器展示 fallback 并在后续成功时清理告警`。
  - 关闭 offline demo，并 mock 统计、检验批次、异常 API 成功，隔离 SPC 失败。
  - 首次 `surface_roughness` SPC 请求返回 503；切换 `hardness` 后返回 3 个后端数据点。

## GREEN 证据

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "SPC 趋势分析加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 初次加载显示 `role="alert"`。
- alert 包含 `SPC 趋势分析加载失败`。
- alert 包含真实 axios 503 文案 `Request failed with status code 503`。
- fallback SPC 图显示 24 个点。
- 不显示 `.spc-empty-state`。
- 切换到 `hardness` 后 alert 消失。
- 后续成功态 SPC 图显示 3 个后端数据点。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud、fallback 和 stale alert 清理行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
