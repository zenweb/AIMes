# QualityBoard 质量异常告警加载失败真实浏览器证据

日期：2026-06-07

## 目标

补齐质量页异常告警 API 不可用时的真实 Chromium 失败态证据：`/api/v1/anomaly` 返回 503 时，页面必须 fail-loud，并且保留本地 fallback 异常告警，不能显示空告警造成误判。

## 选片依据

- 异常告警是用户进入质量页后直接扫描的基础态信息。
- 后端告警 API 不可用时，如果页面静默或显示空状态，用户会误判当前没有质量异常。
- 本片从已充分覆盖的 QualityBoard 证据写入路径，转向质量页基础加载态，避免继续精修低边际收益切片。

## 本轮变更

- `src/frontend/tests/e2e/quality.spec.ts`
  - 新增真实 Chromium 用例：`质量异常告警加载失败时真实浏览器展示 fail-loud 且保留本地告警`。
  - 关闭 offline demo，并 mock 统计、检验批次、SPC API 成功，隔离 anomaly 失败。
  - 让 `/api/v1/anomaly` 返回 503，验证真实 axios 错误文案和 fallback 告警渲染。

## RED/GREEN 证据

首次 RED：默认 offline demo 让后续 SPC 请求覆盖了 anomaly alert，页面最终显示 `SPC 趋势分析加载失败`。

第二次 RED：关闭 offline demo 后，真实 axios 503 的 `Error.message` 是 `Request failed with status code 503`，不会透传 mocked JSON `title`。

最终 GREEN：

```powershell
npm.cmd run test:e2e -- tests/e2e/quality.spec.ts -g "质量异常告警加载失败"
```

结果：Nuxt production build passed，Chromium `1 passed`。

## 验证点

- 页面显示 `role="alert"`。
- alert 包含 `质量异常告警加载失败`。
- alert 包含真实 axios 503 文案 `Request failed with status code 503`。
- fallback 告警区展示 `装配后轴孔配合间隙 0.12mm，超过 0.08mm 标准上限`。
- fallback 告警区展示 `热处理后硬度 HB89，低于 HB95 标准下限`。
- fallback 告警区展示 `Ra 3.6μm，接近 3.2μm 标准上限，建议监控`。
- 标题显示 `异常告警 (3)`。
- 不显示 `暂无异常告警`。

## 边界

- 本轮未修改产品代码；组件已有 fail-loud 和 fallback 行为，本片只补真实浏览器证据。
- 未全量重跑 `quality.spec.ts`。
- 未关闭 B 轨发布闸门：Hosted CI、PostgreSQL/staging、Attack Chain A/B/C 人工验证、安全签字、首次灰度、14 天 P0/P1=0 仍需单独追踪。
