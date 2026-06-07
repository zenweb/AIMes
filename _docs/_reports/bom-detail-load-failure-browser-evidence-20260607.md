# BomBoard BOM 详情加载失败真实浏览器证据报告

日期：2026-06-07

## 范围

- A 轨质量切片：`BomBoard` 列表可读、点击 BOM 详情时后端读取失败的 fail-loud fallback 证据。
- 目标：详情接口不可用时，真实浏览器必须明确告警，同时展示本地 BOM 详情和排产约束信息，避免详情面板空白。

## 变更

- `src/frontend/tests/e2e/engineering-data.spec.ts`
  - 新增真实 Chromium 用例：`BOM 详情加载失败时真实浏览器展示 fail-loud fallback`。
  - 用例显式关闭 offline demo，mock BOM 列表成功、`/api/v1/bom/bom-1` 返回 503。

## 验证

- `npm.cmd run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 详情加载失败"`
  - Nuxt production build passed。
  - Chromium 1/1 passed。

## 断言覆盖

- 页面展示 `BOM 详情加载失败`。
- 告警包含真实浏览器可见的 `Request failed with status code 503`。
- 详情标题仍显示 `产品A 物料清单`。
- 本地 fallback 详情仍展示 `BOM 排产约束源`。
- 关键约束 `M-AL-6061 缺料会冻结 CNC 后段` 仍可见。

## 结论

- `BomBoard` BOM 详情加载失败路径已有真实浏览器证据。
- 本片未修改生产代码，只补齐既有 fail-loud fallback 行为的 Chromium 证据。
- B 轨发布闸门仍未关闭：hosted CI、PostgreSQL/staging、Attack Chain 人工验证、安全签字、首次灰度和 14 天观察仍需单独证据。
