# 2026-06-15 BOM kitting OTD sync fail-loud lock

- 加固 `BomBoard.vue` 的 BOM 齐套检查包发布流程：`writeBomKittingPackage` 成功后立即锁定主包发布状态，避免后续 OTD 证据链同步失败时让操作员重复点击并重复写入齐套包/审计证据。
- 将 OTD 证据链同步失败拆成独立 fail-loud 提示：界面显示“BOM 齐套检查包已发布，但 OTD 证据链同步失败”，同时保留已发布状态和禁用按钮。
- 新增单测 `locks the BOM kitting package when OTD evidence sync fails so operators do not duplicate the release`，覆盖主动作成功、证据链失败时的锁定行为。

验证：
- `npm run test:unit -- tests/unit/bom-board.test.ts --reporter=dot`：19/19 passed。
- `npm run test:unit:coverage -- --reporter=dot`：111 files / 968 tests passed。
- 覆盖率总计：Lines 90.48%，Statements 87.21%，Branches 73.70%，Functions 86.50%。
