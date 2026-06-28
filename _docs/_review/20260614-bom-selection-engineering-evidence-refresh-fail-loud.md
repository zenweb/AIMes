# 2026-06-14 Review - BOM 选择工程证据刷新 Fail-Loud

## 结论
- 未发现本轮改动引入的阻塞问题。
- 选择 BOM 时，辅助工程证据刷新失败不再阻断详情加载，符合“精品级现有功能”约束。

## 审计范围
- `src/frontend/src/components/bom/BomBoard.vue`
- `src/frontend/tests/unit/bom-board.test.ts`
- `src/frontend/tests/e2e/engineering-data.spec.ts`
- 本切片新增 5 类文档

## 关注点
- 当前文件 diff 中还包含前序已验证的 BOM 启动工程证据 fail-loud 与 BOM 齐套包锁定改动；本 review 只覆盖“选择 BOM 时工程证据刷新失败仍可打开详情”增量。
- `npm run test:unit:coverage` 仍输出既有 `--localstorage-file was provided without a valid path` warning；测试通过，但脚本告警应另开切片处理。

## 已验证
- RED focused unit 已确认旧路径中断 `getBomById`。
- BOM 单测 12 passed。
- 工程数据 Chromium e2e 14 passed。
- 前端全量 unit coverage 105 files / 772 tests passed。
