# 2026-06-14 BOM 选择工程证据刷新 Fail-Loud

## 变更
- `BomBoard.vue` 在选择 BOM 时改为逐项刷新替代料确认、ECN 影响分析、BOM 齐套包三类工程证据。
- 任一工程证据刷新失败时，汇总显示 `BOM 工程证据刷新失败`，并继续加载所选 BOM 详情。
- 新增单测覆盖选择 BOM 时三类工程证据刷新失败仍会调用 `getBomById`。
- 新增 Chromium 真实浏览器用例覆盖选择第二条 BOM 时 ECN 影响分析刷新失败仍打开详情并 fail-loud。

## 验证
- RED：`npm run test:unit -- tests/unit/bom-board.test.ts -t "keeps BOM detail selection usable when engineering evidence refresh fails"` 曾失败，确认旧代码会在工程证据刷新异常后中断 `getBomById`。
- GREEN：`npm run test:unit -- tests/unit/bom-board.test.ts -t "keeps BOM detail selection usable when engineering evidence refresh fails"`，1 passed。
- GREEN：`npm run test:unit -- tests/unit/bom-board.test.ts`，12 passed。
- GREEN：`npm run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 选择时工程证据刷新失败仍打开详情并 fail-loud" --project=chromium`，1 passed。
- GREEN：`npm run test:e2e -- tests/e2e/engineering-data.spec.ts --project=chromium`，14 passed。
- GREEN：`npm run test:unit:coverage`，105 files / 772 tests passed，lines 84.05%，`BomBoard.vue` lines 79.73%。

## 备注
- 本轮不扩大 BOM 功能范围，只硬化已存在的 BOM 详情选择路径。
- 15 天灰度观察按 owner 指令跳过/延期，不作为当前继续推进的阻塞项。
- 当前 coverage 输出仍有既有 warning：`--localstorage-file was provided without a valid path`，本切片未处理该脚本级告警。
