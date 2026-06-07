# RoutingBoard 工艺路线详情加载失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`RoutingBoard` 用户选择工艺路线后详情读取失败时的 fail-loud fallback 证据。
- 目标：工艺路线详情接口不可用时，真实浏览器必须明确告警，同时保留本地演示详情和工序，避免用户把 fallback 工序当作实时后端约束。

## 变更

- `src/frontend/tests/e2e/routing.spec.ts`
  - 新增真实 Chromium 用例：`工艺路线详情加载失败时真实浏览器展示 fail-loud fallback`。
  - 用例让列表接口返回 `R-A100`，拦截 `/api/v1/routing/r-1` 返回 503。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/routing.spec.ts -g "工艺路线详情加载失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 用户点击 `精密轴承组件工艺路线` 后触发真实详情请求失败路径。
- 页面展示 `工艺路线详情加载失败`。
- 告警具备 `aria-live="assertive"`。
- 告警包含真实浏览器可见的 `chromium routing detail API unavailable`。
- 详情面板仍展示 `精密轴承组件工艺路线`、`工序列表 (4)` 和 `车削加工`。

## 结论

- `RoutingBoard` 工艺路线详情加载失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud fallback 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
