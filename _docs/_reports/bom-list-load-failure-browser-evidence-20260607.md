# BomBoard BOM 列表加载失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`BomBoard` 首屏 BOM 列表读取失败时的 fail-loud fallback 证据。
- 目标：后端 BOM 列表不可用时，真实浏览器必须明确告警，同时保留本地 BOM 清单，避免用户把 fallback 数据误认为实时后端数据。

## 变更

- `src/frontend/tests/e2e/engineering-data.spec.ts`
  - 新增真实 Chromium 用例：`BOM 列表加载失败时真实浏览器展示 fail-loud fallback`。
  - 用例显式关闭 offline demo，拦截 `/api/v1/bom` 返回 503。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 列表加载失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 页面展示 `BOM 列表加载失败`。
- 告警包含真实浏览器可见的 `Request failed with status code 503`。
- `BOM 列表` listbox 仍可见。
- fallback 列表中保留 `产品A 物料清单` 和 `BOM-A100`。

## 调整记录

- 首次验证发现 e2e 默认 offline demo 会跳过后端请求，route mock 无法命中。
- 第二次验证发现当前 axios 错误提取只向用户展示 503 状态文案，不展示 mock body。
- 最终断言收敛为用户真实可见的 503 fail-loud 行为。

## 结论

- `BomBoard` BOM 列表加载失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud fallback 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
