# InventoryBoard Operation Dialog A11y Browser Evidence - 2026-06-06

## Scope

- A 轨：库存管理既有操作弹窗可访问语义和真实浏览器可达性。
- B 轨：仅记录未完成，不在本片消除。

## Evidence

- Coverage route signal：`InventoryBoard.vue` coverage 为 70.58% statements / 43.24% functions / 75.93% lines，属于用户关键且仍有增量空间的组件。
- RED unit：缺少 `[role="dialog"]` 时 `focuses the stock operation dialog` 失败。
- GREEN unit：`tests/unit/inventory-board.test.ts` 5/5 passed。
- RED Chromium e2e：`库存操作弹窗支持 Escape 关闭并回到入库按钮` 失败，日志显示 `.kitting-panel` 拦截物料点击。
- GREEN Chromium e2e：同用例完整 Nuxt production build 后 Chromium 1/1 passed。

## Release Gate

- FAIL：hosted CI、PostgreSQL/staging、Attack Chain manual verification、安全签字、首次灰度、14 天 P0/P1=0 观察仍缺。
