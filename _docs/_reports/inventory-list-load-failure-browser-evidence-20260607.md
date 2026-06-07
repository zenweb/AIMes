# InventoryBoard 库存列表加载失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`InventoryBoard` 首屏库存列表读取失败时的 fail-loud fallback 证据。
- 目标：库存列表接口不可用时，真实浏览器必须明确告警，同时保留本地演示物料，避免用户看到空白页或静默失败。

## 变更

- `src/frontend/tests/e2e/inventory.spec.ts`
  - 新增真实 Chromium 用例：`库存列表加载失败时真实浏览器展示 fail-loud fallback`。
  - 用例显式关闭 offline demo，拦截 `/api/v1/inventory` 返回 503。
  - 同时为 `/api/v1/inventory/dashboard` 提供稳定 dashboard 响应，隔离列表失败路径。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/inventory.spec.ts -g "库存列表加载失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 页面展示 `库存列表加载失败`。
- 告警包含真实浏览器可见的 `chromium inventory list API unavailable`。
- `物料库存列表` listbox 仍可见。
- fallback 列表中保留 `轴承钢圈` 和 `MAT-A01`。

## 调整记录

- 首次验证发现当前 `InventoryBoard` 会透出接口响应里的 `message`，不同于 BOM 路径的 axios 通用 503 文案。
- 最终断言收敛为用户真实可见的 fail-loud 文案，不按其他组件错误文案硬套。

## 结论

- `InventoryBoard` 库存列表加载失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud fallback 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
