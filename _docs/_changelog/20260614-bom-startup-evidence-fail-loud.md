# 2026-06-14 BOM 启动工程证据 Fail-Loud

## 变更
- `BomBoard.vue` 启动时改为逐项读取替代料确认、ECN 影响分析、BOM 齐套包证据。
- 任一启动工程证据源失败时，汇总显示 `BOM 工程证据加载失败`，但继续加载 BOM 主列表。
- 新增单测覆盖启动工程证据失败时列表仍可用。
- 新增 Chromium 真实浏览器用例覆盖本地工程证据存储不可用时的 fail-loud 与列表可操作性。

## 验证
- RED：`npm run test:unit -- tests/unit/bom-board.test.ts` 曾失败，确认旧代码会因 mounted hook 异常阻断 `getBomList`。
- GREEN：`npm run test:unit -- tests/unit/bom-board.test.ts`，10 passed。
- GREEN：`npm run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 启动工程证据同步失败" --project=chromium`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/engineering-data.spec.ts --project=chromium`，13 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 683 tests passed，lines 83.13%，`BomBoard.vue` lines 78.60%。

## 备注
- 15 天灰度观察按 owner 指令跳过/延期，不作为本轮继续工作的阻塞项。
