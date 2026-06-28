# 2026-06-14 BOM 齐套包发布锁定与 OTD 证据链

## 变更
- `BomBoard.vue` 在 BOM 齐套检查包发布成功后，按钮改为锁定态，避免重复发布同一包。
- 保持发布成功后继续写入 OTD 证据链的现有行为不变。
- 新增单测覆盖“发布后锁定 + OTD 证据链写入”。
- 在真实浏览器工程数据链路中补充锁定态断言。

## 验证
- `npm run test:unit -- tests/unit/bom-board.test.ts`
- `npm run test:e2e -- tests/e2e/engineering-data.spec.ts -g "BOM 展开齐套检查包进入库存齐套排产和 OTD 审计" --project=chromium`
- `npm run test:unit:coverage`

