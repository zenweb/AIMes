# 2026-06-14 Purchase 详情陈旧告警清理

## 变更
- `PurchaseBoard.vue` 将启动证据同步告警与当前操作告警拆开维护，再组合展示到同一个 `role="alert"`。
- 采购订单详情首次加载失败后，后续成功选择另一张采购单时会清理陈旧的 `采购订单详情加载失败`。
- 启动阶段供应网络等证据同步失败告警仍会保留，不被成功详情选择误删。
- 新增单测和 Chromium 真实浏览器用例覆盖该交互链路。

## 验证
- RED：`npm run test:unit -- tests/unit/purchase-board.test.ts -t "clears stale purchase detail failure"` 曾失败，确认旧实现会残留详情失败告警。
- GREEN：`npm run test:unit -- tests/unit/purchase-board.test.ts -t "clears stale purchase detail failure"`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/purchase.spec.ts -g "详情加载失败后再次选择成功" --project=chromium`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/purchase-board.test.ts`，23 passed。
- GREEN：`npm run test:e2e -- tests/e2e/purchase.spec.ts --project=chromium`，12 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 773 tests passed，lines 84.06%，`PurchaseBoard.vue` lines 78.50%。

## 备注
- 本轮不新增采购功能，只硬化现有采购详情选择路径的告警正确性。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前继续推进阻塞项。
- coverage 仍输出既有 warning：`--localstorage-file was provided without a valid path`，本切片未处理该脚本级告警。
