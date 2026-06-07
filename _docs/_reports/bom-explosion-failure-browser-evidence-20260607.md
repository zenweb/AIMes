# BomBoard BOM 展开失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`BomBoard` BOM 详情已打开、点击 `爆炸展开` 时后端展开接口失败的 fail-loud fallback 证据。
- 目标：BOM 展开接口不可用时，真实浏览器必须明确告警，同时展示本地展开树，避免物料展开链路中断。

## 变更

- `src/frontend/tests/e2e/engineering-data.spec.ts`
  - 新增真实 Chromium 用例：`BOM 展开失败时真实浏览器展示 fail-loud fallback`。
  - 用例显式关闭 offline demo，mock BOM 列表和详情成功、`/api/v1/bom/bom-1/explode` 返回 503。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 展开失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 页面展示 `BOM 展开失败`。
- 告警包含真实浏览器可见的 `Request failed with status code 503`。
- 本地 fallback 展开区仍显示 `物料展开`。
- fallback 树中保留 `MAT-A01` 和 `轴承钢圈`。

## 结论

- `BomBoard` BOM 展开失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud fallback 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
